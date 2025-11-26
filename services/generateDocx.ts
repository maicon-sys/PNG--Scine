import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  TableOfContents, 
  Footer, 
  AlignmentType, 
  PageNumber, 
  PageBreak,
  Header,
  ImageRun
} from "docx";
import { PlanSection, ProjectAsset } from "../types";

// Função auxiliar para processar texto Markdown simples (Negrito e quebras de linha)
const parseTextToRuns = (text: string): TextRun[] => {
  const parts = text.split(/(\*\*.*?\*\*)/g); // Separa por negrito (**texto**)
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
      });
    }
    return new TextRun({ text: part });
  });
};

// Converte Base64 para Uint8Array para o docx
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Função para converter conteúdo Markdown em Parágrafos DOCX
const convertMarkdownToDocx = (markdown: string, assets: ProjectAsset[]): Paragraph[] => {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "" })); // Linha em branco
      return;
    }

    // 1. Verifica se é uma imagem: ![alt](src)
    const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const src = imgMatch[2];
      
      // Verifica se é um asset interno (asset://ID)
      if (src.startsWith('asset://')) {
        const assetId = src.replace('asset://', '');
        const asset = assets.find(a => a.id === assetId);

        if (asset && asset.data) {
          try {
            const imageBuffer = base64ToUint8Array(asset.data);
            
            // Determina dimensões básicas (limitadas para caber na A4)
            // Idealmente leríamos as dimensões reais, mas 500px de largura é seguro para A4
            paragraphs.push(new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 500,
                    height: 300, // Altura fixa para evitar distorção extrema se não soubermos aspect ratio, ou ajustável
                  },
                  // Tenta detectar tipo, mas docx geralmente infere ou aceita genericamente
                  type: "png", 
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }));
            return; // Pula o processamento de texto desta linha
          } catch (e) {
            console.error("Erro ao converter imagem para DOCX:", e);
            // Fallback para texto se falhar
          }
        }
      }
    }

    // 2. Headers
    if (trimmed.startsWith('# ')) {
      paragraphs.push(new Paragraph({ 
        children: parseTextToRuns(trimmed.substring(2)), 
        heading: HeadingLevel.HEADING_1 
      }));
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({ 
        children: parseTextToRuns(trimmed.substring(3)), 
        heading: HeadingLevel.HEADING_2 
      }));
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(new Paragraph({ 
        children: parseTextToRuns(trimmed.substring(4)), 
        heading: HeadingLevel.HEADING_3 
      }));
    } 
    // 3. Listas
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        children: parseTextToRuns(trimmed.substring(2)),
        bullet: { level: 0 }
      }));
    }
    // 4. Parágrafo normal
    else {
      paragraphs.push(new Paragraph({
        children: parseTextToRuns(trimmed),
        spacing: { after: 120 } // Espaçamento padrão
      }));
    }
  });

  return paragraphs;
};

export const generateDocx = async (projectName: string, sections: PlanSection[], assets: ProjectAsset[]): Promise<Blob> => {
  const validSections = sections.filter(s => s.content && s.content.trim().length > 0);

  // 1. Capa
  const titlePage = [
    new Paragraph({
      text: projectName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 4000, after: 400 }
    }),
    new Paragraph({
      text: "Plano de Negócios",
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Gerado em: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 }
    }),
    new PageBreak()
  ];

  // 2. Sumário Automático
  const tableOfContents = [
    new Paragraph({
      text: "Sumário Executivo",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-5",
    }),
    new PageBreak()
  ];

  // 3. Conteúdo das Seções
  const contentParagraphs: Paragraph[] = [];

  validSections.forEach((section) => {
    // Título da Seção (Quebra de página antes de cada nova seção principal)
    contentParagraphs.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true, // Garante "Novo tópico começa em nova página"
      })
    );

    // Converte o corpo do texto, passando os assets para buscar imagens
    const bodyParagraphs = convertMarkdownToDocx(section.content, assets);
    contentParagraphs.push(...bodyParagraphs);
  });

  // 4. Montagem do Documento
  const doc = new Document({
    features: {
      updateFields: true, // Tenta forçar atualização do TOC ao abrir
    },
    styles: {
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 28, bold: true, color: "000000" },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 24, bold: true, color: "2E2E2E" },
                paragraph: { spacing: { before: 240, after: 120 } },
            }
        ]
    },
    sections: [
      {
        properties: {}, // Padrão A4
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: `${projectName} - Confidencial`,
                alignment: AlignmentType.RIGHT,
                style: "Header"
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun("Página "),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                  }),
                  new TextRun(" de "),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...titlePage,
          ...tableOfContents,
          ...contentParagraphs
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
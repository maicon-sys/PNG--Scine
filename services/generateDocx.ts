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
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType
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

// Função para converter conteúdo Markdown em Parágrafos e Tabelas DOCX
const convertMarkdownToDocx = (markdown: string, assets: ProjectAsset[]): (Paragraph | Table)[] => {
  if (!markdown) return [];
  
  const elements: (Paragraph | Table)[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // 1. Verifica se é uma tabela Markdown
    if (line.startsWith('|') && line.endsWith('|') && i + 1 < lines.length && lines[i+1].trim().match(/^\|[-:|\s]+\|$/)) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
            tableLines.push(lines[i].trim());
            i++;
        }

        try {
            const headerLine = tableLines[0];
            // Ignora a linha de separador
            const dataLines = tableLines.slice(2);
            
            const getCells = (l: string) => l.slice(1, -1).split('|').map(cell => cell.trim());

            const headerCells = getCells(headerLine);
            const numColumns = headerCells.length;

            if (numColumns === 0) throw new Error("Tabela sem colunas.");
            
            const table = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: headerCells.map(cell => new TableCell({
                            children: [new Paragraph({ children: parseTextToRuns(cell), alignment: AlignmentType.CENTER })],
                        })),
                        tableHeader: true,
                    }),
                    ...dataLines.map(rowLine => {
                        let rowCells = getCells(rowLine);
                        // Garante que cada linha tenha o número correto de células para evitar corrupção
                        while (rowCells.length < numColumns) {
                            rowCells.push(''); // Adiciona células vazias se necessário
                        }
                        if (rowCells.length > numColumns) {
                            rowCells = rowCells.slice(0, numColumns); // Trunca se houver células a mais
                        }
                        return new TableRow({
                            children: rowCells.map(cell => new TableCell({
                                // Garante que cada célula tenha um parágrafo, mesmo que vazio
                                children: [new Paragraph({ children: parseTextToRuns(cell) })],
                            })),
                        });
                    }),
                ],
            });
            elements.push(table);
            elements.push(new Paragraph({ text: "" })); // Espaço pós-tabela
            continue;
        } catch (e) {
            console.error("Erro ao criar tabela DOCX, tratando como texto:", e);
            // Fallback: se a criação da tabela falhar, insere as linhas como texto normal
            tableLines.forEach(l => elements.push(new Paragraph({ children: parseTextToRuns(l) })));
        }

    } else {
        // 2. Processa outros elementos (não-tabela)
        if (!line) {
          elements.push(new Paragraph({ text: "" }));
        } else {
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
            const src = imgMatch[2];
            if (src.startsWith('asset://')) {
              const assetId = src.replace('asset://', '');
              const asset = assets.find(a => a.id === assetId);
              if (asset && asset.data) {
                try {
                  const imageBuffer = base64ToUint8Array(asset.data);
                  elements.push(new Paragraph({
                    // FIX: The property for binary image data in this version of the 'docx' library is 'data', not 'buffer'.
                    children: [new ImageRun({ data: imageBuffer, transformation: { width: 500, height: 281 } })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 240 }
                  }));
                } catch (e) { 
                  console.error("Erro ao processar imagem para DOCX (possivelmente Base64 inválido):", e); 
                  // FIX: Corrected typo. The property for italics in 'docx' is 'italics', not 'italic'.
                  elements.push(new Paragraph({ children: [new TextRun({ text: `[Erro ao carregar imagem: ${asset.description}]`, italics: true })] }));
                }
              }
            }
          } else if (line.startsWith('# ')) {
            elements.push(new Paragraph({ children: parseTextToRuns(line.substring(2)), heading: HeadingLevel.HEADING_1 }));
          } else if (line.startsWith('## ')) {
            elements.push(new Paragraph({ children: parseTextToRuns(line.substring(3)), heading: HeadingLevel.HEADING_2 }));
          } else if (line.startsWith('### ')) {
            elements.push(new Paragraph({ children: parseTextToRuns(line.substring(4)), heading: HeadingLevel.HEADING_3 }));
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            elements.push(new Paragraph({ children: parseTextToRuns(line.substring(2)), bullet: { level: 0 } }));
          } else {
            elements.push(new Paragraph({ children: parseTextToRuns(line), spacing: { after: 120 } }));
          }
        }
        i++;
    }
  }

  return elements;
};

export const generateDocx = async (projectName: string, sections: PlanSection[], assets: ProjectAsset[]): Promise<Blob> => {
  const validSections = sections.filter(s => s.content && s.content.trim().length > 0);

  // 1. Capa
  const titlePage = [
    new Paragraph({
      children: [new TextRun(projectName)],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 4000, after: 400 }
    }),
    new Paragraph({
      children: [new TextRun("Plano de Negócios")],
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun(`Gerado em: ${new Date().toLocaleDateString()}`)],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 }
    }),
  ];

  // 2. Sumário Automático
  const tableOfContents = [
    new Paragraph({
      children: [new TextRun("Sumário")],
      heading: HeadingLevel.HEADING_1,
      // FIX: Added pageBreakBefore to start the Table of Contents on a new page.
      pageBreakBefore: true,
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-3", // Aumentado para incluir H3
    }),
  ];

  // 3. Conteúdo das Seções
  const contentElements: (Paragraph | Table)[] = [];

  validSections.forEach((section) => {
    contentElements.push(
      new Paragraph({
        children: [new TextRun(section.title)],
        heading: HeadingLevel.HEADING_1,
        // FIX: Replaced `PageBreak` with `pageBreakBefore` to ensure each main section starts on a new page.
        pageBreakBefore: true,
      })
    );
    const bodyElements = convertMarkdownToDocx(section.content, assets);
    contentElements.push(...bodyElements);
  });

  // 4. Montagem do Documento
  const doc = new Document({
    features: {
      updateFields: true,
    },
    styles: {
        paragraphStyles: [
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, color: "000000" },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, bold: true, color: "2E2E2E" },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
                id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 20, bold: true, color: "4F4F4F" },
                paragraph: { spacing: { before: 240, after: 120 } },
            }
        ]
    },
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun(`${projectName} - Confidencial`)],
                alignment: AlignmentType.RIGHT,
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
                  new TextRun({ children: [PageNumber.CURRENT] }),
                  new TextRun(" de "),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                ],
              }),
            ],
          }),
        },
        // FIX: Removed invalid PageBreak objects from the children array. Page breaks are now handled by paragraph properties.
        children: [
          ...titlePage,
          ...tableOfContents,
          ...contentElements
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
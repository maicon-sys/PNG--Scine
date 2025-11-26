
export interface PaginatedResult {
  pages: string[]; // Array de strings HTML, cada string é o conteúdo de uma página
  tocMap: Record<string, number>; // Mapa de ID -> Número da Página
  totalPages: number;
}

// Configurações A4 em pixels (96 DPI)
// A4: 210mm x 297mm
// Altura total: ~1123px
// Margens verticais (topo + baixo): ~150px (aprox 20mm cada)
// Altura útil de conteúdo: ~970px
const PAGE_CONTENT_HEIGHT = 950; 

export const paginateContent = (
  sourceContainer: HTMLElement,
  tocOffset: number = 2 // Páginas ocupadas por Capa + Sumário (estimativa inicial)
): PaginatedResult => {
  const pages: string[] = [];
  let currentPageNodes: HTMLElement[] = [];
  let currentHeight = 0;
  const tocMap: Record<string, number> = {};

  // Função auxiliar para fechar a página atual e abrir uma nova
  const flushPage = () => {
    if (currentPageNodes.length > 0) {
      // Cria um container temporário para pegar o HTML
      const div = document.createElement('div');
      currentPageNodes.forEach(node => div.appendChild(node.cloneNode(true)));
      pages.push(div.innerHTML);
      currentPageNodes = [];
      currentHeight = 0;
    }
  };

  // Itera sobre os filhos diretos do container de medição
  const children = Array.from(sourceContainer.children) as HTMLElement[];

  children.forEach((child) => {
    const childHeight = child.offsetHeight;
    const style = window.getComputedStyle(child);
    const marginTop = parseInt(style.marginTop) || 0;
    const marginBottom = parseInt(style.marginBottom) || 0;
    const totalChildHeight = childHeight + marginTop + marginBottom;

    // Verifica se é um cabeçalho para o Sumário
    const isHeading = ['H1', 'H2', 'H3'].includes(child.tagName);
    const id = child.getAttribute('id');

    // Regra 1: Capítulos (H1) sempre começam em nova página (exceto se for a primeira linha da página)
    const isChapterStart = child.tagName === 'H1' || child.classList.contains('chapter-start');
    
    // Regra 2: Verifica estouro de página
    if (
      (currentHeight + totalChildHeight > PAGE_CONTENT_HEIGHT) || 
      (isChapterStart && currentHeight > 0)
    ) {
      flushPage();
    }

    // Registra no mapa do sumário (Página atual + Offset de capas/TOC + 1 base-1)
    if (id && isHeading) {
      tocMap[id] = pages.length + tocOffset + 1;
    }

    currentPageNodes.push(child);
    currentHeight += totalChildHeight;
  });

  // Finaliza a última página
  flushPage();

  return {
    pages,
    tocMap,
    totalPages: pages.length + tocOffset
  };
};

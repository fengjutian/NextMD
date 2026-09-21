import type { Editor } from '@tiptap/react';

type DragState = { kind: 'row' | 'column'; index: number; table: HTMLTableElement } | null;

export function enableTableDrag(editor: Editor): () => void {
  const root = editor.view.dom;
  let dragging: DragState = null;
  let resizingRow: { pos: number; startY: number; startHeight: number } | null = null;

  const markHandles = () => {
    root.querySelectorAll('table').forEach((table) => {
      table.querySelectorAll('thead th').forEach((cell) => {
        cell.setAttribute('draggable', 'true');
        cell.classList.add('table-column-drag-handle');
        cell.setAttribute('title', '拖动调整列顺序');
      });
      table.querySelectorAll('tbody tr > td:first-child').forEach((cell) => {
        cell.setAttribute('draggable', 'true');
        cell.classList.add('table-row-drag-handle');
        cell.setAttribute('title', '拖动调整行顺序');
      });
    });
  };

  const onDragStart = (event: DragEvent) => {
    const cell = (event.target as Element | null)?.closest('th, td');
    const table = cell?.closest('table');
    const row = cell?.closest('tr');
    if (!(cell instanceof HTMLTableCellElement) || !(table instanceof HTMLTableElement) || !(row instanceof HTMLTableRowElement)) return;
    if (cell.tagName === 'TH') dragging = { kind: 'column', index: cell.cellIndex, table };
    else if (cell.cellIndex === 0) dragging = { kind: 'row', index: row.rowIndex, table };
    else return;
    event.dataTransfer?.setData('text/plain', 'nextmd-table-drag');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    cell.classList.add('table-dragging');
  };

  const onDragOver = (event: DragEvent) => {
    if (!dragging) return;
    const cell = (event.target as Element | null)?.closest('th, td');
    if (cell?.closest('table') !== dragging.table) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: DragEvent) => {
    if (!dragging) return;
    const cell = (event.target as Element | null)?.closest('th, td');
    const row = cell?.closest('tr');
    if (!(cell instanceof HTMLTableCellElement) || !(row instanceof HTMLTableRowElement) || cell.closest('table') !== dragging.table) return;
    event.preventDefault();

    const tableContentPos = editor.view.posAtDOM(dragging.table, 0);
    const tablePos = tableContentPos - 1;
    const tableNode = editor.state.doc.nodeAt(tablePos);
    if (!tableNode || tableNode.type.name !== 'table') return;

    if (dragging.kind === 'row') {
      const target = row.rowIndex;
      if (target === 0 || target === dragging.index) return;
      const rows = [...tableNode.content.content];
      const [moved] = rows.splice(dragging.index, 1);
      rows.splice(target, 0, moved);
      const nextTable = tableNode.type.create(tableNode.attrs, rows, tableNode.marks);
      editor.view.dispatch(editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, nextTable));
    } else {
      const target = cell.cellIndex;
      if (target === dragging.index) return;
      const rows = tableNode.content.content.map((rowNode) => {
        const cells = [...rowNode.content.content];
        if (cells.some((node) => (node.attrs.colspan ?? 1) !== 1) || dragging!.index >= cells.length || target >= cells.length) return rowNode;
        const [moved] = cells.splice(dragging!.index, 1);
        cells.splice(target, 0, moved);
        return rowNode.type.create(rowNode.attrs, cells, rowNode.marks);
      });
      const nextTable = tableNode.type.create(tableNode.attrs, rows, tableNode.marks);
      editor.view.dispatch(editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, nextTable));
    }
    requestAnimationFrame(markHandles);
  };

  const onDragEnd = () => {
    root.querySelector('.table-dragging')?.classList.remove('table-dragging');
    dragging = null;
  };
  const onPointerDown = (event: PointerEvent) => {
    const cell = (event.target as Element | null)?.closest('th, td');
    const row = cell?.closest('tr');
    if (!(cell instanceof HTMLTableCellElement) || !(row instanceof HTMLTableRowElement)) return;
    const rect = cell.getBoundingClientRect();
    if (rect.bottom - event.clientY > 6) return;
    const pos = editor.view.posAtDOM(row, 0) - 1;
    if (editor.state.doc.nodeAt(pos)?.type.name !== 'tableRow') return;
    resizingRow = { pos, startY: event.clientY, startHeight: row.getBoundingClientRect().height };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    event.preventDefault();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!resizingRow) {
      const cell = (event.target as Element | null)?.closest('th, td');
      const nearBottom = cell instanceof HTMLTableCellElement && cell.getBoundingClientRect().bottom - event.clientY <= 6;
      root.style.cursor = nearBottom ? 'row-resize' : '';
      return;
    }
    const height = Math.max(32, Math.min(320, Math.round(resizingRow.startHeight + event.clientY - resizingRow.startY)));
    const node = editor.state.doc.nodeAt(resizingRow.pos);
    if (!node) return;
    editor.view.dispatch(editor.state.tr.setNodeMarkup(resizingRow.pos, undefined, { ...node.attrs, rowHeight: height }));
  };
  const onPointerUp = () => {
    if (!resizingRow) return;
    resizingRow = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    root.style.cursor = '';
  };
  const onTransaction = () => requestAnimationFrame(markHandles);

  markHandles();
  root.addEventListener('dragstart', onDragStart);
  root.addEventListener('dragover', onDragOver);
  root.addEventListener('drop', onDrop);
  root.addEventListener('dragend', onDragEnd);
  root.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  editor.on('transaction', onTransaction);
  return () => {
    root.removeEventListener('dragstart', onDragStart);
    root.removeEventListener('dragover', onDragOver);
    root.removeEventListener('drop', onDrop);
    root.removeEventListener('dragend', onDragEnd);
    root.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    editor.off('transaction', onTransaction);
    root.style.cursor = '';
  };
}

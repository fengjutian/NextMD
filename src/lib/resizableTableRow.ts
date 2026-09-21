import TableRow from '@tiptap/extension-table-row';

export const ResizableTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: null,
        parseHTML: (element) => Number.parseInt(element.style.height, 10) || null,
        renderHTML: (attributes) => attributes.rowHeight ? { style: `height: ${attributes.rowHeight}px` } : {},
      },
    };
  },
});

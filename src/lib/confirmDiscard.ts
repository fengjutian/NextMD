import { useEditorStore } from '../stores/editorStore';

export function confirmDiscardChanges(): boolean {
  return !useEditorStore.getState().isModified ||
    window.confirm('当前文档有未保存的修改，确定要放弃吗？');
}

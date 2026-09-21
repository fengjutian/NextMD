export const SOURCE_EDITOR_NAVIGATE = 'nextmd:source-editor-navigate';

export interface SourceEditorNavigation {
  from: number;
  to?: number;
  focus?: boolean;
}

export function navigateSourceEditor(detail: SourceEditorNavigation): void {
  window.dispatchEvent(new CustomEvent<SourceEditorNavigation>(SOURCE_EDITOR_NAVIGATE, { detail }));
}

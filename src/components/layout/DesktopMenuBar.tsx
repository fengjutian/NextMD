import { useEffect, useRef, useState, type ReactNode } from 'react';
import { closeDocument, newDocument, openDocument, refreshCurrentDocument, saveDocument } from '../../lib/documentActions';
import { useEditorStore, type ViewMode } from '../../stores/editorStore';
import { useThemeStore, type ThemeMode } from '../../stores/themeStore';
import { useToastStore } from '../../stores/toastStore';
import type { EditorCommand } from '../../lib/editorCommands';
import { useFileStore } from '../../stores/fileStore';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

interface Menu {
  label: ReactNode;
  items: MenuItem[];
}

export function DesktopMenuBar() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const setViewMode = useEditorStore((state) => state.setViewMode);
  const viewMode = useEditorStore((state) => state.viewMode);
  const theme = useThemeStore((state) => state.theme);
  const currentPath = useFileStore((state) => state.currentFile?.path);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, []);

  const find = (replace = false) => window.dispatchEvent(new CustomEvent('nextmd:find', { detail: { replace } }));
  const viewItem = (label: string, mode: ViewMode): MenuItem => ({ label, checked: viewMode === mode, action: () => setViewMode(mode) });
  const themeItem = (label: string, mode: ThemeMode): MenuItem => ({ label, checked: theme === mode, action: () => setTheme(mode) });
  const format = (label: string, command: EditorCommand, prefix: string, suffix = prefix): MenuItem => ({
    label,
    action: () => window.dispatchEvent(new CustomEvent('nextmd:editor-command', { detail: { command, prefix, suffix } })),
  });
  const menus: Menu[] = [
    { label: <>文件(<u>F</u>)</>, items: [
      { label: '新建', shortcut: 'Ctrl+N', action: () => { newDocument(); } },
      { label: '打开…', shortcut: 'Ctrl+O', action: () => { void openDocument(); } },
      { label: '刷新当前文档', shortcut: 'F5', disabled: !currentPath, action: () => { void refreshCurrentDocument(); } },
      { separator: true },
      { label: '保存', shortcut: 'Ctrl+S', action: () => { void saveDocument(); } },
      { label: '另存为…', shortcut: 'Ctrl+Shift+S', action: () => { void saveDocument(true); } },
      { separator: true },
      { label: '关闭文档', action: () => { closeDocument(); } },
    ] },
    { label: <>编辑(<u>E</u>)</>, items: [
      { label: '查找', shortcut: 'Ctrl+F', action: () => find() },
      { label: '查找和替换', shortcut: 'Ctrl+H', action: () => find(true) },
    ] },
    { label: <>段落(<u>P</u>)</>, items: [
      format('一级标题', 'h1', '# ', ''), format('二级标题', 'h2', '## ', ''), format('三级标题', 'h3', '### ', ''),
      { separator: true }, format('引用', 'quote', '> ', ''), format('无序列表', 'bullet', '- ', ''), format('有序列表', 'ordered', '1. ', ''),
    ] },
    { label: <>格式(<u>O</u>)</>, items: [
      format('粗体', 'bold', '**'), format('斜体', 'italic', '*'), format('删除线', 'strike', '~~'), format('行内代码', 'code', '`'),
      { separator: true }, format('链接', 'link', '[', '](https://)'),
    ] },
    { label: <>视图(<u>V</u>)</>, items: [
      viewItem('所见即所得', 'wysiwyg'), viewItem('源码模式', 'source'), viewItem('分栏预览', 'split'),
    ] },
    { label: <>主题(<u>T</u>)</>, items: [
      themeItem('浅色', 'light'), themeItem('深色', 'dark'), themeItem('跟随系统', 'system'),
    ] },
    { label: <>帮助(<u>H</u>)</>, items: [
      { label: '关于 NextMD', action: () => useToastStore.getState().show('info', 'NextMD · Markdown 编辑器') },
    ] },
  ];

  return (
    <div ref={rootRef} className="ml-3 flex h-full items-center titlebar-no-drag">
      {menus.map((menu, index) => (
        <div key={index} className="relative h-full">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === index ? null : index)}
            onPointerEnter={() => { if (openMenu !== null) setOpenMenu(index); }}
            className={`h-full px-2 text-[12px] leading-none text-[var(--text-primary)] hover:bg-[var(--border-subtle)] ${openMenu === index ? 'bg-[var(--border-subtle)]' : ''}`}
          >
            {menu.label}
          </button>
          {openMenu === index && (
            <div className="absolute left-0 top-[calc(100%+1px)] z-[120] min-w-48 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-1.5 shadow-[var(--shadow-lg)]">
              {menu.items.map((item, itemIndex) => item.separator ? (
                <div key={itemIndex} className="my-1 border-t border-[var(--border-subtle)]" />
              ) : (
                <button
                  key={itemIndex}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => { setOpenMenu(null); item.action?.(); }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-[var(--border-subtle)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <span className="w-3 text-[var(--accent)]">{item.checked ? '✓' : ''}</span>
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {item.shortcut && <span className="ml-4 text-[10px] text-[var(--text-muted)]">{item.shortcut}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { Editor, Transforms, Element as SlateElement } from 'slate';
import { HistoryEditor } from 'slate-history';

type BlockType =
  | 'paragraph'
  | 'heading-three'
  | 'list-item'
  | 'numbered-list'
  | 'bulleted-list'
  | 'code-block'
  | 'link';

type RichEditor = Editor & HistoryEditor;
type ShortcutAction = (editor: RichEditor) => void;

export const SHORTCUTS: Record<string, ShortcutAction> = {
  'mod+b': editor => toggleMark(editor, 'bold'),
  'mod+i': editor => toggleMark(editor, 'italic'),
  'mod+u': editor => toggleMark(editor, 'underline'),
  'mod+z': editor => {
    if (HistoryEditor.isHistoryEditor(editor)) {
      HistoryEditor.undo(editor);
    }
  },
  'mod+y': editor => {
    if (HistoryEditor.isHistoryEditor(editor)) {
      HistoryEditor.redo(editor);
    }
  },
  'mod+alt+3': editor => toggleBlock(editor, 'heading-three'), // ✅ H3 shortcut
};

export const handleEditorShortcut = (
  event: React.KeyboardEvent,
  editor: RichEditor,
  onSend: () => void
) => {
  const key = createShortcutKey(event);

  if (key === 'enter' && !event.shiftKey) {
    event.preventDefault();
    onSend();
    return;
  }

  const action = SHORTCUTS[key];
  if (action) {
    event.preventDefault();
    action(editor);
  }
};

const createShortcutKey = (event: React.KeyboardEvent): string => {
  const keys = [];
  if (event.metaKey || event.ctrlKey) keys.push('mod');
  if (event.altKey) keys.push('alt');
  if (event.shiftKey) keys.push('shift');

  const key = event.key.toLowerCase();
  keys.push(key);

  return keys.join('+');
};

// Local toggleMark helper
const toggleMark = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor) as Record<string, unknown> | null;
  const isActive = marks ? marks[format] === true : false;

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Local toggleBlock helper for blocks like 'heading-three'
const toggleBlock = (editor: Editor, format: BlockType) => {
  const isActive = isBlockActive(editor, format);
  const newType: BlockType = isActive ? 'paragraph' : format;
  Transforms.setNodes(editor, { type: newType });
};

const isBlockActive = (editor: Editor, format: BlockType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });
  return !!match;
};

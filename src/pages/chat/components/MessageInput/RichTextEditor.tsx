// src/components/MessageInput/RichTextEditor.tsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
  Range,
} from 'slate';
import type { Descendant } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List,
  Heading3,
  Link,
  Undo,
  Redo,
  Smile,
  File,
  Mic,
} from 'lucide-react';
import { handleEditorShortcut } from '../../lib/shortcuts';
import { HistoryEditor, withHistory } from 'slate-history';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { sendMessageSocket } from '../../api/socket';
import { sanitize } from '../../utils/sanitize';
import { serializeToHtml } from '../../utils/serializeToHtml';

interface RichTextEditorProps {
  conversationId: string | null;
  selfId?: string;
  /** optional callback after a message is sent */
  onSent?: () => void;
  disabled?: boolean;
}

const initialValue: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

type BlockType =
  | 'paragraph'
  | 'heading-three'
  | 'list-item'
  | 'numbered-list'
  | 'bulleted-list'
  | 'code-block'
  | 'link';

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? (marks as Record<string, unknown>)[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

const isBlockActive = (editor: Editor, format: BlockType) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
  });
  return !!match;
};

const toggleBlock = (editor: Editor, format: BlockType) => {
  const isList = format === 'numbered-list' || format === 'bulleted-list';
  const isActive = isBlockActive(editor, format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ((n as any).type === 'numbered-list' || (n as any).type === 'bulleted-list'),
    split: true,
  });

  const newType: BlockType = isActive ? 'paragraph' : isList ? 'list-item' : format;
  Transforms.setNodes(editor, { type: newType });

  if (!isActive && isList) {
    const block = { type: format, children: [] } as any;
    Transforms.wrapNodes(editor, block);
  }
};

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'link',
  });
  return !!link;
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'link',
  });
};

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) unwrapLink(editor);
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: SlateElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  } as any;
  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const insertEmoji = (editor: Editor, emoji: string) => {
  editor.insertText(emoji);
};

const clearEditor = (editor: Editor) => {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
};

const handleListAutoformat = (editor: Editor) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return;

  const [match] = Editor.nodes(editor, {
    match: n => SlateElement.isElement(n) && (n as any).type === 'paragraph',
  });

  if (!match) return;

  const [, path] = match;
  const text = Editor.string(editor, path);

  if (/^(1|\d+)\.\s$/.test(text)) {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, path),
        focus: Editor.end(editor, path),
      },
    });
    Transforms.setNodes(editor, { type: 'list-item' }, { at: path });
    Transforms.wrapNodes(editor, { type: 'numbered-list', children: [] }, { at: path });
  }

  if (/^[-*]\s$/.test(text)) {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, path),
        focus: Editor.end(editor, path),
      },
    });
    Transforms.setNodes(editor, { type: 'list-item' }, { at: path });
    Transforms.wrapNodes(editor, { type: 'bulleted-list', children: [] }, { at: path });
  }
};

const renderLeaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  return <span {...attributes}>{children}</span>;
};

const renderElement = (props: any) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'heading-three':
      return <h3 {...attributes} className="text-lg font-semibold">{children}</h3>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal pl-4">{children}</ol>;
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc pl-4">{children}</ul>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'link':
      return <a {...attributes} href={(element as any).url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// ToolbarButton Component
const ToolbarButton = ({
  format,
  icon,
  isMark = false,
  action,
  title,
}: {
  format: string;
  icon: React.ReactNode;
  isMark?: boolean;
  action?: () => void;
  title?: string;
}) => {
  const editor = useSlate();
  const isActive = isMark
    ? isMarkActive(editor, format)
    : isBlockActive(editor, format as BlockType);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (action) return action();
    if (isMark) toggleMark(editor, format);
    else toggleBlock(editor, format as BlockType);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      title={title ?? format}
      className={`w-9 h-9 rounded-md flex items-center justify-center hover:bg-gray-200 ${isActive ? 'bg-blue-200 text-blue-700 font-bold' : 'bg-gray-100 text-gray-600'}`}
    >
      {icon}
    </button>
  );
};

export default function RichTextEditor({
  conversationId,
  selfId,
  onSent,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []) as Editor & HistoryEditor;
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // compute whether there's any text to send
  const hasContent = () => {
    try {
      const t = Editor.string(editor, []).trim();
      if (t.length > 0) return true;
      const html = serializeToHtml(value).replace(/<[^>]*>/g, '').trim();
      return html.length > 0;
    } catch {
      return false;
    }
  };

  // send handler: converts Slate -> sanitized HTML and sends via socket
  const handleSend = useCallback(() => {
    if (!conversationId) {
      alert('Select a conversation first');
      return;
    }

    // build sanitized HTML only (no plain-text fallback)
    const html = sanitize(serializeToHtml(value)).trim();

    if (!html) {
      // nothing meaningful to send
      return;
    }

    // send sanitized HTML as content
    sendMessageSocket({
      conversationId,
      senderId: selfId ?? '',
      content: html,
    });

    // Clear the editor UI and internal slate value
    clearEditor(editor);
    setValue(initialValue);

    // close emoji picker
    setShowEmojiPicker(false);

    if (onSent) onSent();
  }, [conversationId, editor, selfId, value, onSent]);

  // keyboard handling — uses your existing shortcut handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    handleEditorShortcut(event as any, editor as any, () => {
      handleSend();
    });

    if (event.key === ' ') {
      setTimeout(() => handleListAutoformat(editor), 0);
    }
  }, [editor, handleSend]);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');
    const urlRegex = /^https?:\/\/[\S]+$/i;
    if (urlRegex.test(text)) {
      event.preventDefault();
      wrapLink(editor, text);
    }
  }, [editor]);

  const handleAudioRecord = () => {
    setIsRecording(prev => {
      alert(prev ? 'Audio recording stopped (placeholder).' : 'Audio recording started (placeholder).');
      return !prev;
    });
  };

  // Prevent file attach when no conversation selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!conversationId) {
      alert('Select a conversation before attaching files.');
      return;
    }
    // TODO: upload file to your backend and then send message with mediaUrl
    alert(`Selected file: ${file.name} — implement upload to backend in handleFileChange.`);
    e.currentTarget.value = '';
  };

  // if conversationId toggles off, clear local editor state (similar to MessageInput disabling)
  useEffect(() => {
    if (!conversationId) {
      clearEditor(editor);
      setValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return (
    <div className="rich-text-editor border rounded-lg p-3 bg-white shadow-md space-y-2" ref={editorRef}>
      <Slate editor={editor} initialValue={value} onChange={(v) => setValue(v)}>
        {showFormatting && (
          <div className="flex items-center gap-2 flex-wrap">
            <ToolbarButton format="bold" icon={<Bold />} isMark title="Bold (Ctrl + B)" />
            <ToolbarButton format="italic" icon={<Italic />} isMark title="Italic (Ctrl + I)" />
            <ToolbarButton format="underline" icon={<Underline />} isMark title="Underline (Ctrl + U)" />
            <ToolbarButton format="numbered-list" icon={<ListOrdered />} />
            <ToolbarButton format="bulleted-list" icon={<List />} />
            <ToolbarButton format="heading-three" icon={<Heading3 />} title="Heading 3" />
            <ToolbarButton
              format="undo"
              icon={<Undo />}
              action={() => HistoryEditor.undo(editor)}
              title="Undo (Ctrl + Z)"
            />
            <ToolbarButton
              format="redo"
              icon={<Redo />}
              action={() => HistoryEditor.redo(editor)}
              title="Redo (Ctrl + Y)"
            />
            <ToolbarButton
              format="link"
              icon={<Link />}
              action={() => {
                const url = prompt('Enter a URL');
                if (url) wrapLink(editor, url);
              }}
              title="Insert Link"
            />
          </div>
        )}

        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          readOnly={disabled || !conversationId}
          // fixed height (h-28 = 7rem). Use h-24 or h-32 to taste.
          className="h-28 outline-none p-2 border rounded-md w-full overflow-y-auto custom-scroll"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          placeholder={conversationId ? 'Type your message...' : 'Select a conversation first'}
          spellCheck
        />

        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button title="Toggle Formatting" onMouseDown={e => { e.preventDefault(); setShowFormatting(p => !p); }} className="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <Link />
            </button>
            <button title="Audio Record" onMouseDown={e => { e.preventDefault(); handleAudioRecord(); }} className="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <Mic className={isRecording ? 'text-red-500' : ''} />
            </button>
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button title="Emoji Picker" className="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <Smile />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <EmojiPicker onEmojiClick={(emoji: EmojiClickData) => { insertEmoji(editor, emoji.emoji); setShowEmojiPicker(false); }} />
              </PopoverContent>
            </Popover>
            <label htmlFor="file-upload" className="cursor-pointer" title="Attach File">
              <div className="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <File />
              </div>
            </label>
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
          </div>

          <button
            onClick={() => handleSend()}
            title="Send Message (Enter)"
            disabled={!conversationId || !hasContent()}
            className="flex items-center gap-2 bg-primary text-white text-md font-medium px-4 py-2 rounded-sm hover:bg-blue-600 transition disabled:opacity-50"
          >
            Send
            <span className="flex items-center gap-1 bg-white/10 text-white/80 px-2 py-0.5 rounded-sm text-xs font-mono">
              <Mic className="text-lg" />
            </span>
          </button>
        </div>
      </Slate>
    </div>
  );
}

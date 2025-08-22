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
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import {
  Bold,
  Italic,
  Underline,
  ListOrdered,
  List,
  Heading3,
  Undo,
  Redo,
  Smile,
  Mic,
  Send,
} from 'lucide-react';
import { handleEditorShortcut } from '../../lib/shortcuts';
import { HistoryEditor, withHistory } from 'slate-history';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sendMessageSocket } from '../../api/socket';
import { sanitize } from '../../utils/sanitize';
import { serializeToHtml } from '../../utils/serializeToHtml';
import FileUploader from './FileUploader';
import { uploadFileToS3 } from '../../api/uploadService';
import { useCannedResponses } from '@/pages/CannedResponse/useCannedResponses';
import { cn } from '@/lib/utils';
import ReplyBanner from './ReplyBanner';
import type { Message as ApiMessage } from '@/pages/chat/api/chatService';

interface RichTextEditorProps {
  conversationId: string | null;
  selfId?: string;
  /** optional callback after a message is sent */
  onSent?: () => void;
  disabled?: boolean;

  /**
   * When replying to a message, the parent message object.
   * Pass null to indicate normal (non-reply) state.
   */
  replyTo?: ApiMessage | null;

  /**
   * Called when the user cancels the reply (clicks X on the ReplyBanner)
   */
  onCancelReply?: () => void;
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

interface CannedResponse {
  id: string;
  name: string;
  message: string;
}

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onMouseDown={handleMouseDown}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground",
            isActive && "bg-accent text-foreground"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{title ?? format}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default function RichTextEditor({
  conversationId,
  selfId,
  onSent,
  disabled = false,
  replyTo = null,
  onCancelReply,
}: RichTextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []) as Editor & HistoryEditor;
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ top: 0, left: 0 });
  const [searchText, setSearchText] = useState('');
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([]);

  const { responses } = useCannedResponses();

  const getTextBeforeCursor = useCallback(() => {
    if (!editor.selection) return '';

    const [start] = Range.edges(editor.selection);
    const range = { anchor: Editor.start(editor, []), focus: start };
    return Editor.string(editor, range);
  }, [editor]);

  const insertCannedResponse = useCallback((response: CannedResponse) => {
    const textBeforeCursor = getTextBeforeCursor();
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex >= 0) {
      const startPoint = Editor.start(editor, []);
      const endPoint = Editor.end(editor, []);

      Transforms.delete(editor, {
        at: {
          anchor: { path: startPoint.path, offset: lastSlashIndex },
          focus: endPoint
        }
      });
    }

    Transforms.insertText(editor, response.message);
    setShowCannedResponses(false);
    setSearchText('');
  }, [editor, getTextBeforeCursor]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredResponses(responses);
    } else {
      const filtered = responses.filter((r) =>
        r.name.toLowerCase().includes(searchText.toLowerCase()) ||
        r.message.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredResponses(filtered);
    }
  }, [searchText, responses]);

  useEffect(() => {
    if (!editor.selection) return;

    const textBeforeCursor = getTextBeforeCursor();
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex >= 0 && textBeforeCursor.length > lastSlashIndex) {
      const triggerText = textBeforeCursor.substring(lastSlashIndex + 1);

      if (!triggerText.includes(' ')) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setTriggerPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
          });
        }

        setSearchText(triggerText);
        setShowCannedResponses(true);
        return;
      }
    }

    setShowCannedResponses(false);
    setSearchText('');
  }, [editor.selection, getTextBeforeCursor, value]);

  const hasContent = useCallback(() => {
    try {
      const t = Editor.string(editor, []).trim();
      if (t.length > 0) return true;
      const html = serializeToHtml(value).replace(/<[^>]*>/g, '').trim();
      return html.length > 0;
    } catch {
      return false;
    }
  }, [editor, value]);

  const handleSend = useCallback(async () => {
    if (!conversationId) {
      alert('Select a conversation first');
      return;
    }

    if (uploading) {
      alert('Upload in progress, please wait');
      return;
    }

    const html = sanitize(serializeToHtml(value)).trim();

    if (!html && !selectedFile) {
      return;
    }

    setUploadError(null);

    let mediaMeta: { mediaUrl: string; mediaType?: string; fileName?: string } | null = null;

    try {
      if (selectedFile) {
        setUploading(true);
        setUploadProgress(0);
        const { publicUrl } = await uploadFileToS3(selectedFile, (p) => setUploadProgress(p));
        mediaMeta = { mediaUrl: publicUrl, mediaType: selectedFile.type || undefined, fileName: selectedFile.name };
      }

      const payload: any = {
        conversationId,
        senderId: selfId ?? null,
      };
      if (mediaMeta) {
        payload.mediaUrl = mediaMeta.mediaUrl;
        if (mediaMeta.mediaType) payload.mediaType = mediaMeta.mediaType;
        if (mediaMeta.fileName) payload.fileName = mediaMeta.fileName;
      }

      // include content (server will sanitize again)
      if (html) {
        payload.content = html;
      } else {
        payload.content = '';
      }

      // include parentId when replying to a message
      if (replyTo && typeof replyTo.id === 'string') {
        payload.parentId = replyTo.id;
      }

      // send via socket — backend expects parentId if this is a reply.
      // sendMessageSocket's local type may not include parentId; cast to any to ensure runtime payload is correct.
      sendMessageSocket(payload as any);

      // clear UI on successful send (best-effort; the server will broadcast the persisted message)
      if (html) {
        clearEditor(editor);
        setValue(initialValue);
      }
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);

      // clear reply UI if any
      if (onCancelReply) onCancelReply();

      if (onSent) onSent();
    } catch (err: any) {
      console.error('Send/upload failed', err);
      setUploadError(err?.message || 'Upload or send failed');
      setUploading(false);
    }
  }, [conversationId, editor, selfId, value, selectedFile, uploading, onSent, replyTo, onCancelReply]);

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

  useEffect(() => {
    if (!conversationId) {
      clearEditor(editor);
      setValue(initialValue);
      setSelectedFile(null);
      if (onCancelReply) onCancelReply();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);
    setUploadProgress(0);
  }, []);

  return (
    <TooltipProvider>
      <div className="rich-text-editor border border-slate-300 rounded-xl bg-background p-3 space-y-3" ref={editorRef}>
        {/* Reply banner (shows when replyTo is provided) */}
        <ReplyBanner
          replyTo={replyTo ?? null}
          selfId={selfId ?? null}
          onCancel={() => {
            if (onCancelReply) onCancelReply();
          }}
          onFocus={() => {
            try {
              ReactEditor.focus(editor);
            } catch {
              // best-effort focus
              if (editorRef.current) (editorRef.current as HTMLDivElement).focus();
            }
          }}
        />

        <Slate editor={editor} initialValue={value} onChange={(v) => setValue(v)}>

          {showCannedResponses && filteredResponses.length > 0 && (
            <div
              className={cn(
                'absolute z-50 max-h-60 w-80 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md',
                'animate-in fade-in-0 zoom-in-95 transition-all duration-200 ease-out'
              )}
              style={{
                top: triggerPosition.top - 270,
                left: triggerPosition.left - 260,
              }}
            >
              {filteredResponses.map((resp) => (
                <div
                  key={resp.id}
                  className={cn(
                    'cursor-pointer select-none px-4 py-2 text-sm transition-colors duration-150',
                    'hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 border-border'
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertCannedResponse(resp);
                  }}
                >
                  <div className="font-medium">{resp.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {resp.message.length > 50 ? resp.message.substring(0, 50) + '...' : resp.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 flex-wrap ">
            <ToolbarButton format="bold" icon={<Bold className="h-4 w-4" />} isMark title="Bold (Ctrl + B)" />
            <ToolbarButton format="italic" icon={<Italic className="h-4 w-4" />} isMark title="Italic (Ctrl + I)" />
            <ToolbarButton format="underline" icon={<Underline className="h-4 w-4" />} isMark title="Underline (Ctrl + U)" />
            <ToolbarButton format="numbered-list" icon={<ListOrdered className="h-4 w-4" />} title="Numbered List" />
            <ToolbarButton format="bulleted-list" icon={<List className="h-4 w-4" />} title="Bulleted List" />
            <ToolbarButton format="heading-three" icon={<Heading3 className="h-4 w-4" />} title="Heading 3" />
            <ToolbarButton
              format="undo"
              icon={<Undo className="h-4 w-4" />}
              action={() => HistoryEditor.undo(editor)}
              title="Undo (Ctrl + Z)"
            />
            <ToolbarButton
              format="redo"
              icon={<Redo className="h-4 w-4" />}
              action={() => HistoryEditor.redo(editor)}
              title="Redo (Ctrl + Y)"
            />
          </div>

          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(e) => {
              handleKeyDown(e);
              if (e.key === 'Escape' && showCannedResponses) {
                setShowCannedResponses(false);
                e.preventDefault();
              }
            }}
            onPaste={handlePaste}
            readOnly={disabled || !conversationId}
            className="max-h-[200px] rounded-md overflow-y-auto text-sm ml-2"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            placeholder={conversationId ? 'Type your message... (Type "/" to see canned responses)' : 'Select a conversation first'}
            spellCheck
          />

          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={(e) => { e.preventDefault(); handleAudioRecord(); }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className={cn("h-4 w-4", isRecording && "text-destructive")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isRecording ? 'Stop recording' : 'Start recording'}</p>
                </TooltipContent>
              </Tooltip>

              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add emoji</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-0" align="start">
                  <EmojiPicker onEmojiClick={(emoji: EmojiClickData) => { insertEmoji(editor, emoji.emoji); setShowEmojiPicker(false); }} />
                </PopoverContent>
              </Popover>

              <FileUploader
                conversationId={conversationId}
                onSelectFile={handleFileSelect}
                selectedFile={selectedFile}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center gap-2">
              {selectedFile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {uploading ? (
                    <span>{uploadProgress}% uploading</span>
                  ) : (
                    <span>Ready to send</span>
                  )}
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSend}
                    size="sm"
                    disabled={!conversationId || (!hasContent() && !selectedFile) || uploading}
                    className="h-8 px-3 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {uploadError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
              {uploadError}
            </div>
          )}
        </Slate>
      </div>
    </TooltipProvider>
  );
}

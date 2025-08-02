// types/slate.d.ts
import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
type HeadingOneElement = { type: 'heading-one'; children: CustomText[] };
type HeadingTwoElement = { type: 'heading-two'; children: CustomText[] };
type HeadingThreeElement = { type: 'heading-three'; children: CustomText[] }; // ✅ Added
type ListItemElement = { type: 'list-item'; children: CustomText[] };
type NumberedListElement = { type: 'numbered-list'; children: ListItemElement[] };
type BulletedListElement = { type: 'bulleted-list'; children: ListItemElement[] };
type CodeBlockElement = { type: 'code-block'; children: CustomText[] };
type LinkElement = { type: 'link'; url: string; children: CustomText[] };
type ExpandElement = { 
  type: 'expand'; 
  title: string; 
  children: Descendant[];
};

type CustomElement = 
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement // ✅ Added
  | ListItemElement
  | NumberedListElement
  | BulletedListElement
  | CodeBlockElement
  | LinkElement
  | ExpandElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

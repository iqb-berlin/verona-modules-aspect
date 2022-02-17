import {
  Component, EventEmitter, Input, Output, ViewEncapsulation,
  AfterViewInit, Injector
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Heading } from '@tiptap/extension-heading';
import { Image } from '@tiptap/extension-image';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Indent } from './extensions/indent';
import { HangingIndent } from './extensions/hanging-indent';
import { ParagraphExtension } from './extensions/paragraph-extension';
import { FontSize } from './extensions/font-size';
import { BulletListExtension } from './extensions/bullet-list';
import { OrderedListExtension } from './extensions/ordered-list';

import { FileService } from '../services/file.service';

import ToggleButtonComponentExtension from './angular-node-views/toggle-button-component-extension';
import DropListComponentExtension from './angular-node-views/drop-list-component-extension';
import TextFieldComponentExtension from './angular-node-views/text-field-component-extension';

@Component({
  selector: 'aspect-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RichTextEditorComponent implements AfterViewInit {
  @Input() content!: string | Record<string, any>;
  @Input() defaultFontSize!: number;
  @Input() clozeMode: boolean = false;
  @Output() contentChange = new EventEmitter<string | Record<string, any>>();

  selectedFontColor = 'lightgrey';
  selectedHighlightColor = 'lightgrey';
  selectedFontSize = '20px';
  selectedIndentSize = 20;
  bulletListStyle: string = 'disc';
  orderedListStyle: string = 'decimal';

  editor = new Editor({
    extensions: [StarterKit, Underline, Superscript, Subscript,
      TextStyle, Color,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ['paragraph', 'heading']
      }),
      Indent.configure({
        types: ['listItem', 'paragraph'],
        minLevel: 0,
        maxLevel: 4
      }),
      Heading.configure({
        levels: [1, 2, 3, 4]
      }),
      ParagraphExtension,
      FontSize,
      BulletListExtension,
      OrderedListExtension,
      HangingIndent,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          style: 'display: inline-block; height: 1em; vertical-align: middle'
        }
      }),
      Blockquote,
      ToggleButtonComponentExtension(this.injector),
      DropListComponentExtension(this.injector),
      TextFieldComponentExtension(this.injector)
    ]
  });

  constructor(private injector: Injector) { }

  ngAfterViewInit(): void {
    this.editor.commands.focus();
  }

  toggleBold(): void {
    this.editor.chain().toggleBold().focus().run();
  }

  toggleItalic(): void {
    this.editor.chain().toggleItalic().focus().run();
  }

  toggleUnderline(): void {
    this.editor.chain().toggleUnderline().focus().run();
  }

  toggleStrike(): void {
    this.editor.commands.toggleStrike();
  }

  toggleSuperscript(): void {
    this.editor.chain().toggleSuperscript().focus().run();
  }

  toggleSubscript(): void {
    this.editor.chain().toggleSubscript().focus().run();
  }

  applyFontSize(size: string): void {
    this.selectedFontSize = size;
    this.editor.commands.setFontSize(size);
  }

  applyFontColor(): void {
    this.editor.chain().focus().setColor(this.selectedFontColor).run();
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
  }

  alignText(direction: string): void {
    this.editor.chain().focus().setTextAlign(direction).run();
  }

  indent(): void {
    this.editor.commands.indent(this.selectedIndentSize);
  }

  outdent(): void {
    this.editor.commands.outdent(this.selectedIndentSize);
  }

  toggleBulletList(): void {
    this.editor.chain().toggleBulletList().focus().run();
    this.editor.commands.setBulletListStyle(this.bulletListStyle);
  }

  toggleOrderedList(): void {
    this.editor.chain().toggleOrderedList().focus().run();
    this.editor.commands.setOrderedListStyle(this.orderedListStyle);
    this.editor.commands.setOrderedListFontSize(this.selectedFontSize);
  }

  applyListStyle(listType: string, style: string): void {
    if (listType === 'bulletList') {
      this.bulletListStyle = style;
      this.editor.commands.setBulletListStyle(style);
      if (!this.editor.isActive('bulletList')) {
        this.toggleBulletList();
      }
    } else {
      this.orderedListStyle = style;
      this.editor.commands.setOrderedListStyle(style);
      this.editor.commands.setOrderedListFontSize(this.selectedFontSize);
      if (!this.editor.isActive('orderedList')) {
        this.toggleOrderedList();
      }
    }
  }

  toggleHeading(level?: string): void {
    if (!level) {
      this.editor.commands.toggleNode('heading', 'paragraph');
    } else {
      this.editor.commands.toggleHeading({ level: Number(level) as 1 | 2 | 3 | 4 });
    }
  }

  applyParagraphStyle(margin: number): void {
    this.editor.commands.setMargin(margin);
  }

  insertSpecialChar(char: string): void {
    this.editor.chain().insertContent(char).focus().run();
  }

  hangIndent(): void {
    this.editor.commands.indent(this.selectedIndentSize);
    this.editor.commands.hangIndent(this.selectedIndentSize);
  }

  unhangIndent(): void {
    this.editor.commands.outdent(this.selectedIndentSize);
    this.editor.commands.unhangIndent(this.selectedIndentSize);
  }

  async addImage(): Promise<void> {
    const mediaSrc = await FileService.loadImage();
    this.editor.commands.setImage({ src: mediaSrc });
  }

  toggleBlockquote(): void {
    this.editor.commands.toggleBlockquote();
  }

  insertToggleButton(): void {
    this.editor.commands.insertContent('<aspect-nodeview-toggle-button></aspect-nodeview-toggle-button>');
    this.editor.commands.focus();
  }

  insertDropList(): void {
    this.editor.commands.insertContent('<aspect-nodeview-drop-list></aspect-nodeview-drop-list>');
    this.editor.commands.focus();
  }

  insertTextField(): void {
    this.editor.commands.insertContent('<aspect-nodeview-text-field></aspect-nodeview-text-field>');
    this.editor.commands.focus();
  }
}

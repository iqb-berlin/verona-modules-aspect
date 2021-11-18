import {
  Component, EventEmitter, Input, Output, ViewEncapsulation,
  AfterViewInit
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
import { Indent } from './indent';
import { customParagraph } from './paragraph-extension';
import { fontSizeExtension } from './font-size-extension';
import { bulletListExtension } from './bulletList-extension';
import { orderedListExtension } from './orderedList-extension';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RichTextEditorComponent implements AfterViewInit {
  @Input() text!: string;
  @Input() showCloseElements: boolean | undefined = false;
  @Output() textChange = new EventEmitter<string>();

  selectedFontColor = 'lightgrey';
  selectedHighlightColor = 'lightgrey';
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
        maxLevel: 4,
        paddingMultiplier: 20
      }),
      Heading.configure({
        levels: [1, 2, 3, 4]
      }),
      customParagraph,
      fontSizeExtension,
      bulletListExtension,
      orderedListExtension
    ]
  });

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

  applyFontSize(size: number): void {
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
    this.editor.commands.indent();
  }

  outdent(): void {
    this.editor.commands.outdent();
  }

  toggleBulletList(): void {
    this.editor.chain().toggleBulletList().focus().run();
    this.editor.commands.setBulletListStyle(this.bulletListStyle);
  }

  togleOrderedList(): void {
    this.editor.chain().toggleOrderedList().focus().run();
    this.editor.commands.setBulletListStyle(this.orderedListStyle);
  }

  applyListStyle(listType: string, style: string): void {
    if (listType === 'bulletList') {
      this.bulletListStyle = style;
      this.editor.commands.setBulletListStyle(style);
    } else {
      this.orderedListStyle = style;
      this.editor.commands.setOrderedListStyle(style);
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
}

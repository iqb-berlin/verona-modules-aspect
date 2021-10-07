import {
  Component, EventEmitter, Input, Output, ViewEncapsulation,
  AfterViewInit, OnInit
} from '@angular/core';
import { ChainedCommands, Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontSize } from '@luciusa/extension-font-size';
import { TextAlign } from '@tiptap/extension-text-align';
import { Heading } from '@tiptap/extension-heading';
import { Indent } from './indent';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RichTextEditorComponent implements AfterViewInit {
  @Input() text!: string;
  @Output() textChange = new EventEmitter<string>();

  editor = new Editor({
    extensions: [StarterKit, Underline, Superscript, Subscript,
      TextStyle, Color, FontSize,
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
      })
    ]
  });

  ngAfterViewInit(): void {
    this.editor.commands.focus();
    (this.editor.extensionManager.extensions
      .filter(ext => ext.name === 'paragraph')[0] as Extension).options.HTMLAttributes =
      {
        style: 'margin: 10px 0'
      };
    // Hack to apply style on first p-Element. All following paragraphs have this automatically
    this.editor.commands.toggleNode('paragraph', 'heading');
    this.editor.commands.toggleNode('heading', 'paragraph');
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
    (this.editor.chain().setFontSize(size) as unknown as ChainedCommands).focus().run();
  }

  applyColor(color: string): void {
    this.editor.chain().focus().setColor(color).run();
  }

  applyHighlight(color: string): void {
    this.editor.chain().focus().toggleHighlight({ color: color }).run();
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
  }

  togleOrderedList(): void {
    this.editor.chain().toggleOrderedList().focus().run();
  }

  applyListStyle(listType: string, style: string): void {
    (this.editor.extensionManager.extensions
      .filter(ext => ext.name === listType)[0] as Extension).options.HTMLAttributes =
      {
        style: `list-style-type:${style}`
      };
  }

  toggleHeading(level?: string): void {
    if (!level) {
      this.editor.commands.toggleNode('heading', 'paragraph');
    } else {
      this.editor.commands.toggleHeading({ level: Number(level) as 1 | 2 | 3 | 4 });
    }
  }

  applyParagraphStyle(margin: number): void {
    (this.editor.extensionManager.extensions
      .filter(ext => ext.name === 'paragraph')[0] as Extension).options.HTMLAttributes =
      {
        style: `margin: ${margin}px 0`
      };
  }

  insertSpecialChar(char: string): void {
    this.editor.chain().insertContent(char).focus().run();
  }
}

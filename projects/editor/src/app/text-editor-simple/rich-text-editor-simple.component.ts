import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Editor, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { Paragraph } from '@tiptap/extension-paragraph';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

@Component({
  selector: 'aspect-rich-text-editor-simple',
  templateUrl: './rich-text-editor-simple.component.html',
  styleUrls: ['./rich-text-editor-simple.component.css']
})
export class RichTextEditorSimpleComponent {
  @Input() content!: string;
  @Input() defaultFontSize!: number;
  @Output() contentChange = new EventEmitter<string>();
  selectedFontSize: string = '20px';
  selectedFontColor: string = 'lightgrey';
  selectedHighlightColor: string = 'lightgrey';

  editor = new Editor({
    extensions: [StarterKit, Underline, Superscript, Subscript,
      TextStyle, Color,
      Highlight.configure({
        multicolor: true
      }),
      Paragraph.extend({
        parseHTML() {
          return [{ tag: 'span' }];
        },
        renderHTML({ HTMLAttributes }) {
          return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
        }
      })]
  });

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

  applyFontColor(): void {
    this.editor.chain().focus().setColor(this.selectedFontColor).run();
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
  }

  insertSpecialChar(char: string): void {
    this.editor.chain().insertContent(char).focus().run();
  }
}

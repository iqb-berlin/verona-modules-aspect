import {
  Component, EventEmitter, Input, Output,
  AfterViewInit, Injector, OnInit
} from '@angular/core';
import { Editor } from '@tiptap/core';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Document } from '@tiptap/extension-document';
import { History } from '@tiptap/extension-history';
import { Text } from '@tiptap/extension-text';
import { ListItem } from '@tiptap/extension-list-item';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Strike } from '@tiptap/extension-strike';
import { FileService } from 'common/services/file.service';
import ButtonComponentExtension from 'editor/src/app/text-editor/angular-node-views/button-component-extension';
import { BlockImage } from 'editor/src/app/text-editor/extensions/block-image';
import { InlineImage } from 'editor/src/app/text-editor/extensions/inline-image';
import { Tooltip } from 'editor/src/app/text-editor/extensions/tooltip';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { AnchorId } from './extensions/anchorId';
import { Indent } from './extensions/indent';
import { HangingIndent } from './extensions/hanging-indent';
import { ParagraphExtension } from './extensions/paragraph-extension';
import { FontSize } from './extensions/font-size';
import { BulletListExtension } from './extensions/bullet-list';
import { OrderedListExtension } from './extensions/ordered-list';
import ToggleButtonComponentExtension from './angular-node-views/toggle-button-component-extension';
import DropListComponentExtension from './angular-node-views/drop-list-component-extension';
import TextFieldComponentExtension from './angular-node-views/text-field-component-extension';
import CheckboxComponentExtension from './angular-node-views/checkbox-component-extension';

@Component({
  selector: 'aspect-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss']
})
export class RichTextEditorComponent implements OnInit, AfterViewInit {
  @Input() content!: string | Record<string, any>;
  @Input() defaultFontSize!: number;
  @Input() clozeMode: boolean = false;
  @Output() contentChange = new EventEmitter<string | Record<string, any>>();

  selectedFontColor = 'black';
  selectedHighlightColor = 'lightgrey';
  selectedAnchorColor = '#dccce6';
  selectedAnchorIdText = '';
  selectedFontSize = '20px';
  selectedIndentSize = 20;
  bulletListStyle: string = 'disc';
  orderedListStyle: string = 'decimal';

  defaultExtensions = [
    Document, Text, ListItem,
    Underline, Superscript, Subscript,
    TextStyle, Color,
    Bold, Italic, Strike, History,
    Highlight.configure({
      multicolor: true
    }),
    AnchorId,
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
    InlineImage,
    BlockImage,
    Blockquote,
    Tooltip
  ];

  editor: Editor = new Editor({
    extensions: this.defaultExtensions
  });

  constructor(private injector: Injector, private dialogService: DialogService) { }

  ngOnInit(): void {
    const activeExtensions = this.defaultExtensions;
    if (this.clozeMode) {
      activeExtensions.push(ToggleButtonComponentExtension(this.injector));
      activeExtensions.push(DropListComponentExtension(this.injector));
      activeExtensions.push(TextFieldComponentExtension(this.injector));
      activeExtensions.push(ButtonComponentExtension(this.injector));
      activeExtensions.push(CheckboxComponentExtension(this.injector));
    }
    this.editor = new Editor({
      extensions: activeExtensions
    });
  }

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

  showTooltipPropertiesDialog(): void {
    this.dialogService.showTooltipDialog(
      this.editor.getAttributes('tooltip').tooltipText,
      this.editor.getAttributes('tooltip').tooltipPosition
    ).subscribe(result => {
      if (result) {
        if (result.action === 'delete') {
          this.editor.chain().focus().unsetTooltip().run();
        } else {
          this.editor.chain().focus().setTooltip({
            tooltipText: result.tooltipText,
            tooltipPosition: result.tooltipPosition
          }).run();
        }
      }
    });
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

  applyAnchorId(): void {
    const id = this.getAnchorIdFromSelection();
    if (id) {
      const activeAnchorId = this.editor.getAttributes('anchorId').anchorId;
      const activeAnchorColor = this.editor.getAttributes('anchorId').anchorColor;
      const activeParentAnchorId = this.editor.getAttributes('anchorId').parentAnchorId;
      const activeParentAnchorColor = this.editor.getAttributes('anchorId').parentAnchorColor;
      if (activeParentAnchorId) { // reset nested child
        if (this.selectedAnchorColor === activeParentAnchorColor || this.selectedAnchorColor === activeAnchorColor) {
          this.editor.chain().focus().setAnchorId({
            anchorId: activeParentAnchorId,
            parentAnchorId: '',
            anchorColor: activeParentAnchorColor,
            parentAnchorColor: ''
          }).run();
        } else { // set new color for nested Child
          this.editor.chain().focus().setAnchorId({
            anchorId: activeAnchorId,
            parentAnchorId: activeParentAnchorId,
            anchorColor: this.selectedAnchorColor,
            parentAnchorColor: activeParentAnchorColor
          }).run();
        }
      } else { // standard toggle
        this.editor.chain().focus().toggleAnchorId({
          anchorId: id,
          parentAnchorId: (activeAnchorId !== id) ? activeAnchorId : '',
          anchorColor: this.selectedAnchorColor,
          parentAnchorColor: (activeAnchorId !== id) ? activeAnchorColor : ''
        }).run();
      }
      this.resetSelectedAnchorIdText();
    } else {
      console.warn('No text selected for anchor!');
    }
  }

  private getAnchorIdFromSelection(): string {
    const selection = window?.getSelection()?.toString() || this.selectedAnchorIdText;
    return selection.replace(/[^0-9a-zA-Z]/g, '_').substring(0, 20);
  }

  private resetSelectedAnchorIdText(): void {
    this.selectedAnchorIdText = '';
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

  async insertImage(): Promise<void> {
    const mediaSrc = await FileService.loadImage();
    this.editor.commands.insertInlineImage({ src: mediaSrc });
  }

  async insertBlockImage(alignment: 'none' | 'right' | 'left'): Promise<void> {
    const mediaSrc = await FileService.loadImage();
    switch (alignment) {
      case 'left': {
        this.editor.commands.insertBlockImage({ src: mediaSrc, style: 'float: left; margin-right: 10px;' });
        break;
      }
      case 'right': {
        this.editor.commands.insertBlockImage({ src: mediaSrc, style: 'float: right; margin-left: 10px' });
        break;
      }
      default: {
        this.editor.commands.insertBlockImage({ src: mediaSrc });
      }
    }
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

  insertButton() {
    this.editor.commands.insertContent('<aspect-nodeview-button></aspect-nodeview-button>');
    this.editor.commands.focus();
  }

  insertCheckbox() {
    this.editor.commands.insertContent('<aspect-nodeview-checkbox></aspect-nodeview-checkbox>');
    this.editor.commands.focus();
  }
}

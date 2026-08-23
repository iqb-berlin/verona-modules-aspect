import {
  Component, EventEmitter, Input, Output,
  AfterViewInit, Injector, OnInit, ViewChild, ElementRef
} from '@angular/core';
import { AnyExtension, Editor } from '@tiptap/core';
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
import { Placeholder } from '@tiptap/extension-placeholder';
import { FileService } from 'common/services/file.service';
import ButtonComponentExtension from 'editor/modules/rich-text-editor/extensions/button-component-extension';
import { BlockImage } from 'editor/modules/rich-text-editor/extensions/block-image';
import { InlineImage } from 'editor/modules/rich-text-editor/extensions/inline-image';
import { Tooltip } from 'editor/modules/rich-text-editor/extensions/tooltip';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { CharacterCount } from '@tiptap/extension-character-count';
import { EditorView } from 'prosemirror-view';
import { Fragment, Slice } from 'prosemirror-model';
import { AnchorId } from 'editor/modules/rich-text-editor/extensions/anchorId';
import { Indent } from 'editor/modules/rich-text-editor/extensions/indent';
import { HangingIndent } from 'editor/modules/rich-text-editor/extensions/hanging-indent';
import { ParagraphExtension } from 'editor/modules/rich-text-editor/extensions/paragraph-extension';
import { FontSize } from 'editor/modules/rich-text-editor/extensions/font-size';
import { BulletListExtension } from 'editor/modules/rich-text-editor/extensions/bullet-list';
import { OrderedListExtension } from 'editor/modules/rich-text-editor/extensions/ordered-list';
import { HorizontalRuleExtension } from 'editor/modules/rich-text-editor/extensions/horizontal-rule';
import ToggleButtonComponentExtension
  from 'editor/modules/rich-text-editor/extensions/toggle-button-component-extension';
import DropListComponentExtension from 'editor/modules/rich-text-editor/extensions/drop-list-component-extension';
import TextFieldComponentExtension from 'editor/modules/rich-text-editor/extensions/text-field-component-extension';
import CheckboxComponentExtension from 'editor/modules/rich-text-editor/extensions/checkbox-component-extension';
import DropdownComponentExtension from 'editor/modules/rich-text-editor/extensions/dropdown-component-extension';
import MathFormulaExtension from 'editor/modules/rich-text-editor/extensions/math-formula-extension';

@Component({
  selector: 'aspect-rich-text-editor',
  standalone: false,
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss']
})
export class RichTextEditorComponent implements OnInit, AfterViewInit {
  @Input() content!: string | Record<string, any>;
  @Input() defaultFontSize!: number;
  @Input() clozeMode: boolean = false;
  @Input() showReducedControls: boolean = false;
  @Input() placeholder: string = '';
  @Input() autoFocus: boolean = false;
  @Input() disabled: boolean = false;
  @Input() controlPanelFolded: boolean = true;
  @Input() showWordCounter: boolean = false;
  @Output() contentChange = new EventEmitter<string | Record<string, any>>();
  @ViewChild('imageUpload') imageUpload!: ElementRef;

  selectedFontColor = 'black';
  selectedHighlightColor = 'lightgrey';
  selectedAnchorColor = '#dccce6';
  selectedAnchorIdText = '';
  selectedFontSize: string | null = null;
  selectedIndentSize = 20;
  bulletListStyle: string = 'disc';
  orderedListStyle: string = 'decimal';
  lastImageAlignment: 'inline' | 'none' | 'right' | 'left' = 'inline';

  defaultExtensions: AnyExtension[] = [];
  editor!: Editor;

  constructor(private injector: Injector, private dialogService: DialogService) { }

  ngOnInit(): void {
    this.defaultExtensions = [
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
      HorizontalRuleExtension,
      CharacterCount.configure(),
      Tooltip,
      MathFormulaExtension(this.injector)
    ];

    const activeExtensions = [...this.defaultExtensions];
    if (this.clozeMode) {
      activeExtensions.push(
        ToggleButtonComponentExtension(this.injector),
        DropListComponentExtension(this.injector),
        TextFieldComponentExtension(this.injector),
        ButtonComponentExtension(this.injector),
        CheckboxComponentExtension(this.injector),
        DropdownComponentExtension(this.injector)
      );
    }
    this.editor = new Editor({
      extensions: [
        ...activeExtensions,
        Placeholder.configure({
          placeholder: this.placeholder
        })],
      editorProps: {
        handlePaste: RichTextEditorComponent.handlePastePlainText,
        handleDrop: RichTextEditorComponent.handleDropPlainText
      }
    });
  }

  private static handlePastePlainText(view: EditorView, event: ClipboardEvent): boolean {
    const text = RichTextEditorComponent.getPlainText(event.clipboardData);
    if (!text) return false;
    event.preventDefault();
    const { from, to } = view.state.selection;
    RichTextEditorComponent.insertPlainText(view, text, from, to);
    return true;
  }

  private static handleDropPlainText(view: EditorView, event: DragEvent, slice: Slice, moved: boolean): boolean {
    if (moved) return false; // keep default behavior when dragging content within the editor
    const text = RichTextEditorComponent.getPlainText(event.dataTransfer);
    if (!text) return false;
    const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
    if (dropPos === undefined) return false;
    event.preventDefault();
    RichTextEditorComponent.insertPlainText(view, text, dropPos, dropPos);
    return true;
  }

  private static getPlainText(data: DataTransfer | null): string {
    const text = data?.getData('text/plain');
    if (text) return text;
    // Some sources only provide HTML; strip all markup and keep line breaks
    const html = data?.getData('text/html');
    if (!html) return '';
    const htmlWithLineBreaks = html
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>/gi, '\n');
    return new DOMParser().parseFromString(htmlWithLineBreaks, 'text/html').body.textContent?.trim() ?? '';
  }

  private static insertPlainText(view: EditorView, text: string, from: number, to: number): void {
    const { state, dispatch } = view;
    const lines = text.split(/\r\n?|\n/);
    if (lines.length === 1) {
      dispatch(state.tr.insertText(text, from, to));
      return;
    }
    const paragraphs = lines.map(line => state.schema.nodes.paragraph.create(
      null, line ? state.schema.text(line) : undefined
    ));
    const slice = new Slice(Fragment.fromArray(paragraphs), 1, 1);
    dispatch(state.tr.replaceRange(from, to, slice).scrollIntoView());
  }

  ngAfterViewInit(): void {
    if (this.autoFocus) this.editor.commands.focus();
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

  applyFontSize(size: string | null): void {
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
    this.lastImageAlignment = 'inline';
    this.imageUpload.nativeElement.click();
  }

  async insertBlockImage(alignment: 'none' | 'right' | 'left'): Promise<void> {
    this.lastImageAlignment = alignment;
    this.imageUpload.nativeElement.click();
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      FileService.readFileAsText(file, true).then(base64 => {
        if (FileService.isResizable(file.type)) {
          this.dialogService.showImageResizeDialog(base64, {}).subscribe(async options => {
            if (options) {
              const imgSrc = await FileService.scaleImage(base64, options);
              this.insertResizedImage(imgSrc);
            }
          });
        } else {
          this.insertResizedImage(base64);
        }
      });
    }
  }

  private insertResizedImage(imgSrc: string): void {
    if (this.lastImageAlignment === 'inline') {
      this.editor.commands.insertInlineImage({ src: imgSrc });
    } else {
      const style = this.lastImageAlignment === 'none' ? '' :
        `float: ${this.lastImageAlignment}; margin-${this.lastImageAlignment === 'left' ? 'right' : 'left'}: 10px;`;
      this.editor.commands.insertBlockImage({ src: imgSrc, style });
    }
  }

  toggleBlockquote(): void {
    this.editor.commands.toggleBlockquote();
  }

  insertLine(shortLine?: boolean): void {
    shortLine ? this.editor.commands.setHorizontalRuleShort() : this.editor.commands.setHorizontalRule();
  }

  insertToggleButton(): void {
    this.editor.commands.insertContent('<aspect-nodeview-toggle-button></aspect-nodeview-toggle-button>');
    this.editor.commands.focus();
  }

  insertDropList(): void {
    this.editor.commands.insertContent('<aspect-nodeview-drop-list></aspect-nodeview-drop-list>');
    this.editor.commands.focus();
  }

  insertDropdown(): void {
    this.editor.commands.insertContent('<aspect-nodeview-dropdown></aspect-nodeview-dropdown>');
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

  insertFormula() {
    this.editor.commands.insertContent('<aspect-nodeview-math-formula></aspect-nodeview-math-formula>');
    this.editor.commands.focus();
  }
}

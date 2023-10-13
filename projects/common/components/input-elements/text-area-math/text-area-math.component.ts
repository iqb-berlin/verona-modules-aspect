import {
  Component, ElementRef,
  Input, OnInit, Renderer2, ViewChild
} from '@angular/core';
import { TextAreaMathElement } from 'common/models/elements/input-elements/text-area-math';
import { MathInputComponent } from 'common/math-editor.module';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-text-area-math',
  template: `
    <button #insertFormulaButton
            mat-icon-button [matTooltip]="'Formel einfügen'"
            [matTooltipPosition]="'above'"
            cdkOverlayOrigin #trigger="cdkOverlayOrigin"
            [disabled]="!textareaIsFocused"
            (click)="toggleFormulaOverlay()">
      <mat-icon>functions</mat-icon>
    </button>
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="trigger"
                 [cdkConnectedOverlayOpen]="isOverlayOpen">
      <div class="formula-overlay"
           cdkDrag>
        Formeleingabe
        <aspect-mathlive-math-field #mathfield>
        </aspect-mathlive-math-field>
        <div [style.display]="'flex'" [style.flex-direction]="'row'">
          <button mat-button (click)="onConfirmFormula()">
            {{'confirm' | translate }}
          </button>
          <button mat-button (click)="cancelFormula()">
            {{'cancel' | translate }}
          </button>
        </div>
      </div>
    </ng-template>
    <!-- Always set min-height to rowCount -->
    <!-- Fix height when set, so that area scrolls -->
    <div class="textarea"
         [style.min-height.px]="(elementModel.styling.fontSize * (elementModel.styling.lineHeight / 100)) *
                                elementModel.rowCount"
         [style.height.px]="!elementModel.hasAutoHeight &&
                            (elementModel.styling.fontSize * (elementModel.styling.lineHeight / 100))
                             * elementModel.rowCount">
      <span #textarea contenteditable="true"
            [innerHTML]="(savedValue ? savedValue : elementModel.value) | safeResourceHTML"
            (keydown)="elementModel.readOnly ? $event.preventDefault() : null"
            (paste)="elementModel.readOnly ? $event.preventDefault() : null"
            [style.display]="'block'"
            [style.overflow-y]="!elementModel.hasAutoHeight && 'auto'"
            [style.background-color]="elementModel.styling.backgroundColor"
            [style.line-height.%]="elementModel.styling.lineHeight"
            [style.color]="elementModel.styling.fontColor"
            [style.font-family]="elementModel.styling.font"
            [style.font-size.px]="elementModel.styling.fontSize"
            [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
            [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
            [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
            (focus)="textareaIsFocused=true"
            (blur)="onBlur($event)"
            (input)="elementFormControl.setValue(textArea.nativeElement.innerHTML)">
      </span>
    </div>
    <mat-error *ngIf="elementFormControl.errors && elementFormControl.touched">
      {{elementFormControl.errors | errorTransform: elementModel}}
    </mat-error>
  `,
  styles: [
    ':host {display: flex; flex-direction: column; height: 100%;}',
    // margin for showing focus-outline
    '.textarea {border: 1px solid black; border-radius: 3px; flex-grow: 1; margin: 1px;}',
    '.textarea span {height: 100%;}',
    '.textarea span:focus {outline: 2px solid #3f51b5;}',
    '::ng-deep math-field:focus {outline: 2px solid #3f51b5;}',
    '.formula {display: inline-block;}',
    '.formula-overlay {display: flex; flex-direction: column; background-color: lightgray; padding: 10px;}',
    '.formula-overlay aspect-mathlive-math-field {background-color: white;}'
  ]
})
export class TextAreaMathComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: TextAreaMathElement;
  @ViewChild('textarea') textArea!: ElementRef;
  @ViewChild('insertFormulaButton', { read: ElementRef }) insertFormulaButton!: ElementRef;
  @ViewChild('mathfield') mathfieldRef!: MathInputComponent;
  savedValue: string = '';
  isOverlayOpen = false;
  range!: Range;
  formulaIndex!: number;
  textareaIsFocused: boolean = false;

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2) {
    super(elementRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.parentForm) this.savedValue = this.elementFormControl.value;
  }

  onConfirmFormula(): void {
    this.isOverlayOpen = false;

    if (this.elementModel.readOnly) return;
    const formula = this.createFormula(this.mathfieldRef.getMathMLValue());
    this.insertFormula(formula);

    this.updateTextArea();
    this.elementFormControl.setValue(this.textArea.nativeElement.innerHTML);
    this.setFocusAndCursor();
  }

  onBlur(event: FocusEvent): void {
    if (event.relatedTarget !== this.insertFormulaButton.nativeElement) {
      this.textareaIsFocused = false;
      this.elementFormControl.markAsTouched();
    }
  }

  private createFormula(newContent: string): Element {
    const formulaWrapper = this.renderer.createElement('span');
    this.renderer.setAttribute(formulaWrapper, 'contenteditable', 'true');
    this.renderer.addClass(formulaWrapper, 'formula');

    const mathElement = this.renderer.createElement('math');
    this.renderer.setStyle(mathElement, 'display', 'inline-block');
    this.renderer.setProperty(mathElement, 'innerHTML', newContent);
    this.renderer.appendChild(formulaWrapper, mathElement);

    return formulaWrapper;
  }

  private insertFormula(formulaWrapper: Element): void {
    const documentFragment = document.createDocumentFragment();
    // Insert space before
    documentFragment.appendChild(document.createTextNode('\xA0'));
    const formulaNode = documentFragment.appendChild(formulaWrapper);
    // Insert space after
    documentFragment.appendChild(document.createTextNode('\xA0'));
    this.range.deleteContents();
    this.range.insertNode(documentFragment);
    const elements = Array.from(this.textArea.nativeElement.childNodes);
    this.formulaIndex = elements.indexOf(formulaNode);
  }

  private setFocusAndCursor(): void {
    const range = document.createRange();
    const selection = window.getSelection() as Selection;
    range.setStart(this.textArea.nativeElement.childNodes[this.formulaIndex], 1);
    selection.removeAllRanges();
    selection.addRange(range);
    this.textArea.nativeElement.focus();
  }

  private updateTextArea(): void {
    this.renderer.setProperty(this.textArea.nativeElement, 'innerHTML', this.textArea.nativeElement.innerHTML);
  }

  toggleFormulaOverlay(): void {
    this.isOverlayOpen = !this.isOverlayOpen;
    this.setRange();
  }

  private setRange(): void {
    const selection = window.getSelection() as Selection;
    if (selection && selection.rangeCount > 0) {
      this.range = selection.getRangeAt(0);
    }
  }

  cancelFormula() {
    this.isOverlayOpen = false;
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(this.range);
    this.textArea.nativeElement.focus();
  }
}

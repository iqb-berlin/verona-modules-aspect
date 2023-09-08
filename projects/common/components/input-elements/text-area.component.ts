// eslint-disable-next-line max-classes-per-file
import {
  AfterViewInit,
  Component, Directive, ElementRef, Input, Renderer2
} from '@angular/core';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-area',
  template: `
    <mat-form-field
      [ngClass]="{ 'no-label' : !elementModel.label}"
      [style.width.%]="100"
      [style.height.%]="100"
      [style.min-height.%]="100"
      aspectInputBackgroundColor [backgroundColor]="elementModel.styling.backgroundColor"
      [style.color]="elementModel.styling.fontColor"
      [style.font-size.px]="elementModel.styling.fontSize"
      [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
      [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
      [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
      [appearance]="$any(elementModel.appearance)">
      <mat-label *ngIf="elementModel.label">{{elementModel.label}}</mat-label>
      <mat-icon *ngIf="!elementFormControl.touched && elementModel.hasKeyboardIcon"
                class="keyboard-icon"
                [style.top.px]="elementModel.styling.fontSize/2">
        keyboard_outline
      </mat-icon>
      <textarea matInput #input
                autocomplete="off"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                value="{{elementModel.value}}"
                dynamicRows
                [autoHeight]="elementModel.hasAutoHeight"
                [expectedCharactersCount]="elementModel.expectedCharactersCount"
                [fontSize]="elementModel.styling.fontSize"
                (dynamicRowsChange)="dynamicRows = $event"
                [rows]="elementModel.hasDynamicRowCount && dynamicRows ? dynamicRows : elementModel.rows"
                [attr.inputmode]="elementModel.showSoftwareKeyboard ? 'none' : 'text'"
                [formControl]="elementFormControl"
                [readonly]="elementModel.readOnly"
                [style.min-width.%]="100"
                [style.line-height.%]="elementModel.styling.lineHeight"
                [style.resize]="elementModel.resizeEnabled ? 'vertical' : 'none'"
                (keydown)="onKeyDown.emit({keyboardEvent: $event, inputElement: input})"
                (focus)="focusChanged.emit({ inputElement: input, focused: true })"
                (blur)="focusChanged.emit({ inputElement: input, focused: false })">
      </textarea>
      <mat-error *ngIf="elementFormControl.errors">
        {{elementFormControl.errors | errorTransform: elementModel}}
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
      :host ::ng-deep .small-input div.mdc-notched-outline {
        top: 0.45em;
        bottom: 0.45em;
        height: unset;
      }
      :host ::ng-deep .small-input .mdc-notched-outline__notch {
        display: none;
      }
      .keyboard-icon {
        position: absolute;
        right: 0;
        font-size: 150%;
      }
  `]
})
export class TextAreaComponent extends TextInputComponent {
  @Input() elementModel!: TextAreaElement;
  dynamicRows: number = 0;
}

@Directive({
  selector: '[autoHeight]'
})
export class AutoHeightDirective implements AfterViewInit {
  @Input() autoHeight!: boolean;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (this.autoHeight) {
      this.renderer.listen(this.elementRef.nativeElement, 'input', () => this.resize());
      setTimeout(() => this.resize());
    }
  }

  private resize() {
    this.renderer
      .setStyle(this.elementRef.nativeElement, 'height', 'auto');
    // after calculating the scroll height, set it to the element
    this.renderer
      .setStyle(this.elementRef.nativeElement, 'height', `${this.elementRef.nativeElement.scrollHeight}px`);
  }
}

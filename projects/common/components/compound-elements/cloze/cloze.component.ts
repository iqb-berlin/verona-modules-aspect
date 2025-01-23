import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { ClozeChildOverlay } from './cloze-child-overlay.component';

// TODO background color implementieren
@Component({
  selector: 'aspect-cloze',
  template: `
    <div [style.width.%]="100"
         [style.height]="'auto'"
         [style.column-count]="elementModel.columnCount">
      <ng-container *ngFor="let part of elementModel.document?.content">
        <ul *ngIf="part.type === 'bulletList'"
            [style.font-size]="part.attrs.fontSize"
            [style.list-style]="part.attrs.listStyle">
          <li *ngFor="let listItem of part.content">
            <ng-container *ngFor="let listItemPart of $any(listItem).content"
                          [ngTemplateOutlet]="paragraphs"
                          [ngTemplateOutletContext]="{ $implicit: listItemPart }"></ng-container>
          </li>
        </ul>
        <ol *ngIf="part.type === 'orderedList'"
            [style.font-size]="part.attrs.fontSize"
            [style.list-style]="part.attrs.listStyle">
          <li *ngFor="let listItem of part.content">
            <ng-container *ngFor="let listItemPart of $any(listItem).content"
                          [ngTemplateOutlet]="paragraphs"
                          [ngTemplateOutletContext]="{ $implicit: listItemPart }"></ng-container>
          </li>
        </ol>
        <blockquote *ngIf="part.type === 'blockquote'">
          <ng-container *ngFor="let blockquotePart of $any(part).content"
                        [ngTemplateOutlet]="paragraphs"
                        [ngTemplateOutletContext]="{ $implicit: blockquotePart }"></ng-container>
        </blockquote>
        <ng-container *ngIf="part.type === 'paragraph' || part.type === 'heading'"
                      [ngTemplateOutlet]="paragraphs"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
        <img *ngIf="part.type === 'blockImage'"
             [src]="part.attrs.src" [alt]="$any(part.attrs.alt)">
      </ng-container>
    </div>

    <ng-template #paragraphs let-part>
      <p *ngIf="part.type === 'paragraph'"
         [style.line-height.%]="elementModel.styling.lineHeight"
         [style.color]="elementModel.styling.fontColor"
         [style.font-size.px]="elementModel.styling.fontSize"
         [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
         [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''"
         [style.margin-bottom]="part.attrs?.margin + 'px'"
         [style.margin-left]="part.attrs?.hangingIndent ? '' :
           ($any(part.attrs?.indentSize) * $any(part.attrs?.indent)) + 'px'"
         [style.text-align]="part.attrs?.textAlign"
         [style.text-indent]="part.attrs?.hangingIndent ?
           ($any(part.attrs?.indentSize) * $any(part.attrs?.indent)) + 'px' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </p>
      <h1 *ngIf="part.type === 'heading' && part.attrs.level === 1"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h1>
      <h2 *ngIf="part.type === 'heading' && part.attrs.level === 2"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h2>
      <h3 *ngIf="part.type === 'heading' && part.attrs.level === 3"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h3>
      <h4 *ngIf="part.type === 'heading' && part.attrs.level === 4"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h4>
      <h5 *ngIf="part.type === 'heading' && part.attrs.level === 5"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h5>
      <h6 *ngIf="part.type === 'heading' && part.attrs.level === 6"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.styling.lineHeight"
          [style.color]="elementModel.styling.fontColor"
          [style.font-size.px]="elementModel.styling.fontSize"
          [style.font-weight]="elementModel.styling.bold ? 'bold' : ''"
          [style.font-style]="elementModel.styling.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.styling.underline ? 'underline' : ''">
          <ng-container [ngTemplateOutlet]="paragraphChildren"
                        [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h6>
    </ng-template>

    <ng-template #paragraphChildren let-part>
      <ng-container *ngFor="let subPart of part.content">
        <ng-container *ngIf="$any(subPart).type === 'text' &&
                             (!(subPart.marks | markList | arrayIncludes:'superscript')) &&
                             (!(subPart.marks | markList | arrayIncludes:'subscript')) &&
                             (!(subPart.marks | markList | arrayIncludes:'strike'))">
          <span [ngStyle]="subPart.marks | styleMarks">{{subPart.text}}</span>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'text' && ((subPart.marks | markList) | arrayIncludes:'superscript')">
          <sup [ngStyle]="subPart.marks | styleMarks">{{subPart.text}}</sup>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'text' && ((subPart.marks | markList) | arrayIncludes:'subscript')">
          <sub [ngStyle]="subPart.marks | styleMarks">{{subPart.text}}</sub>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'text' && ((subPart.marks | markList) | arrayIncludes:'strike')">
          <s [ngStyle]="subPart.marks | styleMarks">{{subPart.text}}</s>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'inlineImage'">
          <img [src]="subPart.attrs.src" [alt]="subPart.attrs.alt"
               [style.display]="'inline-block'"
               [style.height]="'1em'"
               [style.vertical-align]="'middle'">
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'math-formula'">
          <span [innerHTML]="domSanitizer.bypassSecurityTrustHtml($any(subPart).attrs.formulaHTML)"></span>
        </ng-container>
        <aspect-compound-child-overlay
          *ngIf="ClozeElement.validChildElements | arrayIncludes:subPart.type"
          [style.display]="'inline-block'"
          [parentForm]="parentForm"
          [element]="$any(subPart).attrs.model"
          [style.vertical-align]="subPart.attrs.model.type === 'toggle-button' &&
                                    subPart.attrs.model.verticalOrientation === true ?
                                      'middle' : 'baseline'"
          [editorMode]="editorMode"
          (elementSelected)="childElementSelected.emit($event)">
        </aspect-compound-child-overlay>
      </ng-container>
    </ng-template>
  `,
  styles: [
    'p {margin: 0}',
    ':host ::ng-deep p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    '::ng-deep p:empty::after {content: \'\'; display: inline-block;}', // render empty p
    'p span {font-size: inherit}',
    'sup, sub {line-height: 0;}',
    '.droplist-child {vertical-align: middle;}'
  ]
})
export class ClozeComponent extends CompoundElementComponent {
  @Input() elementModel!: ClozeElement;
  @Output() childElementSelected = new EventEmitter<ClozeChildOverlay>();
  @ViewChildren(ClozeChildOverlay) compoundChildren!: QueryList<ClozeChildOverlay>;

  protected readonly ClozeElement = ClozeElement;
  editorMode: boolean = false;

  constructor(public elementRef: ElementRef, public domSanitizer: DomSanitizer) {
    super(elementRef);
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.map((child: ClozeChildOverlay) => child.childComponent);
  }
}

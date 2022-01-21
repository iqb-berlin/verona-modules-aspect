import {
  Component, EventEmitter, Input, Output, QueryList, ViewChildren
} from '@angular/core';
import { ClozeElement } from './cloze-element';
import { CompoundElementComponent } from '../../directives/compound-element.directive';
import { ClozeDocumentParagraph, ClozeDocumentPart, InputElement } from '../../models/uI-element';
import { FormElementComponent } from '../../directives/form-element-component.directive';
import { CompoundChildOverlayComponent } from '../../directives/cloze-child-overlay/compound-child-overlay.component';
import { ElementComponent } from '../../directives/element-component.directive';
import { LikertRadioButtonGroupComponent } from '../likert/likert-radio-button-group.component';

@Component({
  selector: 'app-cloze',
  template: `
    <ng-container *ngIf="elementModel.document.content.length == 0">
      Kein Dokument vorhanden
    </ng-container>
    <div [class.center-content]="elementModel.positionProps.dynamicPositioning &&
                                 elementModel.positionProps.fixedSize"
         [style.width]="elementModel.positionProps.fixedSize ? elementModel.width + 'px' : '100%'"
         [style.height]="elementModel.positionProps.fixedSize ? elementModel.height + 'px' : 'auto'">
      <ng-container *ngFor="let part of elementModel.document.content">
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
      </ng-container>
    </div>

    <ng-template #paragraphs let-part>
      <p *ngIf="part.type === 'paragraph'"
         [style.line-height.%]="elementModel.fontProps.lineHeight"
         [style.color]="elementModel.fontProps.fontColor"
         [style.font-family]="elementModel.fontProps.font"
         [style.font-size.px]="elementModel.fontProps.fontSize"
         [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
         [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
         [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''"
         [style.margin-bottom]="part.attrs.margin + 'px'"
         [style.margin-left]="part.attrs.hangingIndent ? '' :
               ($any(part.attrs.indentSize) * $any(part.attrs.indent)) + 'px'"
         [style.text-align]="part.attrs.textAlign"
         [style.text-indent]="part.attrs.hangingIndent ?
               ($any(part.attrs.indentSize) * $any(part.attrs.indent)) + 'px' :
               ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </p>
      <h1 *ngIf="part.type === 'heading' && part.attrs.level === 1"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h1>
      <h2 *ngIf="part.type === 'heading' && part.attrs.level === 2"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h2>
      <h3 *ngIf="part.type === 'heading' && part.attrs.level === 3"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h3>
      <h4 *ngIf="part.type === 'heading' && part.attrs.level === 4"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h4>
      <h5 *ngIf="part.type === 'heading' && part.attrs.level === 5"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h5>
      <h6 *ngIf="part.type === 'heading' && part.attrs.level === 6"
          [style.display]="'inline'"
          [style.line-height.%]="elementModel.fontProps.lineHeight"
          [style.color]="elementModel.fontProps.fontColor"
          [style.font-family]="elementModel.fontProps.font"
          [style.font-size.px]="elementModel.fontProps.fontSize"
          [style.font-weight]="elementModel.fontProps.bold ? 'bold' : ''"
          [style.font-style]="elementModel.fontProps.italic ? 'italic' : ''"
          [style.text-decoration]="elementModel.fontProps.underline ? 'underline' : ''">
        <ng-container [ngTemplateOutlet]="paragraphChildren"
                      [ngTemplateOutletContext]="{ $implicit: part }"></ng-container>
      </h6>
    </ng-template>

    <ng-template #paragraphChildren let-part>
      <ng-container *ngFor="let subPart of part.content">
        <ng-container *ngIf="$any(subPart).type === 'text'">
          <span [ngStyle]="subPart.marks | styleMarks">
            {{subPart.text}}
          </span>
        </ng-container>
        <ng-container *ngIf="$any(subPart).type === 'image'">
          <img [src]="subPart.attrs.src" [alt]="subPart.attrs.alt"
               [style.display]="'inline-block'"
               [style.height]="'1em'"
               [style.vertical-align]="'middle'">
        </ng-container>
        <span *ngIf="['ToggleButton', 'DropList', 'TextField'].includes(subPart.type)">
          <app-compound-child-overlay [style.display]="'inline-block'"
                                      [parentForm]="parentForm"
                                      [element]="$any(subPart).attrs.model"
                                      [editorMode]="editorMode"
                                      (elementSelected)="childElementSelected.emit($event)"
                                      (elementValueChanged)="elementValueChanged.emit($event)">
          </app-compound-child-overlay>
        </span>
      </ng-container>
    </ng-template>
  `,
  styles: [
    ':host ::ng-deep app-text-field {vertical-align: middle}',
    ':host ::ng-deep app-text-field .mat-form-field-wrapper {height: 100%; padding-bottom: 0; margin: 0}',
    ':host ::ng-deep app-text-field .mat-form-field {height: 100%}',
    ':host ::ng-deep app-text-field .mat-form-field-flex {height: 100%}',
    'p {margin: 0}',
    ':host ::ng-deep p strong {letter-spacing: 0.04em; font-weight: 600;}', // bold less bold
    ':host ::ng-deep p:empty::after {content: "\\00A0"}', // render empty p
    'p span {font-size: inherit}',
    'sup, sub {line-height: 0;}'
  ]
})
export class ClozeComponent extends CompoundElementComponent {
  @Input() elementModel!: ClozeElement;
  @Output() childElementSelected = new EventEmitter<CompoundChildOverlayComponent>();
  @ViewChildren(CompoundChildOverlayComponent) compoundChildren!: QueryList<CompoundChildOverlayComponent>;

  editorMode: boolean = false;

  getFormElementModelChildren(): InputElement[] {
    return this.elementModel.getChildElements();
  }

  getFormElementChildrenComponents(): ElementComponent[] {
    return this.compoundChildren.map((child: CompoundChildOverlayComponent) => child.childComponent);
  }
}

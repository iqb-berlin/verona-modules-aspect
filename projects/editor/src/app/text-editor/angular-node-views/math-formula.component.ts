import {
  Component, OnInit, ViewChild,
  ElementRef
} from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { convertLatexToMarkup } from '@iqb/mathlive';

@Component({
  selector: 'aspect-nodeview-math-formula',
  imports: [
    FormsModule
  ],
  template: `
    @if (!editMode) {
      <span class="formula-field" [innerHTML]="sanitizedFormula" (click)="toggleEditMode()"></span>
    } @else {
      <span #editField class="formula-field" contenteditable="true"
            (keydown.enter)="updateFormula($any($event.target).innerText);"
            (blur)="updateFormula($any($event.target).innerText);">{{formula}}</span>
    }`,
  styles: [`
    .formula-field {
      background-color: lightblue;
      display: inline-block;
      min-width: 40px;
    }

    /* Add invisible character to prevent collapse when empty */
    span:empty:before {
      content: "\\200b";
    }
  `]
})
export class MathFormulaNodeviewComponent extends AngularNodeViewComponent implements OnInit {
  @ViewChild('editField') editField!: ElementRef<HTMLSpanElement>;
  editMode = false;
  formula = '';
  sanitizedFormula: SafeHtml | undefined;

  constructor(private domSanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {
    this.updateFormula(this.node.attrs.formula);
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    setTimeout(() => this.editField.nativeElement.focus(), 0);
  }

  updateFormula(formula: string) {
    this.formula = formula;
    const markup = formula ? convertLatexToMarkup(formula) : '';
    this.sanitizedFormula = this.domSanitizer.bypassSecurityTrustHtml(markup);
    this.editMode = false;

    // Fix Angular change detection, when TipTap re-renders the something(?)
    setTimeout(() => this.updateAttributes({
      formula: formula,
      formulaHTML: markup
    }), 0);
  }
}

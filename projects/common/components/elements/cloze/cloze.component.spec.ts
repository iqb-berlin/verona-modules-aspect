import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClozeElement, ClozeProperties } from 'common/models/elements/cloze';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { StyleMarksPipe } from 'common/pipes/style-marks.pipe';
import { MarkListPipe } from 'common/pipes/mark-list.pipe';
import { ArrayIncludesPipe } from 'common/pipes/array-includes.pipe';
import { MathFormulaPipe } from 'common/pipes/math-formula.pipe';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
import { UIElement } from 'common/models/elements/element';
import {
  ClozeChildOverlayComponent
} from 'common/components/cloze-child-overlay/cloze-child-overlay.component';
import { ClozeComponent } from './cloze.component';

@Component({
  selector: 'aspect-compound-child-overlay',
  template: '',
  standalone: false
})
class MockClozeChildOverlayComponent {
  @Input() element!: UIElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() editorMode!: boolean;
  @Output() elementSelected = new EventEmitter<ClozeChildOverlayComponent>();
}

describe('ClozeComponent', () => {
  let component: ClozeComponent;
  let fixture: ComponentFixture<ClozeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ClozeComponent,
        MockClozeChildOverlayComponent,
        SafeResourceHTMLPipe,
        StyleMarksPipe,
        MarkListPipe,
        ArrayIncludesPipe,
        MathFormulaPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClozeComponent);
    component = fixture.componentInstance;
    component.elementModel = new ClozeElement({
      type: 'cloze',
      id: 'test-cloze',
      columnCount: 1,
      document: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: 'Test text' }]
        }]
      }
    } as Partial<ClozeProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the document content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('Test text');
  });

  /* The cloze renders a formula node itself, from the LaTeX on the node, so a document carrying one
     built by an older editor still displays like one written today (#1105). Without a case that has
     such a node the `mathFormula` pipe would never be resolved here either, and a missing declaration
     would only surface as NG0302 in production. */
  it('should build a formula in its document from the LaTeX, not from the stored markup', () => {
    component.elementModel = new ClozeElement({
      type: 'cloze',
      id: 'cloze-formula',
      columnCount: 1,
      document: {
        type: 'doc',
        content: [{
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Fläche ' },
            {
              type: 'math-formula',
              attrs: { formula: '\\overline{BC}', formulaHTML: '<span class="katex"><math></math></span>' }
            }
          ]
        }]
      }
    } as Partial<ClozeProperties>);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.ML__latex')).toBeTruthy();
    expect(compiled.querySelector('math')).toBeNull();
  });

  /* Which children hang in the line by their box and which by their text (#1435). A dropdown wears
     the element's font since then, so its text meets the text beside it; a drop list is a box and
     stays centred. One expression in the template decides it for every child type, and a wrong entry
     in its list is invisible until someone looks at a cloze. */
  it('should align a dropdown child on the baseline and a drop list in the middle', () => {
    /* The document goes on the element that is already built: the constructor instantiates the child
       models through the registry, which is not reachable from here. What the binding reads is the
       type on the model, and that is all these two need to carry. */
    component.elementModel.document = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        attrs: {},
        content: [
          { type: 'text', text: 'Ein Dreieck hat ' },
          {
            type: 'Dropdown',
            attrs: { model: { type: 'dropdown' } as UIElement }
          },
          { type: 'text', text: ' Ecken, und hier liegt ' },
          {
            type: 'DropList',
            attrs: { model: { type: 'drop-list' } as UIElement }
          }
        ]
      }]
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const kinder = compiled.querySelectorAll<HTMLElement>('aspect-compound-child-overlay');
    expect(kinder.length).toBe(2);
    expect(kinder[0].style.verticalAlign).toBe('baseline');
    expect(kinder[1].style.verticalAlign).toBe('middle');
  });
});

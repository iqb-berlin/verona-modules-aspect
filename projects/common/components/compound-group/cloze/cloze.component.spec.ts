import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClozeElement, ClozeProperties } from 'common/models/elements/compound-elements/cloze/cloze';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { StyleMarksPipe } from 'common/pipes/styleMarks.pipe';
import { MarkListPipe } from 'common/pipes/mark-list.pipe';
import { ArrayIncludesPipe } from 'common/pipes/array-includes.pipe';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
import { UIElement } from 'common/models/elements/element';
import { ClozeComponent } from './cloze.component';
import {
  ClozeChildOverlayComponent
} from '../cloze-child-overlay/cloze-child-overlay.component';

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
        ArrayIncludesPipe
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
});

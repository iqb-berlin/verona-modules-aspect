import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor/widget-molecule-editor';
import { WidgetMoleculeEditorComponent } from './widget-molecule-editor.component';

describe('WidgetMoleculeEditorComponent', () => {
  let component: WidgetMoleculeEditorComponent;
  let fixture: ComponentFixture<WidgetMoleculeEditorComponent>;

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [WidgetMoleculeEditorComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetMoleculeEditorComponent);
    component = fixture.componentInstance;
    component.elementModel = new WidgetMoleculeEditorElement({
      id: 'test-id',
      alias: 'test-alias',
      type: 'widget-molecule-editor'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit widget call event', () => {
    spyOn(component.widgetCallEvent, 'emit');
    component.emitWidgetCall();
    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({ bondingType: 'VALENCE' });
  });
});

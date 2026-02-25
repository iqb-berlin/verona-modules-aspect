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

  it('should parse imageSrc from state correctly', () => {
    component.elementModel.state = JSON.stringify({ asImage: 'some_base64_data' });
    expect(component.imageSrc).toEqual('data:image/png;base64,some_base64_data');

    component.elementModel.state = JSON.stringify({ asImage: 'data:image/jpeg;base64,other_base64_data' });
    expect(component.imageSrc).toEqual('data:image/jpeg;base64,other_base64_data');

    component.elementModel.state = '{}';
    expect(component.imageSrc).toBeNull();
  });
});

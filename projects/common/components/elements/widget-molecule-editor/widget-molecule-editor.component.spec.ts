import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'common/environment';
import { WidgetMoleculeEditorElement } from 'common/models/elements/widget-molecule-editor';
import { WidgetMoleculeEditorComponent } from './widget-molecule-editor.component';

describe('WidgetMoleculeEditorComponent', () => {
  let component: WidgetMoleculeEditorComponent;
  let fixture: ComponentFixture<WidgetMoleculeEditorComponent>;

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [WidgetMoleculeEditorComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule]
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

  /* The widget reads the bonding type as a shared parameter; sent as a parameter, it never reached
     the widget (#1420). */
  it('should emit the picker settings as parameters and the bonding type as a shared parameter', () => {
    vi.spyOn(component.widgetCallEvent, 'emit');
    component.elementModel.bondingType = 'ELECTRONS';
    component.elementModel.showInfoName = true;
    component.elementModel.showInfoOrder = false;
    component.elementModel.highlightBlocks = true;

    component.emitWidgetCall();

    expect(component.widgetCallEvent.emit).toHaveBeenCalledWith({
      parameters: { showInfoName: true, showInfoOrder: false, highlightBlocks: true },
      sharedParameters: { bondingType: 'ELECTRONS' }
    });
  });
});

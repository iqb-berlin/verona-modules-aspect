import { UIElementProperties, Measurement } from 'common/models/ui-element-interfaces';
import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  TablePropertiesComponent
} from './table-properties.component';

@Component({ selector: 'aspect-size-input-panel', standalone: false, template: '' })
class MockSizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<Measurement>();
}

describe('TablePropertiesComponent', () => {
  let component: TablePropertiesComponent;
  let fixture: ComponentFixture<TablePropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let messageService: SpyObj<MessageService>;
  let tablePropUpdated: Subject<string>;
  let emitted: { property: string; value: unknown }[];

  interface InputEventTargetMock { checkValidity: () => boolean; value: string | number }

  const createChangeEvent = (valid: boolean, value: string): { event: Event, target: InputEventTargetMock } => {
    const target: InputEventTargetMock = { checkValidity: () => valid, value };
    return { event: { target } as unknown as Event, target };
  };

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['showDefaultEditDialog']);
    messageService = createSpyObj<MessageService>(['showError']);
    tablePropUpdated = new Subject<string>();

    await TestBed.configureTestingModule({
      declarations: [TablePropertiesComponent, MockSizeInputPanelComponent, MergedCheckboxComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ElementService, useValue: elementService },
        { provide: MessageService, useValue: messageService },
        { provide: UnitService, useValue: { tablePropUpdated } as unknown as UnitService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TablePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'table',
      elements: [
        { gridRow: 1, gridColumn: 1 },
        { gridRow: 2, gridColumn: 3 }
      ] as unknown as UIElementProperties[],
      gridRowSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }, { value: 1, unit: 'fr' }],
      tableEdgesEnabled: false,
      headerEnabled: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive the minimum row and column count from the child elements', () => {
    expect(component.maxRowIndex).toBe(2);
    expect(component.maxColIndex).toBe(3);
  });

  it('should recalculate the maximum indices when a table property was updated', fakeAsync(() => {
    (component.combinedProperties.elements as unknown as { gridRow: number; gridColumn: number }[])
      .push({ gridRow: 5, gridColumn: 1 });

    tablePropUpdated.next('elements');
    tick();

    expect(component.maxRowIndex).toBe(5);
  }));

  it('should render a size input panel for every row and column', () => {
    expect(fixture.nativeElement.querySelectorAll('aspect-size-input-panel').length).toBe(5);
  });

  it('should append new default sizes when the row count grows', () => {
    component.modifySizeArray('gridRowSizes', 3, createChangeEvent(true, '3').event);

    expect(emitted).toEqual([{
      property: 'gridRowSizes',
      value: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
    }]);
  });

  it('should cut off sizes when the column count shrinks', () => {
    component.modifySizeArray('gridColumnSizes', 1, createChangeEvent(true, '1').event);

    expect(emitted).toEqual([{ property: 'gridColumnSizes', value: [{ value: 1, unit: 'fr' }] }]);
  });

  it('should refuse an invalid size count and show an error message', () => {
    const { event, target } = createChangeEvent(false, '0');

    component.modifySizeArray('gridRowSizes', 0, event);

    expect(messageService.showError).toHaveBeenCalledWith('Zeile enthält Elemente');
    expect(emitted).toEqual([]);
    expect(target.value).toBe(2);
  });

  it('should emit the changed size of a single column', () => {
    component.changeGridSize('gridColumnSizes', 1, { value: 100, unit: 'px' });

    expect(emitted).toEqual([{
      property: 'gridColumnSizes',
      value: [{ value: 1, unit: 'fr' }, { value: 100, unit: 'px' }, { value: 1, unit: 'fr' }]
    }]);
  });

  it('should emit updateModel when the header checkbox is toggled', () => {
    const headerInput = Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input') as NodeListOf<HTMLInputElement>
    )[1];
    headerInput.click();

    expect(emitted).toEqual([{ property: 'headerEnabled', value: true }]);
  });

  it('should open the element edit dialog', () => {
    const editButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    editButton.click();

    expect(elementService.showDefaultEditDialog).toHaveBeenCalled();
  });
});

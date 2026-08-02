import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { Hotspot } from 'common/models/elements/input-group-elements/hotspot-image';
import {
  HotspotEditDialogComponent
} from 'editor/src/app/components/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import {
  NumberFieldDirective
} from 'editor/src/app/modules/properties-panel/directives/number-field.directive';

describe('HotspotEditDialogComponent', () => {
  let component: HotspotEditDialogComponent;
  let fixture: ComponentFixture<HotspotEditDialogComponent>;
  let dialogRefMock: { close: Mock };
  let hotspot: Hotspot;

  beforeEach(async () => {
    hotspot = {
      top: 10,
      left: 20,
      width: 30,
      height: 40,
      shape: 'rectangle',
      borderWidth: 1,
      borderColor: '#000000',
      backgroundColor: '#ffffff',
      rotation: 0,
      value: true,
      readOnly: false
    };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [HotspotEditDialogComponent, NumberFieldDirective],
      imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { hotspot } },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HotspotEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit a copy of the injected hotspot', () => {
    expect(component.newHotspot).toEqual(hotspot);
    expect(component.newHotspot).not.toBe(hotspot);

    component.newHotspot.width = 500;

    expect(hotspot.width).toBe(30);
  });

  it('should show the current value and readOnly state', () => {
    const checkboxes = fixture.nativeElement
      .querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
  });

  it('should fall back to 0 for an emptied number input', () => {
    const topInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    topInput.value = '';
    topInput.dispatchEvent(new Event('input'));
    topInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.newHotspot.top).toBe(0);
  });

  it('should close with the edited copy', () => {
    component.newHotspot.shape = 'ellipse';
    const saveButton = fixture.nativeElement.querySelector('.mat-mdc-dialog-actions button') as HTMLButtonElement;

    saveButton.click();

    expect(dialogRefMock.close).toHaveBeenCalledWith(component.newHotspot);
    expect(hotspot.shape).toBe('rectangle');
  });

  /* The six number boxes carried `min="0"` and nothing enforced it, so a negative size or rotation
     could be confirmed into the unit definition (#1161). Unlike the panel, assigning into the
     draft was never the problem here - the dialog hands its copy back on confirm - but the binding
     had to become one-way so the directive can put a refused entry back. */
  describe('the number boxes', () => {
    const boxes = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
    );
    const edit = async (box: HTMLInputElement, value: string): Promise<void> => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('should take an edited value into the draft', async () => {
      await edit(boxes()[0], '25');

      expect(component.newHotspot.top).toBe(25);
    });

    it('should turn an emptied box into a zero', async () => {
      await edit(boxes()[2], '');

      expect(component.newHotspot.width).toBe(0);
    });

    it('should refuse a negative size and put the box back', async () => {
      const before = component.newHotspot.width;

      await edit(boxes()[2], '-10');

      expect(component.newHotspot.width).toBe(before);
      expect(boxes()[2].value).toBe(String(before));
    });
  });
});

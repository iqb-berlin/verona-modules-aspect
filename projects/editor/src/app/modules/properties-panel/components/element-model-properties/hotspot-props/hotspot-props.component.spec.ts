import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Hotspot } from 'common/models/elements/input-group-elements/hotspot-image';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  HotspotPropsComponent
} from './hotspot-props.component';

describe('HotspotPropsComponent', () => {
  let component: HotspotPropsComponent;
  let fixture: ComponentFixture<HotspotPropsComponent>;
  let dialogService: SpyObj<DialogService>;
  let emitted: { property: string; value: Hotspot[] }[];

  const createHotspot = (shape: 'rectangle' | 'ellipse', left: number): Hotspot => ({
    top: 0,
    left,
    width: 20,
    height: 20,
    shape,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#000000',
    rotation: 0,
    value: false,
    readOnly: false
  } as Hotspot);

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showHotspotEditDialog']);

    await TestBed.configureTestingModule({
      declarations: [HotspotPropsComponent],
      imports: [
        CommonModule,
        DragDropModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HotspotPropsComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'hotspot-image',
      value: [createHotspot('rectangle', 0), createHotspot('ellipse', 30)]
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a row for every hotspot', () => {
    const rows = fixture.nativeElement.querySelectorAll('.option-draggable');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('hotspot.rectangle');
    expect(rows[1].textContent).toContain('hotspot.ellipse');
  });

  it('should append a default hotspot', () => {
    component.addHotspot();

    expect(emitted.length).toBe(1);
    expect(emitted[0].property).toBe('value');
    expect(emitted[0].value.length).toBe(3);
    expect(emitted[0].value[2]).toMatchObject({ shape: 'rectangle', top: 10, left: 10 });
  });

  it('should remove a hotspot', () => {
    component.removeHotspot(0);

    expect(emitted.length).toBe(1);
    expect(emitted[0].value.map(hotspot => hotspot.shape)).toEqual(['ellipse']);
  });

  it('should reorder the hotspots', () => {
    component.moveHotspot({ previousIndex: 0, currentIndex: 1 });

    expect(emitted[0].value.map(hotspot => hotspot.shape)).toEqual(['ellipse', 'rectangle']);
  });

  it('should replace a hotspot with the dialog result', async () => {
    const editedHotspot = createHotspot('ellipse', 99);
    dialogService.showHotspotEditDialog.mockReturnValue(of(editedHotspot));

    await component.editHotspot(0);

    expect(dialogService.showHotspotEditDialog).toHaveBeenCalledWith(
      expect.objectContaining({ shape: 'rectangle' })
    );
    expect(emitted[0].value[0]).toBe(editedHotspot);
  });
});

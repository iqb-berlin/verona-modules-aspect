import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Label } from 'common/models/label-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import {
  OptionListPanelComponent
} from 'editor/modules/editor-shared/components/option-list-panel/option-list-panel.component';

describe('OptionListPanelComponent', () => {
  let component: OptionListPanelComponent;
  let fixture: ComponentFixture<OptionListPanelComponent>;
  let dialogService: SpyObj<DialogService>;

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showLabelEditDialog']);

    await TestBed.configureTestingModule({
      declarations: [OptionListPanelComponent, SafeResourceHTMLPipe],
      imports: [
        CommonModule,
        DragDropModule,
        TextFieldModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OptionListPanelComponent);
    component = fixture.componentInstance;
    component.textFieldLabel = 'Neue Option';
    component.itemList = [{ text: 'first' }, { text: 'second' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the given items', () => {
    const items = fixture.nativeElement.querySelectorAll('.option-draggable');
    expect(items.length).toBe(2);
  });

  it('should only emit textItemAdded when not in local mode', () => {
    const emitted: string[] = [];
    component.textItemAdded.subscribe(text => emitted.push(text));

    component.addListItem('third');

    expect(emitted).toEqual(['third']);
    expect(component.itemList.length).toBe(2);
  });

  it('should push to the item list and emit itemListUpdated in local mode', () => {
    component.localMode = true;
    let updated = false;
    component.itemListUpdated.subscribe(() => { updated = true; });

    component.addListItem('third');

    expect(component.itemList).toEqual([{ text: 'first' }, { text: 'second' }, { text: 'third' }]);
    expect(updated).toBe(true);
  });

  it('should remove items locally in local mode', () => {
    component.localMode = true;

    component.removeListItem(0);

    expect(component.itemList).toEqual([{ text: 'second' }]);
  });

  it('should edit an item via the label edit dialog in local mode', () => {
    component.localMode = true;
    dialogService.showLabelEditDialog.mockReturnValue(of({ text: 'edited' }));

    component.editItem(1);

    expect(dialogService.showLabelEditDialog).toHaveBeenCalledWith({ text: 'second' });
    expect(component.itemList[1]).toEqual({ text: 'edited' });
  });

  it('should emit itemReordered when not in local mode', () => {
    const emitted: { previousIndex: number, currentIndex: number }[] = [];
    component.itemReordered.subscribe(indices => emitted.push(indices));

    component.moveListValue({ previousIndex: 0, currentIndex: 1 } as CdkDragDrop<Label[]>);

    expect(emitted).toEqual([{ previousIndex: 0, currentIndex: 1 }]);
    expect(component.itemList[0]).toEqual({ text: 'first' });
  });
});

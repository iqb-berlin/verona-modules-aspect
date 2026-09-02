import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  IsCompressibleImagePipe
} from 'editor/modules/editor-shared/pipes/is-compressible-image.pipe';
import {
  CheckboxPropertiesComponent
} from './checkbox-properties.component';

// Declared instead of importing PropertiesPanelModule: a module import alongside declarations
// trips the AOT scope check in these specs (NG0304).
@Component({
  selector: 'aspect-merged-checkbox',
  standalone: false,
  template: '<ng-content></ng-content>'
})
class MockMergedCheckboxComponent {
  @Input() value: boolean | null | undefined;
  @Input() disabled: boolean = false;
}

describe('CheckboxPropertiesComponent', () => {
  let component: CheckboxPropertiesComponent;
  let fixture: ComponentFixture<CheckboxPropertiesComponent>;
  let dialogService: SpyObj<DialogService>;
  const unitServiceMock = { expertMode: true } as unknown as UnitService;

  const imageButton = () => fixture.debugElement.query(By.css('.media-src-button'));
  const toggleGroup = () => fixture.debugElement.query(By.css('mat-button-toggle-group'));
  const crossOutBox = () => fixture.debugElement.query(By.directive(MockMergedCheckboxComponent));

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['importImage', 'compressEmbeddedImage']);

    await TestBed.configureTestingModule({
      declarations: [CheckboxPropertiesComponent,
        IsCompressibleImagePipe, MockMergedCheckboxComponent],
      imports: [
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxPropertiesComponent);
    component = fixture.componentInstance;
    unitServiceMock.expertMode = true;
    component.combinedProperties = {
      type: 'checkbox', imgSrc: null, value: false, crossOutChecked: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all three controls for a checkbox in expert mode', () => {
    expect(imageButton()).not.toBeNull();
    expect(toggleGroup()).not.toBeNull();
    expect(crossOutBox()).not.toBeNull();
  });

  // Goes through DialogService.importImage rather than driving the resize dialog itself: that helper
  // is what the five other image buttons use, and it reports a cancelled dialog as null.
  it('should emit the imported image', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.importImage.mockResolvedValue({ name: 'bild.png', content: 'data:image/png;base64,abc' });

    await component.changeImgSrc();

    expect(emitted).toEqual([{ property: 'imgSrc', value: 'data:image/png;base64,abc' }]);
  });

  it('should emit nothing when the image dialog is cancelled', async () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.importImage.mockResolvedValue(null);

    await component.changeImgSrc();

    expect(emitted).toEqual([]);
  });

  it('should emit the chosen preset value', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    toggleGroup().triggerEventHandler('change', { value: true });

    expect(emitted).toEqual([{ property: 'value', value: true }]);
  });

  it('should emit the toggled crossOutChecked', () => {
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));

    crossOutBox().triggerEventHandler('valueChange', true);

    expect(emitted).toEqual([{ property: 'crossOutChecked', value: true }]);
  });

  it('should hide crossOutChecked outside expert mode, keeping the other two', () => {
    unitServiceMock.expertMode = false;
    fixture.detectChanges();

    expect(crossOutBox()).toBeNull();
    expect(imageButton()).not.toBeNull();
    expect(toggleGroup()).not.toBeNull();
  });

  /* Since #1137 whether this component appears at all is decided by PANEL_SECTIONS, not by the
     component - see panel-sections.spec.ts and the characterization net. What stays its own job is
     the field level: an element that has no imgSrc gets no image button, even though the section is
     offered. */
  it('should leave out a control the element does not have', () => {
    component.combinedProperties = { type: 'checkbox', value: false, crossOutChecked: false };
    fixture.detectChanges();

    expect(imageButton()).toBeNull();
    expect(toggleGroup()).not.toBeNull();
  });

  // A divergent multi selection merges to null; the checkbox renders that as indeterminate.
  it('should pass a divergent crossOutChecked through as null', () => {
    component.combinedProperties = {
      type: 'checkbox', imgSrc: null, value: false, crossOutChecked: null
    };
    fixture.detectChanges();

    expect(crossOutBox().componentInstance.value).toBeNull();
  });

  it('should keep the image button when an image is set', () => {
    component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/png;base64,abc' };
    fixture.detectChanges();

    expect(imageButton()).not.toBeNull();
  });

  /* The checkbox carries its own image, and it gets the same second way in as every other image in
     the editor: compress what is already there, without the file (#1378). */
  describe('the compress button', () => {
    const compressButton = () => fixture.debugElement.query(By.css('.compress-image-button'));

    // Without an image there is nothing to compress, so the button is not there either.
    it('should stay away while the checkbox has no image', () => {
      expect(compressButton()).toBeNull();
    });

    it('should be offered for an image that can be scaled', () => {
      component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/png;base64,abc' };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
      expect(compressButton().nativeElement.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('should stay but be disabled for an image no scaler can shrink', () => {
      component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/svg+xml;base64,abc' };
      fixture.detectChanges();

      expect(compressButton()).not.toBeNull();
      expect(compressButton().nativeElement.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('should emit the compressed image', async () => {
    component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/png;base64,gross' };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue('data:image/webp;base64,klein');

    await component.compressImgSrc();

    expect(dialogService.compressEmbeddedImage).toHaveBeenCalledWith('data:image/png;base64,gross');
    expect(emitted).toEqual([{ property: 'imgSrc', value: 'data:image/webp;base64,klein' }]);
  });

  it('should emit nothing when the compression is cancelled', async () => {
    component.combinedProperties = { type: 'checkbox', imgSrc: 'data:image/png;base64,gross' };
    const emitted: { property: string; value: unknown }[] = [];
    component.updateModel.subscribe(update => emitted.push(update));
    dialogService.compressEmbeddedImage.mockResolvedValue(null);

    await component.compressImgSrc();

    expect(emitted).toEqual([]);
  });
});

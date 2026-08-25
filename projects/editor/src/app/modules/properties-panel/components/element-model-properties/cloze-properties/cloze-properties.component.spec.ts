import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ClozeDocument } from 'common/models/elements/cloze';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { ElementService } from 'editor/src/app/services/element.service';
import { ClozePropertiesComponent } from './cloze-properties.component';

describe('ClozePropertiesComponent', () => {
  let component: ClozePropertiesComponent;
  let fixture: ComponentFixture<ClozePropertiesComponent>;
  let elementService: SpyObj<ElementService>;

  const button = (): HTMLButtonElement | null => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['showDefaultEditDialog']);

    await TestBed.configureTestingModule({
      declarations: [ClozePropertiesComponent],
      imports: [MatButtonModule, TranslateModule.forRoot()],
      providers: [{ provide: ElementService, useValue: elementService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozePropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { document: {} as ClozeDocument };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* The button used to sit in the panel's flex column, which is what made `align-self: center` work.
     Moving it here took that context away, and no test could have seen it: the characterization
     baseline records no CSS. The component's own SCSS restores it, and this pins it. */
  it('should lay the host out as a flex column, which is what centres the button', () => {
    const host = getComputedStyle(fixture.nativeElement as HTMLElement);

    expect(host.display).toBe('flex');
    expect(host.flexDirection).toBe('column');
  });

  it('should open the editor for the document', () => {
    button()?.click();

    expect(elementService.showDefaultEditDialog).toHaveBeenCalled();
  });

  /* The component is bound for every element type, so it has to guard itself - only the cloze has a
     document. */
  it('should render nothing for an element without a document', () => {
    component.combinedProperties = {};
    fixture.detectChanges();

    expect(button()).toBeNull();
  });

  /* A divergent multi selection deletes the key, so the button disappears rather than acting on one
     of the selected elements. */
  it('should render nothing when the selected elements disagree', () => {
    component.combinedProperties = { document: null };
    fixture.detectChanges();

    expect(button()).toBeNull();
  });
});

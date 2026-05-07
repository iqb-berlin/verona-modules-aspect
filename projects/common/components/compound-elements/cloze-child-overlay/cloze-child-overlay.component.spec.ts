import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';
import { ClozeChildOverlayComponent } from './cloze-child-overlay.component';

describe('ClozeChildOverlayComponent', () => {
  let component: ClozeChildOverlayComponent;
  let fixture: ComponentFixture<ClozeChildOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClozeChildOverlayComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClozeChildOverlayComponent);
    component = fixture.componentInstance;
    component.element = {
      type: 'toggle-button',
      dimensions: {
        width: 100, height: 20, isWidthFixed: true, isHeightFixed: true
      }
    } as ToggleButtonElement;
    component.parentForm = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected state', () => {
    component.setSelected(true);
    expect(component.isSelected).toBeTrue();
    component.setSelected(false);
    expect(component.isSelected).toBeFalse();
  });
});

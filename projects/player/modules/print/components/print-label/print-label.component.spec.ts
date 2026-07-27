import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { PrintLabelComponent } from './print-label.component';

describe('PrintLabelComponent', () => {
  let component: PrintLabelComponent;
  let fixture: ComponentFixture<PrintLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintLabelComponent],
      imports: [OverlayModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintLabelComponent);
    component = fixture.componentInstance;
    component.elementComponent = {
      elementRef: new ElementRef(document.createElement('div')),
      elementModel: new TextFieldElement({ type: 'text-field', id: 'text-field_1', alias: 'Eingabefeld 1' })
    } as unknown as ElementComponent;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the alias of the element in an overlay', () => {
    const label = document.querySelector('.print-label-overlay .element-label');

    expect(label?.textContent?.trim()).toBe('Eingabefeld 1');
  });

  it('should place the label above the start of the element', () => {
    expect(component.overlayPositions).toEqual([{
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: 15
    }]);
  });
});

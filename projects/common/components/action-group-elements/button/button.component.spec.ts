import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonElement, ButtonProperties } from 'common/models/elements/action-group-elements/button';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { SafeResourceUrlPipe } from 'common/pipes/safe-resource-url.pipe';
import { ButtonComponent } from './button.component';

@Directive({
  selector: '[pointerEventTooltip]',
  standalone: false
})
class MockPointerEventTooltipDirective {
  @Input() tooltipText!: string;
  @Input() tooltipPosition!: TooltipPosition;
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ButtonComponent,
        MockPointerEventTooltipDirective,
        SafeResourceUrlPipe
      ],
      imports: [
        MatButtonModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement({
      type: 'button',
      id: 'test-id',
      alias: 'test-alias',
      label: 'Test Button',
      imageSrc: null,
      asLink: false,
      action: null,
      actionParam: null,
      tooltipText: '',
      tooltipPosition: 'below',
      labelAlignment: 'baseline'
    } as Partial<ButtonProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a button with its label', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Test Button');
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('should emit buttonActionEvent on click when action and param are set', () => {
    component.elementModel.action = 'pageNav';
    component.elementModel.actionParam = 2;
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.buttonActionEvent, 'emit');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitSpy).toHaveBeenCalledWith({ action: 'pageNav', param: 2 });
  });

  it('should not emit buttonActionEvent on click when action is null', () => {
    const emitSpy = vi.spyOn(component.buttonActionEvent, 'emit');
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should render an anchor element when asLink is set', () => {
    component.elementModel.asLink = true;
    component.elementModel.action = 'unitNav';
    component.elementModel.actionParam = 'next';
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.getAttribute('href')).toBe('unitNav-next');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should render an image input when imageSrc is set', () => {
    component.elementModel.imageSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    fixture.detectChanges();
    const imageInput = fixture.nativeElement.querySelector('input[type="image"]') as HTMLInputElement;
    expect(imageInput).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});

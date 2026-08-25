import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TriggerElement, TriggerProperties } from 'common/models/elements/trigger';
import { TriggerComponent } from './trigger.component';

describe('TriggerComponent', () => {
  let component: TriggerComponent;
  let fixture: ComponentFixture<TriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TriggerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TriggerComponent);
    component = fixture.componentInstance;
    component.elementModel = new TriggerElement({
      type: 'trigger',
      id: 'test-id',
      alias: 'test-alias',
      action: 'highlightText',
      actionParam: 'yellow'
    } as Partial<TriggerProperties>);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit triggerActionEvent with action and param on emitEvent', () => {
    const emitSpy = vi.spyOn(component.triggerActionEvent, 'emit');
    component.emitEvent();
    expect(emitSpy).toHaveBeenCalledWith({ action: 'highlightText', param: 'yellow' });
  });

  it('should not emit when actionParam is missing', () => {
    component.elementModel.actionParam = null;
    const emitSpy = vi.spyOn(component.triggerActionEvent, 'emit');
    component.emitEvent();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit for removeHighlights even without actionParam', () => {
    component.elementModel.action = 'removeHighlights';
    component.elementModel.actionParam = null;
    const emitSpy = vi.spyOn(component.triggerActionEvent, 'emit');
    component.emitEvent();
    expect(emitSpy).toHaveBeenCalledWith({ action: 'removeHighlights', param: null });
  });

  it('should show the hidden trigger placeholder in editor mode', () => {
    expect(component.project).toBe('editor');
    expect(fixture.nativeElement.querySelector('.hidden-trigger')).not.toBeNull();
  });
});

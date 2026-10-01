import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { environment } from 'common/environment';
import { TetfolioElement } from 'common/models/elements/tetfolio';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { TetfolioGroupElementComponent } from './tetfolio-group-element.component';

describe('TetfolioGroupElementComponent', () => {
  let component: TetfolioGroupElementComponent;
  let fixture: ComponentFixture<TetfolioGroupElementComponent>;
  let unitStateService: UnitStateService;

  @Component({
    selector: 'aspect-tetfolio',
    template: '',
    standalone: false
  })
  class TetfolioStubComponent {
    @Input() elementModel!: TetfolioElement;
    @Input() savedState: string | null = null;
  }

  beforeEach(async () => {
    environment.strictInstantiation = false;
    await TestBed.configureTestingModule({
      declarations: [
        TetfolioStubComponent,
        TetfolioGroupElementComponent,
        CastPipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TetfolioGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new TetfolioElement({
      type: 'tetfolio', id: 'tetfolio_1', alias: 'tetfolio_1'
    });
    component.pageIndex = 0;
    unitStateService = TestBed.inject(UnitStateService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should hand the stored state to the iframe for restoring', () => {
    vi.spyOn(unitStateService, 'getElementCodeById')
      .mockReturnValue({
        id: 'tetfolio_1', alias: 'tetfolio_1', value: '{"key":"stored"}', status: 'VALUE_CHANGED'
      });
    fixture.detectChanges();
    expect(component.savedState).toBe('{"key":"stored"}');
  });

  it('should have no state to restore when nothing is stored', () => {
    vi.spyOn(unitStateService, 'getElementCodeById').mockReturnValue(undefined);
    fixture.detectChanges();
    expect(component.savedState).toBeNull();
  });

  it('should register the stored state as the initial value', () => {
    vi.spyOn(unitStateService, 'getElementCodeById')
      .mockReturnValue({
        id: 'tetfolio_1', alias: 'tetfolio_1', value: '{"key":"stored"}', status: 'VALUE_CHANGED'
      });
    const registerSpy = vi.spyOn(unitStateService, 'registerElementCode');
    fixture.detectChanges();
    expect(registerSpy.mock.calls[0].slice(0, 3)).toEqual(['tetfolio_1', 'tetfolio_1', '{"key":"stored"}']);
  });

  it('should report a changed value to the unit state', () => {
    fixture.detectChanges();
    const changeSpy = vi.spyOn(unitStateService, 'changeElementCodeValue');
    component.changeElementCodeValue({ id: 'tetfolio_1', value: '{"key":"new"}' });
    expect(changeSpy).toHaveBeenCalledWith({ id: 'tetfolio_1', value: '{"key":"new"}' });
  });
});

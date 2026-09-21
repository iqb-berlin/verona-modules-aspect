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

  it('should restore a stored state into the element model on init', () => {
    vi.spyOn(unitStateService, 'getElementCodeById')
      .mockReturnValue({
        id: 'tetfolio_1', alias: 'tetfolio_1', value: '{"key":"stored"}', status: 'VALUE_CHANGED'
      });
    fixture.detectChanges();
    expect(component.savedState).toBe('{"key":"stored"}');
    expect((component.elementModel as TetfolioElement).state).toBe('{"key":"stored"}');
  });

  it('should fall back to the model state when nothing is stored', () => {
    vi.spyOn(unitStateService, 'getElementCodeById').mockReturnValue(undefined);
    fixture.detectChanges();
    expect(component.savedState).toBeNull();
  });

  it('should write a changed value into the model and the unit state', () => {
    fixture.detectChanges();
    const changeSpy = vi.spyOn(unitStateService, 'changeElementCodeValue');
    component.changeElementCodeValue({ id: 'tetfolio_1', value: '{"key":"new"}' });
    expect((component.elementModel as TetfolioElement).state).toBe('{"key":"new"}');
    expect(changeSpy).toHaveBeenCalledWith({ id: 'tetfolio_1', value: '{"key":"new"}' });
  });
});

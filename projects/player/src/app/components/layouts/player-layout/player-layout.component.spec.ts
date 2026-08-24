// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { AlwaysVisiblePagePipe } from 'player/src/app/pipes/always-visible-page.pipe';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { Component, Directive, Input } from '@angular/core';
import { Page } from 'common/models/page';
import { APIService } from 'common/shared.module';
import { PagingMode } from 'player/modules/verona/models/verona';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { PlayerLayoutComponent } from './player-layout.component';

describe('PlayerLayoutComponent', () => {
  let component: PlayerLayoutComponent;
  let fixture: ComponentFixture<PlayerLayoutComponent>;
  let keypadService: KeypadService;
  let keyboardService: KeyboardService;

  @Directive({
    selector: '[aspectPlayerState]',
    standalone: false
  })
  class PlayerStateStubDirective {
    @Input() validPages!: Record<string, string>;
    @Input() currentPageIndex!: number;
  }
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  @Component({
    selector: 'aspect-pages-layout',
    template: '',
    standalone: false
  })
  class PagesLayoutStubComponent {
    @Input() pages!: Page[];
    @Input() scrollPageMode!: PagingMode;
    @Input() alwaysVisiblePage!: Page | null;
    @Input() scrollPages!: Page[];
    @Input() hasScrollPages!: boolean;
    @Input() alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right';
  }

  @Component({
    selector: 'aspect-math-keyboard-container',
    template: '',
    standalone: false
  })
  class MockMathKeyboardContainerComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PlayerLayoutComponent,
        PagesLayoutStubComponent,
        AlwaysVisiblePagePipe,
        ScrollPagesPipe,
        PlayerStateStubDirective,
        MockMathKeyboardContainerComponent
      ],
      imports: [
        BrowserAnimationsModule
      ],
      providers: [
        provideAnimations(),
        { provide: APIService, useClass: ApiStubService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerLayoutComponent);
    component = fixture.componentInstance;
    keypadService = TestBed.inject(KeypadService);
    keyboardService = TestBed.inject(KeyboardService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should animate a single keypad toggle', fakeAsync(() => {
    keypadService.willToggle.emit(true);

    expect(component.isKeypadAnimationDisabled).toBe(false);
    tick(200);
    expect(component.isKeypadAnimationDisabled).toBe(false);
  }));

  it('should skip the animation of a directly consecutive keypad toggle', fakeAsync(() => {
    keypadService.willToggle.emit(true);
    keypadService.willToggle.emit(false);

    expect(component.isKeypadAnimationDisabled).toBe(true);
    tick(200);
    expect(component.isKeypadAnimationDisabled).toBe(false);
  }));

  it('should animate keypad toggles again after the blocking time', fakeAsync(() => {
    keypadService.willToggle.emit(true);
    tick(200);

    keypadService.willToggle.emit(false);

    expect(component.isKeypadAnimationDisabled).toBe(false);
    tick(200);
  }));

  it('should skip the animation of a directly consecutive keyboard toggle', fakeAsync(() => {
    keyboardService.willToggle.emit(true);
    keyboardService.willToggle.emit(false);

    expect(component.isKeyboardAnimationDisabled).toBe(true);
    tick(200);
    expect(component.isKeyboardAnimationDisabled).toBe(false);
  }));

  it('should stop reacting on toggles after destruction', fakeAsync(() => {
    fixture.destroy();

    keypadService.willToggle.emit(true);
    keypadService.willToggle.emit(false);
    keyboardService.willToggle.emit(true);
    keyboardService.willToggle.emit(false);

    expect(component.isKeypadAnimationDisabled).toBe(false);
    expect(component.isKeyboardAnimationDisabled).toBe(false);
  }));
});

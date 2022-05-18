import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutPlayerComponent } from './layout-player.component';
import { AlwaysVisiblePagePipe } from 'player/src/app/pipes/always-visible-page.pipe';
import { ScrollPagesPipe } from 'player/src/app/pipes/scroll-pages.pipe';
import { ValidPagesPipe } from 'player/src/app/pipes/valid-pages.pipe';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { Component, Directive, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Page } from 'common/models/page';

describe('LayoutPlayerComponent', () => {
  let component: LayoutPlayerComponent;
  let fixture: ComponentFixture<LayoutPlayerComponent>;

  @Directive({ selector: '[aspectPlayerState]' })
  class PlayerStateStubDirective {
    @Input() validPages!: Record<string, string>;
    @Input() currentPlayerPageIndex!: number;
    @Input() isPlayerRunning!: BehaviorSubject<boolean>;
  }

  @Component({ selector: 'aspect-layout-pages', template: '' })
  class LayoutPagesStubComponent {
    @Input() pages!: Page[];
    @Input() scrollPageMode!: 'separate' | 'concat-scroll' | 'concat-scroll-snap';
    @Input() alwaysVisiblePage!: Page | null;
    @Input() scrollPages!: Page[];
    @Input() hasScrollPages!: boolean;
    @Input() alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LayoutPlayerComponent,
        LayoutPagesStubComponent,
        AlwaysVisiblePagePipe,
        ValidPagesPipe,
        ScrollPagesPipe,
        PlayerStateStubDirective],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: PlayerTranslateLoader
          }
        })
      ],
      providers: [TranslateService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

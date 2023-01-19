import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlwaysVisiblePagePipe } from 'player/src/app/pipes/always-visible-page.pipe';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';
import { ValidPagesPipe } from 'player/src/app/pipes/valid-pages.pipe';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { Component, Directive, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Page } from 'common/models/page';
import { APIService } from 'common/shared.module';
import { PlayerLayoutComponent } from './player-layout.component';

describe('PlayerLayoutComponent', () => {
  let component: PlayerLayoutComponent;
  let fixture: ComponentFixture<PlayerLayoutComponent>;
  @Directive({ selector: '[aspectPlayerState]' })
  class PlayerStateStubDirective {
    @Input() validPages!: Record<string, string>;
    @Input() currentPageIndex!: number;
    @Input() isPlayerRunning!: BehaviorSubject<boolean>;
  }
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  @Component({ selector: 'aspect-pages-layout', template: '' })
  class PagesLayoutStubComponent {
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
        PlayerLayoutComponent,
        PagesLayoutStubComponent,
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
      providers: [TranslateService, { provide: APIService, useClass: ApiStubService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

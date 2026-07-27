// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { Input, Component } from '@angular/core';
import { Subject } from 'rxjs';
import { APIService } from 'common/shared.module';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VopMetaData } from 'player/modules/verona/models/verona';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { MetaDataService } from 'player/src/app/services/meta-data.service';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let translateService: TranslateService;
  let playerMetadata: VopMetaData;
  let focus: Subject<boolean>;

  @Component({
    selector: 'aspect-unit',
    template: '',
    standalone: false
  })
  class UnitMenuStubComponent {
    @Input() isStandalone!: boolean;
  }

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(async () => {
    focus = new Subject<boolean>();
    playerMetadata = { id: 'aspect-player', version: '1.0.0' } as VopMetaData;
    veronaPostService = createSpyObj<VeronaPostService>([
      'sendReadyNotification', 'sendVopWindowFocusChangedNotification'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        UnitMenuStubComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: PlayerTranslateLoader
          }
        })
      ],
      providers: [
        TranslateService,
        { provide: APIService, useClass: ApiStubService },
        { provide: VeronaPostService, useValue: veronaPostService },
        { provide: NativeEventService, useValue: { focus: focus.asObservable() } },
        { provide: MetaDataService, useValue: { playerMetadata } }
      ]
    })
      .compileComponents();

    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run standalone outside an iframe', () => {
    expect(component.isStandalone).toBe(window === window.parent);
  });

  it('should set up the German locale', () => {
    expect(translateService.getLangs()).toContain('de');
    expect(translateService.getDefaultLang()).toBe('de');
  });

  it('should report that it is ready together with its metadata', () => {
    expect(veronaPostService.sendReadyNotification).toHaveBeenCalledWith(playerMetadata);
  });

  it('should report a changed window focus to the host', () => {
    focus.next(true);
    focus.next(false);

    expect(veronaPostService.sendVopWindowFocusChangedNotification).toHaveBeenNthCalledWith(1, true);
    expect(veronaPostService.sendVopWindowFocusChangedNotification).toHaveBeenNthCalledWith(2, false);
  });

  it('should show the unit', () => {
    expect(fixture.nativeElement.querySelector('aspect-unit')).toBeTruthy();
  });
});

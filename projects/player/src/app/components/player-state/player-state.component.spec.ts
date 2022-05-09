import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerStateComponent } from './player-state.component';
import { AlwaysVisiblePagePipe } from 'player/src/app/pipes/always-visible-page.pipe';
import { ScrollPagesPipe } from 'player/src/app/pipes/scroll-pages.pipe';

describe('PlayerStateComponent', () => {
  let component: PlayerStateComponent;
  let fixture: ComponentFixture<PlayerStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PlayerStateComponent,
        AlwaysVisiblePagePipe,
        ScrollPagesPipe ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerStateComponent);
    component = fixture.componentInstance;
    component.pages = [];
    component.playerConfig = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

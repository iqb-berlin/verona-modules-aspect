import { ApplicationRef, EventEmitter, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { TextComponent } from 'common/components/text-group-elements/text/text.component';
import { MarkingRange } from 'common/models/marking-data';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { NativeEventService } from 'player/src/app/services/native-event.service';
import {
  MarkableDelimiterComponent
} from 'player/src/app/components/markable-delimiter/markable-delimiter.component';
import {
  MarkableWordComponent
} from 'player/src/app/components/markable-word/markable-word.component';
import {
  MarkablesContainerComponent
} from 'player/src/app/components/markables-container/markables-container.component';
import { MarkableSupport } from './markable-support';

describe('MarkableSupport', () => {
  let support: MarkableSupport;
  let applicationRef: ApplicationRef;
  let textContainer: HTMLElement;
  let elementComponent: TextComponent;
  let viewCountBefore: number;
  let mouseUp: Subject<MouseEvent>;

  const words = (): Element[] => Array.from(textContainer.querySelectorAll('aspect-markable-word'));

  beforeEach(async () => {
    mouseUp = new Subject<MouseEvent>();

    await TestBed.configureTestingModule({
      declarations: [MarkablesContainerComponent, MarkableWordComponent, MarkableDelimiterComponent],
      providers: [{ provide: NativeEventService, useValue: { mouseUp: mouseUp.asObservable() } }]
    })
      .compileComponents();

    applicationRef = TestBed.inject(ApplicationRef);

    textContainer = document.createElement('div');
    textContainer.textContent = 'Lorem ipsum dolor';
    document.body.appendChild(textContainer);

    elementComponent = {
      textContainerRef: { nativeElement: textContainer },
      selectedColor: new BehaviorSubject<string | undefined>('yellow'),
      markingRange: new BehaviorSubject<MarkingRange | null>(null),
      elementValueChanged: new EventEmitter(),
      elementModel: { id: 'text_1', markingPanels: [] }
    } as unknown as TextComponent;

    support = new MarkableSupport(
      TestBed.inject(RendererFactory2).createRenderer(null, null),
      applicationRef,
      TestBed.inject(MarkingPanelService)
    );
    viewCountBefore = applicationRef.viewCount;
  });

  afterEach(() => {
    textContainer.remove();
  });

  it('should show a markable word per word of the text', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    expect(words().length).toBe(3);
  });

  it('should attach a view for the created markables', () => {
    support.createMarkables([], elementComponent);

    expect(applicationRef.viewCount).toBe(viewCountBefore + 1);
  });

  it('should detach the created views on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    support.destroy();

    expect(applicationRef.viewCount).toBe(viewCountBefore);
  });

  it('should destroy the markable words on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();

    support.destroy();

    expect(words().length).toBe(0);
  });

  /*
   * Destroying the words is what lets them clean up after themselves. Before the containers were
   * destroyed here, MarkableWordComponent.ngOnDestroy never ran outside of tests, so a range
   * selection waiting for the mouse to be released outlived its text.
   */
  it('should end a pending range selection of its words on destruction', () => {
    support.createMarkables([], elementComponent);
    applicationRef.tick();
    (words()[0].querySelector('span') as HTMLElement).click();
    expect(mouseUp.observed).toBeTruthy();

    support.destroy();

    expect(mouseUp.observed).toBeFalsy();
  });
});

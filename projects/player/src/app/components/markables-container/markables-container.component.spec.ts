import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { MarkingRange } from 'common/models/marking-data';
import {
  MarkableDelimiterComponent
} from 'player/src/app/components/markable-delimiter/markable-delimiter.component';
import {
  MarkableWordComponent
} from 'player/src/app/components/markable-word/markable-word.component';
import { Markable } from 'player/src/app/models/markable.interface';
import { MarkablesContainerComponent } from './markables-container.component';

describe('MarkablesContainerComponent', () => {
  let component: MarkablesContainerComponent;
  let fixture: ComponentFixture<MarkablesContainerComponent>;

  const createMarkable = (id: number, word: string, properties: Partial<Markable> = {}): Markable => ({
    id, prefix: '', word, suffix: '', isActive: true, color: null, contentNode: null, ...properties
  });

  const delimiters = (): MarkableDelimiterComponent[] => fixture.debugElement
    .queryAll(By.directive(MarkableDelimiterComponent))
    .map(debugElement => debugElement.componentInstance as MarkableDelimiterComponent);

  const words = (): MarkableWordComponent[] => fixture.debugElement
    .queryAll(By.directive(MarkableWordComponent))
    .map(debugElement => debugElement.componentInstance as MarkableWordComponent);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkablesContainerComponent, MarkableWordComponent, MarkableDelimiterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarkablesContainerComponent);
    component = fixture.componentInstance;
    component.selectedColor = new BehaviorSubject<string | undefined>('yellow');
    component.markingRange = new BehaviorSubject<MarkingRange | null>(null);
    component.markables = [];
    component.allMarkables = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a word per markable', () => {
    component.markables = [createMarkable(0, 'Lorem'), createMarkable(1, 'ipsum')];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(words().map(word => word.text)).toEqual(['Lorem', 'ipsum']);
  });

  it('should hand the content node of a markable over to its word', () => {
    const formula = document.createElement('aspect-nodeview-math-formula');
    component.markables = [createMarkable(0, '', { contentNode: formula })];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(words().length).toBe(1);
    expect(words()[0].contentNode).toBe(formula);
  });

  it('should show nothing for a markable with neither word nor content node', () => {
    component.markables = [createMarkable(0, '')];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(words().length).toBe(0);
  });

  it('should show prefix and suffix as delimiters', () => {
    component.markables = [createMarkable(0, 'Lorem', { prefix: '(', suffix: ') ' })];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(delimiters().map(delimiter => delimiter.text)).toEqual(['(', ') ']);
  });

  it('should hand the marking colour over to the words', () => {
    component.markables = [createMarkable(0, 'Lorem', { color: 'blue' })];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(words()[0].markColor).toBe('yellow');
    expect(words()[0].color).toBe('blue');
  });

  it('should tell a delimiter about the marking of its neighbour', () => {
    component.markables = [
      createMarkable(0, 'Lorem', { suffix: ' ' }),
      createMarkable(1, 'ipsum', { prefix: '', color: 'blue' })
    ];
    component.allMarkables = component.markables;

    fixture.detectChanges();

    expect(delimiters()[0].neighbourColor).toBe('blue');
  });

  it('should report a changed marking colour', () => {
    let changeCount = 0;
    component.markablesChange = new EventEmitter<void>();
    component.markablesChange.subscribe(() => { changeCount += 1; });

    component.onColorChange();

    expect(changeCount).toBe(1);
  });
});

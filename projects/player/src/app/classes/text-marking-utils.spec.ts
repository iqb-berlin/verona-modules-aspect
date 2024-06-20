import { TestBed } from '@angular/core/testing';
import { TextMarkingUtils } from './text-marking-utils';

describe('TextMarkingUtils', () => {
  let utils: TextMarkingUtils;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    utils = TestBed.inject(TextMarkingUtils);
  });

  it('should be created', () => {
    expect(utils).toBeTruthy();
  });

  it('should get an array with selections ', () => {
    const text =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    const expectedArray = ['6-11-#f9f871'];
    expect(TextMarkingUtils.getMarkedTextIndices(text)).toEqual(expectedArray);
  });

  it('should mark a text with given selections ', () => {
    const text = 'Lorem ipsum dolor sit amet';
    const expectedText =
      'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor sit amet';
    const markings = ['6-11-#f9f871'];
    expect(TextMarkingUtils.restoreMarkedTextIndices(markings, text)).toEqual(expectedText);
  });
});

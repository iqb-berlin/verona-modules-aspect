import { ElementFactory } from 'common/utils/element-factory';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { CheckboxElement } from 'common/models/elements/input-group-elements/checkbox';
import { UIElementProperties } from 'common/models/ui-element-interfaces';
import { IsInputElementPipe } from 'editor/src/app/pipes/is-input-element.pipe';

describe('IsInputElementPipe', () => {
  const pipe = new IsInputElementPipe();

  it('should recognize a drop list as input element', () => {
    const dropList = new DropListElement({ id: 'dl', alias: 'dl' });
    expect(pipe.transform(dropList)).toBe(true);
  });

  it('should recognize a checkbox as input element', () => {
    const checkbox = new CheckboxElement({ type: 'checkbox', id: 'cb', alias: 'cb' });
    expect(pipe.transform(checkbox)).toBe(true);
  });

  it('should not treat a text element as input element', () => {
    const text = ElementFactory.createElement({ type: 'text' } as unknown as UIElementProperties);
    expect(pipe.transform(text)).toBe(false);
  });

  it('should not treat a frame element as input element', () => {
    const frame = ElementFactory.createElement({ type: 'frame' } as unknown as UIElementProperties);
    expect(pipe.transform(frame)).toBe(false);
  });
});

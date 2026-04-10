import { UIElementType } from 'common/interfaces';
import { TextComponent } from 'common/components/text/text.component';
import { ButtonComponent } from 'common/components/button/button.component';
import { ComponentRegistry } from './component-registry';

describe('ComponentRegistry', () => {
  it('should return the correct component for a given type', () => {
    expect(ComponentRegistry.getComponent('text')).toBe(TextComponent);
    expect(ComponentRegistry.getComponent('button')).toBe(ButtonComponent);
  });

  it('should throw an error if the component type is not found', () => {
    expect(() => ComponentRegistry.getComponent('non-existent' as UIElementType))
      .toThrowError('Component for type non-existent not found in ComponentRegistry');
  });
});

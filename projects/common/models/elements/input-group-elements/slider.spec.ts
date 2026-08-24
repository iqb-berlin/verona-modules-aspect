import { SliderElement, SliderProperties } from 'common/models/elements/input-group-elements/slider';

/* Two properties of this element were declared boolean while their defaults were the strings
   'default' and 'always' (#1139). Both are truthy and the player only ever tests truthiness, so
   nothing looked broken - but every new slider showed the arrow bar and the thumb label, and the
   string travelled into stored unit definitions. These pin the types, which the `as boolean` casts in
   the class cannot: ELEMENT_DEFAULTS is a Record<string, unknown>, so the compiler accepts whatever
   it is told there. */
describe('SliderElement', () => {
  /* Enough to pass `isSliderProperties`, which gates whether the given values are read at all - and
     an id, because the constructor refuses an element with neither id nor IDService. */
  const sliderProperties = (properties: Partial<SliderProperties> = {}): Partial<SliderProperties> => ({
    type: 'slider',
    id: 'slider_1',
    alias: 'slider_1',
    minValue: 0,
    maxValue: 100,
    ...properties
  });

  it('should default the display switches to false booleans', () => {
    const slider = new SliderElement(sliderProperties());

    expect(slider.barStyle).toBe(false);
    expect(slider.thumbLabel).toBe(false);
  });

  it('should keep the other defaults it always had', () => {
    const slider = new SliderElement(sliderProperties());

    expect(slider.minValue).toBe(0);
    expect(slider.maxValue).toBe(100);
    expect(slider.showValues).toBe(true);
  });

  /* The constructor takes any defined value, so a unit holding the old string would carry it into the
     model - repairing that is the normalizer's job (see its spec). What matters here is that a
     property somebody did set arrives unchanged. */
  it('should take the values it is given', () => {
    const slider = new SliderElement(sliderProperties({
      minValue: 5, maxValue: 50, barStyle: true, thumbLabel: true
    }));

    expect(slider.barStyle).toBe(true);
    expect(slider.thumbLabel).toBe(true);
    expect(slider.minValue).toBe(5);
    expect(slider.maxValue).toBe(50);
  });
});

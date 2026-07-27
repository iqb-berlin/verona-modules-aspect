import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { Storable } from './storable';

describe('Storable', () => {
  let storable: Storable;
  let valueChanges: ValueChangeElement[];

  beforeEach(() => {
    storable = new Storable('section-0-1', 0);
    valueChanges = [];
    storable.valueChanged.subscribe(change => valueChanges.push(change));
  });

  it('should create an instance', () => {
    expect(storable).toBeTruthy();
    expect(storable.id).toBe('section-0-1');
    expect(storable.value).toBe(0);
  });

  it('should announce a new value', () => {
    storable.value = 1;

    expect(storable.value).toBe(1);
    expect(valueChanges).toEqual([{ id: 'section-0-1', value: 1 }]);
  });

  it('should stay silent when the value does not change', () => {
    storable.value = 0;

    expect(valueChanges).toEqual([]);
  });
});

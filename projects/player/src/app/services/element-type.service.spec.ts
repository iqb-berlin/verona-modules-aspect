import { Unit } from 'common/models/unit';
import { ElementTypeService } from './element-type.service';

describe('ElementTypeService', () => {
  const unit = (elements: { id: string, type: string }[], stateVariableIds: string[] = []): Unit => ({
    getAllElements: () => elements,
    stateVariables: stateVariableIds.map(id => ({ id }))
  }) as unknown as Unit;

  it('should know the elements of the unit by their type and its state variables as such', () => {
    const service = new ElementTypeService();
    service.setUnit(unit([{ id: 'area', type: 'text-area-math' }], ['counter']));

    expect(service.getType('area')).toBe('text-area-math');
    expect(service.getType('counter')).toBe('state-variable');
    expect(service.getType('unknown')).toBeUndefined();
  });

  it('should forget the elements of the unit before', () => {
    const service = new ElementTypeService();
    service.setUnit(unit([{ id: 'area', type: 'text-area-math' }]));
    service.setUnit(unit([{ id: 'field', type: 'text-field' }]));

    expect(service.getType('area')).toBeUndefined();
  });
});

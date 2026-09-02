import { UIElementProperties } from 'common/models/ui-element-interfaces';

/** Custom Error to show the element blueprint that failed validation. */
export class InstantiationEror extends Error {
  faultyBlueprint: Partial<UIElementProperties> | undefined;

  constructor(message: string, faultyBlueprint?: Partial<UIElementProperties>) {
    super(message);
    this.faultyBlueprint = faultyBlueprint;
  }
}

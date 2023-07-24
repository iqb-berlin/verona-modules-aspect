import { UIElementProperties } from 'common/models/elements/element';

/* Custom Error to show the element blueprint that failed validation. */
export class InstantiationEror extends Error {
  faultyBlueprint: UIElementProperties | undefined;

  constructor(message: string, faultyBlueprint?: UIElementProperties) {
    super(message);
    this.faultyBlueprint = faultyBlueprint;
  }
}

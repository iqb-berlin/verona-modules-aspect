// eslint-disable-next-line max-classes-per-file
import { UIElementProperties } from 'common/interfaces';

export class IDError extends Error {
  highSeverity: boolean = false;

  constructor(message: string, public code?: number, highSeverity: boolean = false) {
    super(message);
    this.name = 'IDError';
    this.highSeverity = highSeverity;
  }
}

/* Custom Error to show the element blueprint that failed validation. */
export class InstantiationEror extends Error {
  faultyBlueprint: Partial<UIElementProperties> | undefined;

  constructor(message: string, faultyBlueprint?: Partial<UIElementProperties>) {
    super(message);
    this.faultyBlueprint = faultyBlueprint;
  }
}

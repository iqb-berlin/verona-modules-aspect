/**
 * Providers file for the '@angular/build:unit-test' builder.
 *
 * Replaces the setup previously done in the Karma entry file (test.ts):
 * registering all element components before the test environment is used.
 */
import { EnvironmentProviders, Provider } from '@angular/core';
import { registerComponents } from 'common/utils/component-registration';

registerComponents();

const providers: (Provider | EnvironmentProviders)[] = [];

export default providers;

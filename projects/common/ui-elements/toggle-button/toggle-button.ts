import {
  UIElement,
  InputElement,
  FontElement,
  SurfaceElement,
  FontProperties, SurfaceProperties
} from '../../models/uI-element';
import { initFontElement, initSurfaceElement } from '../../util/unit-interface-initializer';
import { ImportModuleVersion } from '../../classes/importModuleVersion';

export class ToggleButtonElement extends InputElement implements FontElement, SurfaceElement {
  options: string[] = ['A', 'B'];
  strikeOtherOptions: boolean = false;
  selectionColor: string = 'lightgreen';
  verticalOrientation = false;
  dynamicWidth: boolean = true;

  fontProps: FontProperties;
  surfaceProps: SurfaceProperties;

  constructor(serializedElement: Partial<UIElement>) {
    super(serializedElement);
    Object.assign(this, serializedElement);
    this.fontProps = initFontElement(serializedElement);
    this.surfaceProps = initSurfaceElement(serializedElement);

    delete this.label;

    this.height = serializedElement.height as number || 25;
    this.surfaceProps.backgroundColor =
      serializedElement.surfaceProps?.backgroundColor as string ||
      'transparent';
    this.handleBackwardsCompatibility(serializedElement);
  }

  handleBackwardsCompatibility(serializedElement: Partial<UIElement>): void {
    if ((serializedElement.value || serializedElement.value === 0) &&
      !ImportModuleVersion.isUnitLoaded() && !ImportModuleVersion.verifyVersion()) {
      this.value = Number(this.value) + 1;
    }
  }
}

import { ELEMENT_DEFAULTS } from 'common/models/elements/element-registry';
import { InputElement } from 'common/models/elements/element';
import { VariableInfo } from '@iqb/responses';
import {
  DimensionProperties, PositionProperties, PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { environment } from 'common/environment';
import { AbstractIDService } from 'common/models/id-interfaces';
import { InputElementProperties } from 'common/models/input-element-interfaces';
import { UIElementType, MediaSourceProperties } from 'common/models/ui-element-interfaces';
import { InstantiationEror } from 'common/classes/instantiation-error';

export interface Hotspot {
  top: number;
  left: number;
  width: number;
  height: number;
  shape: 'ellipse' | 'rectangle' | 'triangle';
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  rotation: number;
  value: boolean;
  readOnly: boolean;
}

export class HotspotImageElement extends InputElement implements HotspotImageProperties {
  type: UIElementType = 'hotspot-image';
  value: Hotspot[] = ELEMENT_DEFAULTS['hotspot-image'].value;
  src: string | null = ELEMENT_DEFAULTS['hotspot-image'].src;
  fileName: string = ELEMENT_DEFAULTS['hotspot-image'].fileName;
  position: PositionProperties = PropertyGroupGenerators
    .generatePositionProps();

  dimensions: DimensionProperties = PropertyGroupGenerators
    .generateDimensionProps(ELEMENT_DEFAULTS['hotspot-image'].dimensions);

  /** No styling at all: not one of this element's templates reads a styling value, and the group it
     used to get came from the base class rather than from any declaration (#1226). Declared here so
     the merge in the constructor keeps nothing and the inspector offers nothing.

     Deleting this field compiles: the inherited `styling: Stylings` is assignable to the interface's
     optional empty group, because every object is. What holds the emptiness is the spec in
     element.spec.ts, not the type. */
  styling: Record<never, never> = {};

  static title: string = 'Bildbereiche';
  static icon: string = 'ads_click';

  constructor(element?: Partial<HotspotImageProperties>, idService?: AbstractIDService) {
    super({ type: 'hotspot-image', ...element }, idService);
    if (isHotspotImageProperties(element)) {
      if (element.value !== undefined) this.value = element.value;
      if (element.src !== undefined) this.src = element.src;
      if (element.fileName !== undefined) this.fileName = element.fileName;
      this.position = { ...this.position, ...element.position };
      this.dimensions = { ...this.dimensions, ...element.dimensions };
    } else if (environment.strictInstantiation) {
      throw new InstantiationEror('Error at HotspotImage instantiation', element);
    }
    /* The base class hands a label to every input element; this one never renders it, and the
       inspector offers a field for whatever the element HAS. Deleted rather than set to undefined:
       a field assignment leaves an own enumerable key, and the panel's merge reports an own key with
       a diverging value as `null`, which brings the box back for a mixed selection (#1233). Same
       pattern as TextFieldSimple, ToggleButton and DropList. A stored unit may well carry a label
       for this element -- that is the key being deleted here, which is why HotspotImageProperties
       still types one. */
    delete (this as Partial<InputElement>).label;
  }

  getVariableInfos(): VariableInfo[] {
    return [{
      id: this.id,
      alias: this.alias,
      type: 'boolean',
      format: '',
      multiple: true,
      nullable: false,
      values: [],
      valuePositionLabels: this.getAnswerSchemePositionLabels(),
      page: '',
      valuesComplete: true
    }];
  }

  private getAnswerSchemePositionLabels(): string[] {
    return this.value
      // eslint-disable-next-line max-len
      .map((hotspot, index) => `${hotspot.shape}(${index})`
        .charAt(0).toUpperCase() + `${hotspot.shape}(${index})`.slice(1));
  }
}

export interface HotspotImageProperties extends InputElementProperties, MediaSourceProperties {
  /** No styling: see the class field (#1226). */
  styling?: Record<never, never>;
  value: Hotspot[];
  position: PositionProperties;
  dimensions: DimensionProperties;
}

function isHotspotImageProperties(blueprint?: Partial<HotspotImageProperties>): blueprint is HotspotImageProperties {
  if (!blueprint) return false;
  return blueprint.value !== undefined &&
    blueprint.type === 'hotspot-image';
}

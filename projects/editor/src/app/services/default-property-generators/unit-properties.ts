import { PageProperties } from 'common/models/page';
import { SectionProperties } from 'common/models/section';
import { UnitProperties } from 'common/models/unit';
import packageJSON from '../../../../../../package.json';

export class UnitPropertyGenerator {
  static generateUnitProps(): UnitProperties {
    return {
      type: 'aspect-unit-definition',
      version: packageJSON.config.unit_definition_version,
      pages: []
    };
  }

  static generatePageProps(): PageProperties {
    return {
      sections: [],
      hasMaxWidth: true,
      maxWidth: 750,
      margin: 30,
      backgroundColor: '#ffffff',
      alwaysVisible: false,
      alwaysVisiblePagePosition: 'left',
      alwaysVisibleAspectRatio: 50
    };
  }

  static generateSectionProps(): SectionProperties {
    return {
      elements: [],
      height: 400,
      backgroundColor: '#ffffff',
      dynamicPositioning: true,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      gridRowSizes: [{ value: 1, unit: 'fr' }],
      activeAfterID: null,
      activeAfterIdDelay: 0
    };
  }
}

import { Page, Section, Unit } from '../interfaces/unit';

export abstract class UnitFactory {
  static generateEmptyUnit(): Unit {
    return {
      unitDefinitionType: 'TODO',
      pages: [UnitFactory.generateEmptyPage()]
    };
  }

  static generateEmptyPage(): Page {
    return {
      sections: [UnitFactory.generateEmptySection()],
      hasMaxWidth: false,
      maxWidth: 900,
      margin: 30,
      backgroundColor: '#ffffff',
      alwaysVisible: false,
      alwaysVisiblePagePosition: 'left',
      alwaysVisibleAspectRatio: 50
    };
  }

  static generateEmptySection(): Section {
    return {
      elements: [],
      height: 400,
      backgroundColor: 'white',
      dynamicPositioning: false,
      autoColumnSize: true,
      autoRowSize: true,
      gridColumnSizes: '1fr 1fr',
      gridRowSizes: '1fr'
    };
  }
}

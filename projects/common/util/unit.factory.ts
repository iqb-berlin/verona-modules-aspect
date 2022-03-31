import { Page, Section, Unit } from '../interfaces/unit';
import { ElementFactory } from './element.factory';
import { PositionedElement } from '../interfaces/elements';
import packageJSON from '../../../package.json';

export abstract class UnitFactory {
  static createUnit(unit?: Unit): Unit {
    return {
      type: 'aspect-unit-definition',
      version: packageJSON.config.unit_definition_version,
      pages: unit?.pages ? unit.pages.map(page => UnitFactory.createPage(page)) : [UnitFactory.createPage()]
    };
  }

  static createPage(page?: Page): Page {
    return {
      sections: page ? page.sections.map(section => UnitFactory.createSection(section)) : [UnitFactory.createSection()],
      hasMaxWidth: page && page.hasMaxWidth !== undefined ? page.hasMaxWidth : false,
      maxWidth: page && page.hasMaxWidth !== undefined ? page.maxWidth : 900,
      margin: page && page.margin !== undefined ? page.margin : 30,
      backgroundColor: page && page.backgroundColor !== undefined ? page.backgroundColor : '#ffffff',
      alwaysVisible: page && page.alwaysVisible !== undefined ? page.alwaysVisible : false,
      alwaysVisiblePagePosition: page && page.alwaysVisiblePagePosition !== undefined ?
        page.alwaysVisiblePagePosition :
        'left',
      alwaysVisibleAspectRatio: page && page.alwaysVisibleAspectRatio !== undefined ? page.alwaysVisibleAspectRatio : 50
    };
  }

  static createSection(section?: Section): Section {
    return {
      elements: section ?
        section.elements.map(element => ElementFactory.createElement(element) as PositionedElement) :
        [],
      height: section && section.height !== undefined ? section.height : 400,
      backgroundColor: section && section.backgroundColor !== undefined ? section.backgroundColor : '#ffffff',
      dynamicPositioning: section && section.dynamicPositioning !== undefined ? section.dynamicPositioning : false,
      autoColumnSize: section && section.autoColumnSize !== undefined ? section.autoColumnSize : true,
      autoRowSize: section && section.autoRowSize !== undefined ? section.autoRowSize : true,
      gridColumnSizes: section && section.gridColumnSizes !== undefined ? section.gridColumnSizes : '1fr 1fr',
      gridRowSizes: section && section.gridRowSizes !== undefined ? section.gridRowSizes : '1fr',
      activeAfterID: section && section.activeAfterID !== undefined ? section.activeAfterID : ''
    };
  }
}

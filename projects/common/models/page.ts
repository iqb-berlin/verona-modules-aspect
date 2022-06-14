import { Section } from 'common/models/section';
import { IDManager } from 'common/util/id-manager';
import { SchemerData, UIElement } from 'common/models/elements/element';

export class Page {
  [index: string]: unknown;
  sections: Section[] = [];
  hasMaxWidth: boolean = false;
  maxWidth: number = 900;
  margin: number = 30;
  backgroundColor: string = '#ffffff';
  alwaysVisible: boolean = false;
  alwaysVisiblePagePosition: 'left' | 'right' | 'top' | 'bottom' = 'left';
  alwaysVisibleAspectRatio: number = 50;

  constructor(page?: Partial<Page>, idManager?: IDManager) {
    if (page?.hasMaxWidth) this.hasMaxWidth = page.hasMaxWidth;
    if (page?.maxWidth) this.maxWidth = page.maxWidth;
    if (page?.margin !== undefined) this.margin = page.margin;
    if (page?.backgroundColor) this.backgroundColor = page.backgroundColor;
    if (page?.alwaysVisible) this.alwaysVisible = page.alwaysVisible;
    if (page?.alwaysVisiblePagePosition) this.alwaysVisiblePagePosition = page.alwaysVisiblePagePosition;
    if (page?.alwaysVisibleAspectRatio) this.alwaysVisibleAspectRatio = page.alwaysVisibleAspectRatio;
    this.sections = page?.sections?.map(section => new Section(section, idManager)) || [new Section()];
  }

  getAllElements(elementType?: string): UIElement[] {
    return this.sections.map(section => section.getAllElements(elementType)).flat();
  }

  getSchemerData(dropLists: UIElement[]): SchemerData[] {
    return this.sections.map(section => section.getSchemerData(dropLists)).flat();
  }
}

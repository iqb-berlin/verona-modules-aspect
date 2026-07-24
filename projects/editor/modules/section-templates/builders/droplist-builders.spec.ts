import { IDService } from 'editor/src/app/services/id.service';
import { SortTemplateOptions } from 'editor/modules/section-templates/droplist-interfaces';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { createSortlistSection } from 'editor/modules/section-templates/builders/droplist-builders';

describe('droplist-builders', () => {
  describe('createSortlistSection', () => {
    let idService: IDService;

    const sortOptions: SortTemplateOptions = {
      text1: '<p>Sortiere die Elemente.</p>',
      headingSourceList: '<p>Meine Überschrift</p>',
      options: ['Option A', 'Option B'],
      optionWidth: 'medium',
      numbering: true
    };

    beforeEach(() => {
      idService = new IDService();
    });

    it('should create a text element for the heading of the sort list', () => {
      const section = createSortlistSection(sortOptions, idService);
      const textElements = section.getAllElements('text') as TextElement[];
      const headingElement = textElements.find(el => el.text === sortOptions.headingSourceList);
      expect(headingElement).toBeDefined();
      expect(headingElement?.styling.bold).toBe(true);
    });

    it('should place the heading between the intro text and the sort list', () => {
      const section = createSortlistSection(sortOptions, idService);
      const introElement = section.elements
        .find(el => (el as TextElement).text === sortOptions.text1) as TextElement;
      const headingElement = section.elements
        .find(el => (el as TextElement).text === sortOptions.headingSourceList) as TextElement;
      const dropList = section.getAllElements('drop-list')[0] as DropListElement;
      expect(headingElement.position.gridRow).toBeGreaterThan(introElement.position.gridRow as number);
      expect(dropList.position.gridRow).toBeGreaterThan(headingElement.position.gridRow as number);
    });

    it('should create the sort list with the given options', () => {
      const section = createSortlistSection(sortOptions, idService);
      const dropList = section.getAllElements('drop-list')[0] as DropListElement;
      expect(dropList.isSortList).toBe(true);
      expect(dropList.showNumbering).toBe(true);
      expect(dropList.value.length).toBe(2);
    });
  });
});

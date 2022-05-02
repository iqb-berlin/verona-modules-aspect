import { ClozeElement, InputElement } from '../interfaces/elements';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from '../interfaces/cloze';

export abstract class ClozeUtils {
  static getClozeChildElements(clozeElement: ClozeElement): InputElement[] {
    const clozeDocument: ClozeDocument = clozeElement.document;
    const elementList: InputElement[] = [];
    clozeDocument.content.forEach((documentPart: ClozeDocumentParagraph) => {
      if (documentPart.type === 'paragraph' || documentPart.type === 'heading') {
        elementList.push(...ClozeUtils.getParagraphCustomElements(documentPart));
      } else if (documentPart.type === 'bulletList' || documentPart.type === 'orderedList') {
        documentPart.content.forEach((listItem: any) => {
          listItem.content.forEach((listItemParagraph: any) => {
            elementList.push(...ClozeUtils.getParagraphCustomElements(listItemParagraph));
          });
        });
      } else if (documentPart.type === 'blockquote') {
        documentPart.content.forEach((blockQuoteItem: any) => {
          elementList.push(...ClozeUtils.getParagraphCustomElements(blockQuoteItem));
        });
      }
    });
    return elementList;
  }

  static getParagraphCustomElements(documentPart: any): InputElement[] {
    if (!documentPart.content) {
      return [];
    }
    return documentPart.content
      .filter((word: ClozeDocumentParagraphPart) => ['TextField', 'DropList', 'ToggleButton'].includes(word.type))
      .reduce((accumulator: any[], currentValue: any) => accumulator.concat(currentValue.attrs.model), []);
  }
}

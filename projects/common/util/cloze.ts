import { InputElement } from '../interfaces/elements';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from '../interfaces/cloze';

export function getClozeChildElements(clozeDocument: ClozeDocument): InputElement[] {
  const elementList: InputElement[] = [];
  clozeDocument.content.forEach((documentPart: ClozeDocumentParagraph) => {
    if (documentPart.type === 'paragraph' || documentPart.type === 'heading') {
      elementList.push(...getParagraphCustomElements(documentPart));
    } else if (documentPart.type === 'bulletList' || documentPart.type === 'orderedList') {
      documentPart.content.forEach((listItem: any) => {
        listItem.content.forEach((listItemParagraph: any) => {
          elementList.push(...getParagraphCustomElements(listItemParagraph));
        });
      });
    } else if (documentPart.type === 'blockquote') {
      documentPart.content.forEach((blockQuoteItem: any) => {
        elementList.push(...getParagraphCustomElements(blockQuoteItem));
      });
    }
  });
  return elementList;
}

function getParagraphCustomElements(documentPart: any): InputElement[] {
  if (!documentPart.content) {
    return [];
  }
  return documentPart.content
    .filter((word: ClozeDocumentParagraphPart) => ['TextField', 'DropList', 'ToggleButton'].includes(word.type))
    .reduce((accumulator: any[], currentValue: any) => accumulator.concat(currentValue.attrs.model), []);
}

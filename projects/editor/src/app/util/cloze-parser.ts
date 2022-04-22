import { IdService } from 'common/services/id.service';
import { ElementFactory } from 'common/util/element.factory';
import { ClozeDocument } from 'common/interfaces/cloze';
import { InputElement, UIElement } from 'common/interfaces/elements';

export abstract class ClozeParser {
  static setMissingIDs(clozeJSON: ClozeDocument, idService: IdService): ClozeDocument {
    clozeJSON.content.forEach((node: any) => {
      if (node.type === 'paragraph' || node.type === 'heading') {
        ClozeParser.createSubNodeElements(node, idService);
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        node.content.forEach((listItem: any) => {
          listItem.content.forEach((listItemParagraph: any) => {
            ClozeParser.createSubNodeElements(listItemParagraph, idService);
          });
        });
      } else if (node.type === 'blockquote') {
        node.content.forEach((blockQuoteItem: any) => {
          ClozeParser.createSubNodeElements(blockQuoteItem, idService);
        });
      }
    });
    return clozeJSON;
  }

  // create element anew because the TextEditor can't create multiple element instances
  private static createSubNodeElements(node: any, idService: IdService) {
    node.content?.forEach((subNode: any) => {
      if (['ToggleButton', 'DropList', 'TextField'].includes(subNode.type) &&
        subNode.attrs.model.id === 'id_placeholder') {
        subNode.attrs.model = ClozeParser.createElement(subNode.attrs.model);
        subNode.attrs.model.id = idService.getNewID(subNode.attrs.model.type);
      }
    });
  }

  private static createElement(elementModel: Partial<UIElement>): InputElement {
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field':
        newElement = ElementFactory.createElement(elementModel as UIElement) as InputElement;
        break;
      case 'drop-list':
        newElement = ElementFactory.createElement(elementModel as UIElement) as InputElement;
        break;
      case 'toggle-button':
        newElement = ElementFactory.createElement(elementModel as UIElement) as InputElement;
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    return newElement;
  }
}

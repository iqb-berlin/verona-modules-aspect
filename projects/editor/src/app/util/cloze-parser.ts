import { InputElement, UIElement } from 'common/models/elements/element';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { ElementFactory } from 'common/util/element.factory';
import { IDManager } from 'common/util/id-manager';
import {
  TextFieldSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import {
  DropListSimpleElement
} from 'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';

export abstract class ClozeParser {
  static setMissingIDs(clozeJSON: ClozeDocument): ClozeDocument {
    clozeJSON.content.forEach((node: any) => {
      if (node.type === 'paragraph' || node.type === 'heading') {
        ClozeParser.createSubNodeElements(node);
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        node.content.forEach((listItem: any) => {
          listItem.content.forEach((listItemParagraph: any) => {
            ClozeParser.createSubNodeElements(listItemParagraph);
          });
        });
      } else if (node.type === 'blockquote') {
        node.content.forEach((blockQuoteItem: any) => {
          ClozeParser.createSubNodeElements(blockQuoteItem);
        });
      }
    });
    return clozeJSON;
  }

  // create element anew because the TextEditor can't create multiple element instances
  private static createSubNodeElements(node: any) {
    const idService = IDManager.getInstance();
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
      case 'text-field-simple':
        newElement = new TextFieldSimpleElement({ type: elementModel.type, elementModel }) as InputElement;
        break;
      case 'drop-list-simple':
        newElement = new DropListSimpleElement({ type: elementModel.type, elementModel }) as InputElement;
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement({ type: elementModel.type, elementModel }) as InputElement;
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    return newElement;
  }
}

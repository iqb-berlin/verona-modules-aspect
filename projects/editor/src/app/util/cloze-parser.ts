import { ClozeDocument, InputElement, UIElement } from '../../../../common/models/uI-element';
import { IdService } from '../services/id.service';
import { TextFieldSimpleElement } from '../../../../common/ui-elements/textfield-simple/text-field-simple-element';
import { DropListSimpleElement } from '../../../../common/ui-elements/drop-list-simple/drop-list-simple';
import { ToggleButtonElement } from '../../../../common/ui-elements/toggle-button/toggle-button';

export abstract class ClozeParser {
  static setMissingIDs(clozeJSON: ClozeDocument, idService: IdService): ClozeDocument {
    clozeJSON.content.forEach((paragraph: any) => {
      paragraph.content?.forEach((node: any) => {
        if (['ToggleButton', 'DropList', 'TextField'].includes(node.type) &&
            node.attrs.model.id === 'id_placeholder') {
          // create element anew because the TextEditor can't create multiple element instances
          node.attrs.model = ClozeParser.createElement(node.attrs.model);
          node.attrs.model.id = idService.getNewID(node.attrs.model.type);
        }
      });
    });
    return clozeJSON;
  }

  private static createElement(elementModel: Partial<UIElement>): InputElement {
    let newElement: InputElement;
    switch (elementModel.type) {
      case 'text-field':
        newElement = new TextFieldSimpleElement(elementModel);
        break;
      case 'drop-list':
        newElement = new DropListSimpleElement(elementModel);
        break;
      case 'toggle-button':
        newElement = new ToggleButtonElement(elementModel);
        break;
      default:
        throw new Error(`ElementType ${elementModel.type} not found!`);
    }
    return newElement;
  }
}

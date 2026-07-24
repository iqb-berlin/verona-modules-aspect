import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';

export class EditorSection extends Section {
  deleteElements(elements: UIElement[]): void {
    elements.forEach(element => {
      this.elements = this.elements.filter(el => el.id !== element.id);
    });
  }

  getDuplicate(): EditorSection {
    return new EditorSection({
      ...this,
      elements: this.elements.map(el => el.getBlueprint())
    }, this.idService);
  }

  /* May remove existing connections! */
  connectAllDropLists(): void {
    const dropLists: DropListElement[] = this.getAllElements('drop-list') as DropListElement[];
    const dropListIDs = dropLists.map(list => list.id);
    dropLists.forEach(dropList => {
      dropList.connectedTo = [...dropListIDs];
      // remove self
      dropList.connectedTo.splice(dropListIDs.indexOf(dropList.id), 1);
    });
  }
}

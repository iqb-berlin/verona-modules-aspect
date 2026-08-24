import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';

export class EditorSection extends Section {
  /* Reports what it took out, and that is what the caller releases the IDs for: a child of a compound
     element -- a cloze gap, a table cell -- is not among `elements` and cannot be removed here, so its
     ID has to stay with it (#1262). Membership is decided by identity, because an ID that was handed
     out twice no longer tells two elements apart -- which is the very state this prevents. */
  deleteElements(elements: UIElement[]): UIElement[] {
    const deletedElements = this.elements.filter(el => elements.includes(el));
    this.elements = this.elements.filter(el => !elements.includes(el));
    return deletedElements;
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

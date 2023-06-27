import { Unit } from 'common/models/unit';
import { ButtonElement } from 'common/models/elements/button/button';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { Page } from 'common/models/page';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { TextElement } from 'common/models/elements/text/text';

export class ReferenceManager {
  /* Element types that may have references */
  static REFERENCE_ELEMENT_TYPES = ['drop-list', 'audio', 'button'];
  unit: Unit;

  constructor(unit: Unit) {
    this.unit = unit;
  }

  getPageButtonReferences(pageIndex: number): ButtonElement[] {
    const page = this.unit.pages[pageIndex];
    const allButtons = this.unit.getAllElements('button') as ButtonElement[];
    const pageButtonIDs = (page.getAllElements('button') as ButtonElement[])
      .map(pageButton => pageButton.id);
    return allButtons
      .filter(button => button.action === 'pageNav' && button.actionParam === pageIndex)
      .filter(button => !pageButtonIDs.includes(button.id));
  }

  getPageElementsReferences(page: Page): ReferenceList[] {
    const ignoredElementIDs = page.getAllElements()
      .filter(element => ReferenceManager.REFERENCE_ELEMENT_TYPES.includes(element.type))
      .map(element => element.id);
    return page.sections
      .map(section => this.getElementsReferences(section.elements, ignoredElementIDs))
      .flat();
  }

  getSectionElementsReferences(sections: Section[], otherIgnoredElementIDs: string[] = []): ReferenceList[] {
    return sections
      .map(section => this.getElementsReferences(section.elements, otherIgnoredElementIDs))
      .flat();
  }

  getElementsReferences(elements: UIElement[], otherIgnoredElementIDs: string[] = []): ReferenceList[] {
    const ignoredElementIDs = elements
      .filter(element => ReferenceManager.REFERENCE_ELEMENT_TYPES.includes(element.type))
      .map(element => element.id)
      .concat(otherIgnoredElementIDs);
    const dropListRefs = this.getDropListsReferences(elements
      .filter(element => element.type === 'drop-list') as DropListElement[], ignoredElementIDs);
    const audioRefs = this.getAudioReferences(elements
      .filter(element => element.type === 'audio') as AudioElement[], ignoredElementIDs);
    const clozeRefs = this.getClozeReferences(elements
      .filter(element => element.type === 'cloze') as ClozeElement[], ignoredElementIDs);
    const textRefs = this.getTextReferences(elements
      .filter(element => element.type === 'text') as TextElement[], ignoredElementIDs);
    return dropListRefs.concat(audioRefs).concat(clozeRefs).concat(textRefs);
  }

  private getDropListsReferences(dropLists: DropListElement[], ignoredElementIDs: string[] = []): ReferenceList[] {
    const allRefs: ReferenceList[] = [];
    const allDropLists = this.unit.getAllElements('drop-list') as DropListElement[];
    dropLists.forEach(dropList => {
      const otherConnectedDropLists = allDropLists
        .filter(foundDropList => foundDropList.id !== dropList.id &&
                                                 !ignoredElementIDs.includes(foundDropList.id) &&
                                                 foundDropList.connectedTo.indexOf(dropList.id) !== -1);
      if (otherConnectedDropLists && otherConnectedDropLists.length > 0) {
        allRefs.push({
          element: dropList,
          refs: otherConnectedDropLists
        });
      }
    });
    return allRefs;
  }

  private getAudioReferences(audios: AudioElement[], ignoredElementIDs: string[] = []): ReferenceList[] {
    const allRefs: ReferenceList[] = [];
    const allAudios = this.unit.getAllElements('audio') as AudioElement[];

    audios.forEach(audio => {
      const otherConnectedAudios = allAudios
        .filter(foundAudio => foundAudio.id !== audio.id &&
                                           !ignoredElementIDs.includes(foundAudio.id) &&
                                           foundAudio.player.activeAfterID === audio.id);
      if (otherConnectedAudios.length > 0) {
        allRefs.push({
          element: audio,
          refs: otherConnectedAudios
        });
      }
    });
    return allRefs;
  }

  private getClozeReferences(clozes: ClozeElement[], ignoredElementIDs: string[] = []): ReferenceList[] {
    return clozes.map(cloze => this.getElementsReferences(
      cloze.getChildElements()
        .filter(element => element.type === 'drop-list'),
      cloze.getChildElements()
        .filter(element => element.type === 'drop-list')
        .map(element => element.id)), ignoredElementIDs
    ).flat();
  }

  getTextReferences(textElements: TextElement[], ignoredElementIDs: string[] = []): ReferenceList[] {
    // console.log('getTextReferences', textElements, ignoredElementIDs);
    const x = textElements
      .map(textElement => this.getTextAnchorReferences(textElement.getAnchorIDs(), ignoredElementIDs))
      .flat();
    return x;
  }

  getTextAnchorReferences(deletedAnchorIDs: string[], ignoredElementIDs: string[] = []): ReferenceList[] {
    const allButtons = this.unit.getAllElements('button');
    return deletedAnchorIDs.map(id => ({
      element: { id: `Textbereich "${id}"` } as UIElement,
      refs: allButtons
        .filter(button => !ignoredElementIDs.includes(button.id) &&
                                     button.action === 'highlightText' && button.actionParam === id)
        .flat()
    }))
      .filter(refList => refList.refs.length > 0);
  }

  static deleteReferences(refs: ReferenceList[]): void {
    refs.filter(ref => ref.element.type === 'drop-list').forEach(ref => {
      (ref.refs as DropListElement[]).forEach((dropList: DropListElement) => {
        dropList.connectedTo = dropList.connectedTo.filter(dropListID => dropListID !== ref.element.id);
      });
    });
    refs.filter(ref => ref.element.type === 'audio').forEach(ref => {
      (ref.refs as AudioElement[]).forEach((audio: AudioElement) => {
        audio.player.activeAfterID = '';
      });
    });
    refs.filter(ref => ref.element.type === 'page').forEach(ref => {
      (ref.refs as ButtonElement[]).forEach((button: ButtonElement) => {
        button.actionParam = null;
      });
    });
  }
}

export interface ReferenceList {
  element: UIElement | {
    id: string;
    type: 'page'
  };
  refs: UIElement[];
}

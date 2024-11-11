import { Unit } from 'common/models/unit';
import { ButtonElement } from 'common/models/elements/button/button';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { Page } from 'common/models/page';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { TextElement } from 'common/models/elements/text/text';
import { VideoElement } from 'common/models/elements/media-elements/video';

export class ReferenceManager {
  /* Element types that may have references */
  static REFERENCE_ELEMENT_TYPES = ['drop-list', 'audio', 'button'];
  unit: Unit;

  constructor(unit: Unit) {
    this.unit = unit;
  }

  getAllInvalidRefs(): UIElement[] {
    return [...this.getInvalidPageRefs(), ...this.getInvalidDropListRefs(), ...this.getInvalidPlayerElementRefs()];
  }

  getInvalidPageRefs(): ButtonElement[] {
    const allRefs: ButtonElement[] = [];
    const allButtons = this.unit.getAllElements('button') as ButtonElement[];
    const validPageRange = this.unit.pages.length;
    allButtons.forEach(button => {
      if (button.action === 'pageNav' &&
          typeof button.actionParam === 'number' &&
          (button.actionParam + 1) > validPageRange) {
        allRefs.push(button);
      }
    });
    return allRefs;
  }

  private getInvalidDropListRefs(): DropListElement[] {
    const allDropLists = this.unit.getAllElements('drop-list') as DropListElement[];
    const allDropListIDs = allDropLists.map(dropList => dropList.id);
    return allDropLists.filter(dropList => dropList.connectedTo
      .filter(connectedList => !allDropListIDs.includes(connectedList)).length > 0);
  }

  private getInvalidPlayerElementRefs(): (AudioElement | VideoElement)[] {
    const allAudioAndVideos: (AudioElement | VideoElement)[] = [
      ...this.unit.getAllElements('audio') as AudioElement[],
      ...this.unit.getAllElements('video') as VideoElement[]
    ];
    const allAudioAndVideoIDs = allAudioAndVideos.map(element => element.id);
    return allAudioAndVideos.filter(
      element => element.player.activeAfterID !== '' &&
                                           !allAudioAndVideoIDs.includes(element.player.activeAfterID));
  }

  removeInvalidRefs(refs: UIElement[]): void {
    refs.forEach(ref => {
      switch (ref.type) {
        case 'button':
          (ref as ButtonElement).actionParam = null;
          break;
        case 'drop-list':
          (ref as DropListElement).connectedTo = (ref as DropListElement).connectedTo
            .filter(connectedList => this.unit.getAllElements('drop-list')
              .map(dropList => dropList.id).includes(connectedList));
          break;
        case 'audio':
          (ref as AudioElement).player.activeAfterID = '';
          break;
        // no default
      }
    });
  }

  getButtonReferencesForPage(pageIndex: number): ReferenceList[] {
    const page = this.unit.pages[pageIndex];
    const allButtons = this.unit.getAllElements('button') as ButtonElement[];
    const pageButtonIDs = (page.getAllElements('button') as ButtonElement[])
      .map(pageButton => pageButton.id);
    const refs = allButtons
      .filter(button => button.action === 'pageNav' && button.actionParam === pageIndex)
      .filter(button => !pageButtonIDs.includes(button.id));
    if (refs.length > 0) {
      return [{
        element: {
          alias: `Seite ${pageIndex + 1}`,
          type: 'page'
        },
        refs: refs
      }];
    }
    return [];
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
    const audioRefs = this.getAudioVideoReferences(elements
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

  private getAudioVideoReferences(playerElements: (AudioElement | VideoElement)[], ignoredElementIDs: string[] = [])
    : ReferenceList[] {
    const allRefs: ReferenceList[] = [];
    const allAudioAndVideos: (AudioElement | VideoElement)[] = [
      ...this.unit.getAllElements('audio') as AudioElement[],
      ...this.unit.getAllElements('video') as VideoElement[]
    ];

    playerElements.forEach(element => {
      const refs = allAudioAndVideos
        .filter(foundElement => foundElement.id !== element.id &&
                                                          !ignoredElementIDs.includes(foundElement.id) &&
                                                          foundElement.player.activeAfterID === element.id);
      if (refs.length > 0) {
        allRefs.push({
          element: element,
          refs: refs
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
    return textElements
      .map(textElement => this.getTextAnchorReferences(textElement.getAnchorIDs(), ignoredElementIDs))
      .flat();
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
        dropList.connectedTo = dropList.connectedTo.filter(dropListID => dropListID !== (ref.element as UIElement).id);
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
    alias: string;
    type: 'page'
  };
  refs: UIElement[];
}

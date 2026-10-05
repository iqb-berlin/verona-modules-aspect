import { Unit } from 'common/models/unit';
import { ButtonElement } from 'common/models/elements/button';
import { DropListElement } from 'common/models/elements/drop-list';
import { PlayerElement, UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { TextElement } from 'common/models/elements/text';
import { TriggerElement } from 'common/models/elements/trigger';
import { StateVariable } from 'common/models/state-variable';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { Page } from 'common/models/page';
import { ScrollPagesPipe } from 'common/pipes/scroll-pages.pipe';

/** What can hold a reference: an element, or a section through its visibility rules. */
export type Referrer = UIElement | Section;

/** A section that refers to something, with the place the author finds it at. */
export interface SectionLocation {
  section: Section;
  pageIndex: number;
  sectionIndex: number;
}

/**
 * One way in which an object of the unit refers to another by its id. Every kind of reference is described here
 * once -- which objects hold it, which ids it holds, how it is taken away -- and everything that looks for, removes or
 * repairs references goes through these descriptions (#1509). A kind that is not listed is a reference nothing
 * looks after; replacing an id (#1508) is meant to be one more operation here, not one more place per kind.
 */
interface ReferenceKind {
  isReferrer(referrer: Referrer): boolean;
  /** The ids the referrer points to through this kind. */
  targets(referrer: Referrer): string[];
  remove(referrer: Referrer, targetID: string): void;
  /** Points the reference at a new id of the same target, when an id that breaks the contract is replaced (#1508). */
  replace(referrer: Referrer, oldID: string, newID: string): void;
  /** Whether the target can be of this kind's referring at all: a drop-list connects to drop-lists only. */
  accepts(target: ReferenceHolder): boolean;
  /** The ids this kind may point to at all; anything else it holds is a reference into nothing. */
  validTargets(unit: Unit): Set<string>;
  /**
   * Whether a reference into nothing is removed when a unit is loaded, or only reported. Removing is right where the
   * player makes nothing of the reference anyway; a visibility rule is the exception, see there.
   */
  repairOnLoad: boolean;
}

/** What can be referred to by its id: an element or a state variable. */
export type ReferenceHolder = UIElement | StateVariable;

const idsOf = (elements: UIElement[]): Set<string> => new Set(elements.map(element => element.id));
const isElementType = (target: ReferenceHolder, ...types: string[]): boolean => !(target instanceof StateVariable) &&
  types.includes(target.type);
const isElementOf = (referrer: Referrer, ...types: string[]): boolean => !(referrer instanceof Section) &&
  types.includes(referrer.type);
const isStateVariableAction = (referrer: Referrer): boolean => isElementOf(referrer, 'button', 'trigger') &&
  (referrer as ButtonElement | TriggerElement).action === 'stateVariableChange' &&
  typeof (referrer as ButtonElement | TriggerElement).actionParam === 'object' &&
  (referrer as ButtonElement | TriggerElement).actionParam !== null;

const REFERENCE_KINDS: ReferenceKind[] = [
  /** A drop-list lists the drop-lists it exchanges items with. */
  {
    isReferrer: referrer => isElementOf(referrer, 'drop-list'),
    targets: referrer => (referrer as DropListElement).connectedTo,
    remove: (referrer, targetID) => {
      const dropList = referrer as DropListElement;
      dropList.connectedTo = dropList.connectedTo.filter(connectedID => connectedID !== targetID);
    },
    replace: (referrer, oldID, newID) => {
      const dropList = referrer as DropListElement;
      dropList.connectedTo = dropList.connectedTo.map(connectedID => (connectedID === oldID ? newID : connectedID));
    },
    accepts: target => isElementType(target, 'drop-list'),
    validTargets: unit => idsOf(unit.getAllElements('drop-list')),
    repairOnLoad: true
  },
  /** An audio or video can wait for another one to have been played. */
  {
    isReferrer: referrer => isElementOf(referrer, 'audio', 'video'),
    targets: referrer => {
      const { activeAfterID } = (referrer as PlayerElement).player;
      return activeAfterID ? [activeAfterID] : [];
    },
    remove: referrer => { (referrer as PlayerElement).player.activeAfterID = ''; },
    replace: (referrer, oldID, newID) => {
      const { player } = referrer as PlayerElement;
      if (player.activeAfterID === oldID) player.activeAfterID = newID;
    },
    accepts: target => isElementType(target, 'audio', 'video'),
    validTargets: unit => idsOf([...unit.getAllElements('audio'), ...unit.getAllElements('video')]),
    repairOnLoad: true
  },
  /** A text names the marking panels whose colours it can be marked with. */
  {
    isReferrer: referrer => isElementOf(referrer, 'text'),
    targets: referrer => (referrer as TextElement).markingPanels,
    remove: (referrer, targetID) => {
      const text = referrer as TextElement;
      text.markingPanels = text.markingPanels.filter(panelID => panelID !== targetID);
    },
    replace: (referrer, oldID, newID) => {
      const text = referrer as TextElement;
      text.markingPanels = text.markingPanels.map(panelID => (panelID === oldID ? newID : panelID));
    },
    accepts: target => isElementType(target, 'marking-panel'),
    validTargets: unit => idsOf(unit.getAllElements('marking-panel')),
    repairOnLoad: true
  },
  /**
   * A section is shown on rules about the value of an element or a state variable. A rule whose target is gone is
   * never fulfilled in the player, so with "and" its section is never shown, and a section left without rules is
   * always shown. Removing such a rule on load would change what test takers see without anyone having decided it,
   * which is why it is only reported then; deleting the target removes it, after the author confirmed.
   */
  {
    isReferrer: referrer => referrer instanceof Section,
    targets: referrer => (referrer as Section).visibilityRules.map(rule => rule.id),
    remove: (referrer, targetID) => {
      const section = referrer as Section;
      section.visibilityRules = section.visibilityRules.filter(rule => rule.id !== targetID);
    },
    replace: (referrer, oldID, newID) => {
      (referrer as Section).visibilityRules
        .filter(rule => rule.id === oldID)
        .forEach(rule => { rule.id = newID; });
    },
    accepts: () => true,
    validTargets: unit => new Set([...idsOf(unit.getAllElements()), ...unit.stateVariables.map(v => v.id)]),
    repairOnLoad: false
  },
  /**
   * A button or a trigger can set a state variable. The action goes with the variable: left without one, the panel
   * would offer the first remaining variable as if it were chosen, while the player sets nothing.
   */
  {
    isReferrer: isStateVariableAction,
    targets: referrer => [((referrer as ButtonElement | TriggerElement).actionParam as StateVariable).id],
    remove: referrer => {
      const element = referrer as ButtonElement | TriggerElement;
      element.action = null;
      element.actionParam = null;
    },
    replace: (referrer, oldID, newID) => {
      const stateVariable = (referrer as ButtonElement | TriggerElement).actionParam as StateVariable;
      if (stateVariable.id === oldID) stateVariable.id = newID;
    },
    accepts: target => target instanceof StateVariable,
    validTargets: unit => new Set(unit.stateVariables.map(stateVariable => stateVariable.id)),
    repairOnLoad: true
  }
];

/** What is referred to: an element, or one of the targets that are not elements, named for the author. */
export type ReferenceTarget = UIElement |
{ type: 'page'; alias: string } |
{ type: 'state-variable'; id: string; alias: string } |
{ type: 'text-anchor'; id: string; alias: string };

/** Who refers to one target. */
export interface ReferenceList {
  element: ReferenceTarget;
  refs: UIElement[];
  /** Sections that refer to the target through a visibility rule. */
  sections?: SectionLocation[];
}

/** A section whose visibility rules ask for something the unit does not hold, with the ids they ask for. */
export interface RulesIntoNothing {
  location: SectionLocation;
  targetIDs: string[];
}

/** Everything that goes together and whose references among each other therefore do not count. */
interface DeletedScope {
  elementIDs: Set<string>;
  sections: Set<Section>;
}

export class ReferenceManager {
  unit: Unit;

  constructor(unit: Unit) {
    this.unit = unit;
  }

  /**
   * Called when a unit is loaded: removes references into nothing where the player makes nothing of them, and returns
   * the elements it removed them from. Navigation buttons to a page beyond the last are repaired as well. What is
   * only reported, the visibility rules, is {@link getRulesIntoNothing}.
   */
  repairInvalidReferences(): UIElement[] {
    const repaired = new Set<UIElement>(this.repairInvalidPageRefs());
    REFERENCE_KINDS.filter(kind => kind.repairOnLoad).forEach(kind => {
      const validTargets = kind.validTargets(this.unit);
      this.getReferrers(kind).forEach(referrer => {
        const invalidTargets = kind.targets(referrer).filter(targetID => !validTargets.has(targetID));
        if (invalidTargets.length === 0) return;
        invalidTargets.forEach(targetID => kind.remove(referrer, targetID));
        repaired.add(referrer as UIElement);
      });
    });
    return [...repaired];
  }

  /**
   * The sections whose visibility rules point into nothing, which loading leaves as they are. Asked again on every
   * change, so the editor can show them until the author has fixed them (#1520).
   */
  getRulesIntoNothing(): RulesIntoNothing[] {
    return REFERENCE_KINDS.filter(kind => !kind.repairOnLoad).flatMap(kind => {
      const validTargets = kind.validTargets(this.unit);
      return this.getReferrers(kind)
        .map(referrer => ({
          referrer,
          targetIDs: [...new Set(kind.targets(referrer).filter(targetID => !validTargets.has(targetID)))]
        }))
        // Located only where something is reported: this runs on every change of the unit.
        .filter(rules => rules.targetIDs.length > 0)
        .map(rules => ({ location: this.locateSection(rules.referrer as Section), targetIDs: rules.targetIDs }));
    });
  }

  /**
   * Counted as the player counts them: a number that names no scroll page -- beyond the last one, negative or not
   * whole -- is no target (#1511).
   */
  private repairInvalidPageRefs(): ButtonElement[] {
    const pages = ReferenceManager.scrollPages(this.unit);
    const invalid = this.getPageNavigationButtons()
      .filter(button => pages[button.actionParam as number] === undefined);
    invalid.forEach(button => { button.actionParam = null; });
    return invalid;
  }

  /**
   * The pages a navigation button can lead to, which is what its number counts: all but a permanently visible page,
   * by the rule the player navigates with (#1511).
   */
  static scrollPages(unit: Unit): Page[] {
    return new ScrollPagesPipe().transform(unit.pages);
  }

  /**
   * Which page each navigation button leads to, as the page itself rather than its number. Deleting, moving,
   * inserting or merging pages renumbers them while the buttons keep their numbers; taken before such a step and
   * handed to `restorePageTargets` after it, every button leads to the same page as before (#1511).
   */
  capturePageTargets(): Map<ButtonElement, Page> {
    const pages = ReferenceManager.scrollPages(this.unit);
    return new Map(this.getPageNavigationButtons()
      .filter(button => pages[button.actionParam as number] !== undefined)
      .map(button => [button, pages[button.actionParam as number]]));
  }

  /**
   * Gives each button the number its page has now. A page no longer among the scroll pages -- deleted, or made
   * permanently visible and so always in view -- leaves the button without a target. `mergedInto` names, for a page
   * whose sections went to another page, where its content is now; when that is the page the button stands on, it
   * has nowhere left to lead either.
   *
   * Returns whether any button changed, so the caller knows whether a panel showing one has to be refreshed.
   */
  restorePageTargets(captured: Map<ButtonElement, Page>, mergedInto: Map<Page, Page> = new Map()): boolean {
    const pages = ReferenceManager.scrollPages(this.unit);
    let changed = false;
    captured.forEach((page, button) => {
      const target = mergedInto.get(page) ?? page;
      const index = target.getAllElements('button').includes(button) ? -1 : pages.indexOf(target);
      const actionParam = index >= 0 ? index : null;
      if (button.actionParam !== actionParam) changed = true;
      button.actionParam = actionParam;
    });
    return changed;
  }

  private getPageNavigationButtons(): ButtonElement[] {
    return (this.unit.getAllElements('button') as ButtonElement[])
      .filter(button => button.action === 'pageNav' && typeof button.actionParam === 'number');
  }

  /**
   * Buttons elsewhere that lead to the page at `pageIndex` in `unit.pages`. A button counts scroll pages only, so
   * the index is translated first; compared as it was, with a permanently visible page in front every button was
   * matched against the page after the deleted one (#1511). That page itself is no button's target.
   */
  getButtonReferencesForPage(pageIndex: number): ReferenceList[] {
    const page = this.unit.pages[pageIndex];
    const scrollIndex = ReferenceManager.scrollPages(this.unit).indexOf(page);
    if (scrollIndex < 0) return [];
    const pageButtonIDs = (page.getAllElements('button') as ButtonElement[])
      .map(pageButton => pageButton.id);
    const refs = this.getPageNavigationButtons()
      .filter(button => button.actionParam === scrollIndex)
      .filter(button => !pageButtonIDs.includes(button.id));
    if (refs.length > 0) {
      return [{
        element: {
          alias: `Seite ${scrollIndex + 1}`,
          type: 'page'
        },
        refs: refs
      }];
    }
    return [];
  }

  getPageElementsReferences(page: EditorPage): ReferenceList[] {
    return this.getSectionElementsReferences(page.sections);
  }

  getSectionElementsReferences(sections: Section[]): ReferenceList[] {
    const elements = sections.flatMap(section => section.elements);
    return this.findReferences(elements, ReferenceManager.scopeOf(elements, sections));
  }

  getElementsReferences(elements: UIElement[]): ReferenceList[] {
    return this.findReferences(elements, ReferenceManager.scopeOf(elements, []));
  }

  /** Who refers to the given state variables, about to be deleted. */
  getStateVariableReferences(stateVariables: StateVariable[]): ReferenceList[] {
    const referrersByKind = this.getReferrersByKind();
    return stateVariables
      .map(stateVariable => this.collect(
        { type: 'state-variable' as const, id: stateVariable.id, alias: stateVariable.alias },
        stateVariable.id,
        { elementIDs: new Set(), sections: new Set() },
        referrersByKind))
      .filter(ReferenceManager.isNotEmpty);
  }

  /**
   * Buttons and triggers that highlight a text range about to go away. The anchor is no element and has no kind of
   * its own in the table; its references are removed through the type of the group.
   *
   * An anchor's id is the marked text itself, so two texts can hold the same one, and a duplicated text always
   * does. An anchor still held by a text that stays is not going away, and what highlights it keeps its target.
   * `goingTextIDs` names the texts whose anchors go: the deleted ones, or the one being edited.
   */
  getTextAnchorReferences(deletedAnchorIDs: string[], goingTextIDs: Set<string>,
                          ignoredElementIDs: Set<string> = new Set()): ReferenceList[] {
    const remainingAnchorIDs = new Set((this.unit.getAllElements('text') as TextElement[])
      .filter(text => !goingTextIDs.has(text.id))
      .flatMap(text => text.getAnchorIDs()));
    const highlighters = [...this.unit.getAllElements('button'), ...this.unit.getAllElements('trigger')] as
      (ButtonElement | TriggerElement)[];
    return [...new Set(deletedAnchorIDs)]
      .filter(id => !remainingAnchorIDs.has(id))
      .map(id => ({
        element: { type: 'text-anchor' as const, id, alias: id },
        refs: highlighters.filter(element => !ignoredElementIDs.has(element.id) &&
          element.action === 'highlightText' && element.actionParam === id)
      }))
      .filter(refList => refList.refs.length > 0);
  }

  /**
   * Points every reference to the holder's old id at its new one: the target stays, only its id changes (#1508).
   *
   * `twins` are other objects with exactly the old id, possible in stored units. A kind whose references could
   * belong to a twin as well is left alone, as nothing tells them apart and the twin is the one that stays; a kind
   * that can only mean the holder -- a drop-list connection where the twin is a state variable -- follows it.
   */
  replaceReferences(oldID: string, newID: string, holder: ReferenceHolder, twins: ReferenceHolder[] = []): void {
    const referrersByKind = this.getReferrersByKind();
    REFERENCE_KINDS
      .filter(kind => kind.accepts(holder) && !twins.some(twin => kind.accepts(twin)))
      .forEach(kind => (referrersByKind.get(kind) ?? [])
        .forEach(referrer => kind.replace(referrer, oldID, newID)));
  }

  /** Removes what the lists name: the references the author agreed to give up along with their targets. */
  static deleteReferences(refs: ReferenceList[]): void {
    refs.forEach(refList => {
      const { element } = refList;
      if (element.type === 'page' || element.type === 'text-anchor') {
        refList.refs.forEach(referrer => { (referrer as ButtonElement | TriggerElement).actionParam = null; });
        return;
      }
      const targetID = (element as { id: string }).id;
      const referrers: Referrer[] = [...refList.refs, ...(refList.sections ?? []).map(location => location.section)];
      REFERENCE_KINDS.forEach(kind => referrers
        .filter(referrer => kind.isReferrer(referrer) && kind.targets(referrer).includes(targetID))
        .forEach(referrer => kind.remove(referrer, targetID)));
    });
  }

  private findReferences(elements: UIElement[], scope: DeletedScope): ReferenceList[] {
    const targets = elements.flatMap(element => [element, ...element.getChildElements()]);
    const referrersByKind = this.getReferrersByKind();
    const elementRefs = targets
      .map(target => this.collect(target, target.id, scope, referrersByKind))
      .filter(ReferenceManager.isNotEmpty);
    const anchorRefs = this.getTextAnchorReferences(
      (targets.filter(target => target.type === 'text') as TextElement[]).flatMap(text => text.getAnchorIDs()),
      scope.elementIDs,
      scope.elementIDs);
    return [...elementRefs, ...anchorRefs];
  }

  /** Everyone outside the deleted scope that refers to one target, through any kind. */
  private collect(element: ReferenceTarget, targetID: string, scope: DeletedScope,
                  referrersByKind: Map<ReferenceKind, Referrer[]> = this.getReferrersByKind()): ReferenceList {
    const referrers = REFERENCE_KINDS.flatMap(kind => (referrersByKind.get(kind) ?? [])
      .filter(referrer => kind.targets(referrer).includes(targetID)));
    const unique = [...new Set(referrers)];
    return {
      element,
      refs: unique.filter(referrer => !(referrer instanceof Section) && !scope.elementIDs.has(referrer.id)) as
        UIElement[],
      sections: unique.filter(referrer => referrer instanceof Section && !scope.sections.has(referrer))
        .map(section => this.locateSection(section as Section))
    };
  }

  private getReferrers(kind: ReferenceKind): Referrer[] {
    return this.getAllReferrers().filter(referrer => kind.isReferrer(referrer));
  }

  /** Walks the unit once and sorts what can refer by kind, for a search over many targets. */
  private getReferrersByKind(): Map<ReferenceKind, Referrer[]> {
    const allReferrers = this.getAllReferrers();
    return new Map(REFERENCE_KINDS.map(kind => [kind, allReferrers.filter(referrer => kind.isReferrer(referrer))]));
  }

  private getAllReferrers(): Referrer[] {
    return [...this.unit.getAllElements(), ...this.unit.pages.flatMap(page => page.sections)];
  }

  private locateSection(section: Section): SectionLocation {
    const pageIndex = this.unit.pages.findIndex(page => page.sections.includes(section));
    return { section, pageIndex, sectionIndex: this.unit.pages[pageIndex]?.sections.indexOf(section) ?? -1 };
  }

  /** The deleted elements with their children, and the deleted sections. */
  private static scopeOf(elements: UIElement[], sections: Section[]): DeletedScope {
    return {
      elementIDs: new Set(elements.flatMap(element => [element, ...element.getChildElements()])
        .map(element => element.id)),
      sections: new Set(sections)
    };
  }

  private static isNotEmpty(refList: ReferenceList): boolean {
    return refList.refs.length > 0 || (refList.sections ?? []).length > 0;
  }
}

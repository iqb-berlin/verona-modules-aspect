import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import {
  ClozeChildOverlayComponent
} from 'common/components/cloze-child-overlay/cloze-child-overlay.component';
import {
  TableChildOverlay
} from 'common/components/table-child-overlay/table-child-overlay.component';

/**
 * What the editor has selected: the page, the section, the element models, and the overlay
 * components that render them.
 *
 * The three flags below are DERIVED from the selection and never written from outside. They used to
 * be set by whoever had just clicked, which left them describing an earlier selection -- a
 * shift-click on a second element cleared a flag while the first was still selected (#1268). What
 * they decide is which controls the properties panel offers.
 *
 * {@link reset} is the seam at a unit change: whatever is left here afterwards describes elements
 * the incoming unit does not contain (#1089).
 */
@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  selectedPageIndex: number = 0;
  selectedSectionIndex: number = 0;
  private _selectedElements!: BehaviorSubject<UIElement[]>;
  selectedElementComponents: (ElementOverlay | ClozeChildOverlayComponent | TableChildOverlay)[] = [];
  /**
   * Whether a child of a compound element -- a cloze gap, a table cell -- is among the selected
   * elements. What it turns off is what cannot be done to such a child: the properties panel takes
   * away deleting and duplicating, because a child is not on the section level and no deletion there
   * reaches it (#1262).
   *
   * Derived from the selection whenever the selection changes, never written from outside: it used to
   * be set by whoever had just clicked, so a shift-click on another element cleared it while the
   * child stayed selected (#1268).
   */
  isCompoundChildSelected: boolean = false;
  /**
   * Whether the selection is nothing but such children. Read by `isSelectionDynamicallyPositioned`
   * below, which the properties panel asks: the controls it decides on describe how an element is
   * laid out, and a child is laid out inline like an element in a dynamically positioned section. An
   * element the section places itself is not, so a selection holding both keeps what the section
   * says (#1268).
   */
  onlyCompoundChildrenSelected: boolean = false;
  /**
   * Whether the selection is laid out by a grid, which is what decides between the two sets of
   * position and size controls in the properties panel.
   *
   * A selection spanning two sections has an answer as long as both position the same way, and a
   * compound child is laid out inline, i.e. like an element in a dynamically positioned section
   * (#1268). Where they disagree the answer is no: the panel then offers the coordinate fields, and
   * a grid element keeps its margins from its own section. Offering the inline controls instead
   * would write a grid row and a size limit onto an element the section places itself, where both
   * land in the stored definition and are ignored -- which is the case the rule from #1268 was
   * written to exclude.
   */
  isSelectionDynamicallyPositioned: boolean = false;

  constructor() {
    this._selectedElements = new BehaviorSubject([] as UIElement[]);
  }

  /**
   * Called when a unit is (re)loaded, so everything left behind here describes a unit that is gone.
   * Emptying `selectedElementComponents` left the subject the properties panel reads at its last
   * value, so the panel kept offering controls for elements the incoming unit does not contain.
   * After loadUnit that is brief -- every ElementOverlay re-selects itself as it renders -- but the
   * empty branch of loadUnitDefinition renders no overlay at all, so there it persists (#1089).
   */
  reset(): void {
    this.selectedPageIndex = 0;
    this.selectedSectionIndex = 0;
    this.clearElementSelection();
  }

  updateSelection(pageIndex: number, sectionIndex: number): void {
    this.selectedPageIndex = pageIndex;
    this.selectedSectionIndex = sectionIndex;
  }

  get selectedElements(): Observable<UIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UIElement[] {
    return this._selectedElements.value;
  }

  selectElement(event: {
    elementComponent: ElementOverlay | ClozeChildOverlayComponent | TableChildOverlay;
    multiSelect: boolean
  }): void {
    if (!event.multiSelect) {
      this.clearElementSelection();
    }
    this.selectedElementComponents.push(event.elementComponent);
    event.elementComponent.setSelected(true);
    this.publishSelection();
  }

  /** The one way out of here: every change of `selectedElementComponents` ends in this, so the flag and
     the subject cannot describe different selections (#1268). */
  private publishSelection(): void {
    const compoundChildren = this.selectedElementComponents
      .filter(overlayComponent => overlayComponent instanceof ClozeChildOverlayComponent ||
        overlayComponent instanceof TableChildOverlay);
    this.isCompoundChildSelected = compoundChildren.length > 0;
    this.onlyCompoundChildrenSelected = compoundChildren.length > 0 &&
      compoundChildren.length === this.selectedElementComponents.length;
    /* Asked of the overlay by its section, not by its class: a compound child overlay has none, and
       keying on the class would tie this service to the overlay implementation. */
    const knownSections = this.selectedElementComponents
      .map(overlayComponent => ('section' in overlayComponent ? overlayComponent.section : undefined))
      .filter((section): section is Section => !!section);
    this.isSelectionDynamicallyPositioned = this.onlyCompoundChildrenSelected ||
      (knownSections.length > 0 && knownSections.every(section => section.dynamicPositioning));
    this._selectedElements.next(this.selectedElementComponents.map(overlayComponent => overlayComponent.element));
  }

  /** Takes the named elements out of the selection and leaves the rest of it alone -- a delete has no
     reason to unselect what it did not touch, and nothing would re-select it: the overlays that stay
     are not rebuilt. Compound children are named too, because getAllElements reaches them (#1258). */
  deselectElements(elements: UIElement[]): void {
    const goneComponents = this.selectedElementComponents
      .filter(overlayComponent => elements.includes(overlayComponent.element));
    if (goneComponents.length === 0) return;
    goneComponents.forEach(overlayComponent => overlayComponent.setSelected(false));
    this.selectedElementComponents = this.selectedElementComponents
      .filter(overlayComponent => !elements.includes(overlayComponent.element));
    this.publishSelection();
  }

  clearElementSelection(): void {
    this.selectedElementComponents
      .forEach((overlayComponent: ElementOverlay | ClozeChildOverlayComponent | TableChildOverlay) => {
        overlayComponent.setSelected(false);
      });
    this.selectedElementComponents = [];
    this.publishSelection();
  }

  selectPage(index: number) {
    this.clearElementSelection();
    this.selectedPageIndex = index;
    this.selectedSectionIndex = 0;
  }

  selectPreviousPage() {
    this.selectPage(Math.max(this.selectedPageIndex - 1, 0));
  }
}

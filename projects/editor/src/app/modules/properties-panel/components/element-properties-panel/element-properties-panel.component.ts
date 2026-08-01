import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'editor/src/app/services/message.service';
import { UIElement } from 'common/models/elements/element';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { ElementService } from 'editor/src/app/services/element.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

export type CombinedProperties = UIElement & { idList?: string[] };

@Component({
  selector: 'aspect-element-properties',
  templateUrl: './element-properties-panel.component.html',
  styleUrls: ['./element-properties-panel.component.scss'],
  standalone: false
})
export class ElementPropertiesPanelComponent implements OnInit, OnDestroy {
  selectedElements: UIElement[] = [];
  combinedProperties: CombinedProperties | undefined;
  private ngUnsubscribe = new Subject<void>();

  interactionEnabled = false;
  interactionIndeterminate = false;
  /** Keeps a merge that keeps failing from reporting itself once per unit-wide property update. */
  private mergeFailureReported = false;

  constructor(protected selectionService: SelectionService,
              public unitService: UnitService,
              public sectionService: SectionService,
              public elementService: ElementService,
              private messageService: MessageService,
              public sanitizer: DomSanitizer,
              private translateService: TranslateService) { }

  ngOnInit(): void {
    this.unitService.elementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.refreshCombinedProperties();
        }
      );
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UIElement[]) => {
          this.selectedElements = selectedElements;
          this.refreshCombinedProperties();

          this.interactionEnabled = this.selectionService.selectedElementComponents
            .filter(elementOverlay => elementOverlay instanceof ElementOverlay)
            .reduce((accumulator: boolean, elementOverlay: any) => elementOverlay.isInteractionEnabled(), false);

          this.interactionIndeterminate = (this.selectionService.selectedElementComponents.length > 1) &&
            this.selectionService.selectedElementComponents
              .filter(elementOverlay => elementOverlay instanceof ElementOverlay)
              .reduce((accumulator: any, elementOverlay: any) => {
                if (!accumulator) return elementOverlay.isInteractionEnabled();
                return accumulator !== elementOverlay.isInteractionEnabled();
              }, undefined);
        }
      );
  }

  /**
   * The selected elements as one object, the way the panel's components read it.
   *
   * `idList` and `rows` are added here rather than inside the merge, because they are about the
   * selection as a whole and not about a single property:
   *
   * - `idList` holds the ids of everything selected, so the drop list can leave the selected lists
   *   out of its own "connected lists" options. It used to sit on the merge base, where the loop
   *   below deleted it again on the first iteration: the loop walks the merge object's keys and
   *   drops every key the next element does not have - and no element has an `idList` (#1119).
   * - `rows` is replaced by a copy so the options panel sees a new reference and re-renders.
   */
  static createCombinedProperties(elements: UIElement[]): CombinedProperties | undefined {
    if (elements.length === 0) return undefined;
    const combinedProperties = ElementPropertiesPanelComponent.mergeElements(elements);
    combinedProperties.idList = elements.map(element => element.id);
    combinedProperties.rows = combinedProperties.rows ?
      [...combinedProperties.rows as LikertRowElement[]] :
      undefined;
    return combinedProperties;
  }

  /**
   * Rebuilds the merged view of the current selection.
   *
   * The merge is the one thing between the selection and everything the panel shows, and it used
   * to be called straight from both subscribers. An exception in it therefore left
   * `selectedElements` already switched to the new selection while `combinedProperties` still held
   * the previous one - RxJS swallows the error, so the panel went on rendering the old values and
   * `updateModel` wrote them to the newly selected elements on the next edit (#1155). Failing to
   * `undefined` takes every control away, so there is nothing left to write with; the template
   * turns that into its own message rather than a blank pane.
   *
   * Reported once per failure and not once per call: `elementPropertyUpdated` fires for edits
   * anywhere in the unit, and re-running the same failing merge on an unchanged broken selection
   * would put a snackbar on screen for each of them.
   *
   * The bug that made this reachable is fixed; this keeps the next one from corrupting a unit.
   */
  private refreshCombinedProperties(): void {
    try {
      this.combinedProperties =
        ElementPropertiesPanelComponent.createCombinedProperties(this.selectedElements);
      this.mergeFailureReported = false;
    } catch (error) {
      this.combinedProperties = undefined;
      if (this.mergeFailureReported) return;
      this.mergeFailureReported = true;
      this.messageService.showError(this.translateService.instant('propertiesPanel.combineFailed'));
      // eslint-disable-next-line no-console -- the message above cannot carry the cause
      console.error('Merging the selected elements failed', error);
    }
  }

  /**
   * A value the merge can recurse into: a property group, as opposed to a primitive, an array or
   * `null`. Arrays are excluded because the merge deliberately treats a diverging array as one
   * value rather than merging it entry by entry - see {@link Merged}.
   */
  private static isPropertyGroup(value: unknown): value is UIElement {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Merges the elements property by property: equal values are kept, diverging ones become `null`,
   * and a property that not every element has is dropped. Nested property groups recurse through
   * here too, which is why the two selection-wide keys above are not part of it - a position group
   * has no id and no rows.
   *
   * The recursion needs a property group on **both** sides. Testing only the side already in
   * `merged` walked into `hasOwnProperty.call(null, …)` as soon as the other element had `null`
   * there - a trigger with an `actionParam` selected before one without, say (#1155). A group
   * against a non-group is as diverging as any other pair, so it takes the branch below and
   * becomes `null`.
   */
  private static mergeElements(elements: UIElement[]): CombinedProperties {
    const merged = { ...elements[0] } as CombinedProperties;

    for (let elementCounter = 1; elementCounter < elements.length; elementCounter++) {
      const elementToMerge = elements[elementCounter];
      Object.keys(merged).forEach((property: keyof UIElement) => {
        if (Object.prototype.hasOwnProperty.call(elementToMerge, property)) {
          if (ElementPropertiesPanelComponent.isPropertyGroup(merged[property]) &&
            ElementPropertiesPanelComponent.isPropertyGroup(elementToMerge[property])) {
            merged[property] = ElementPropertiesPanelComponent.mergeElements(
              [(merged[property] as UIElement), (elementToMerge[property] as UIElement)]
            );
          } else if (JSON.stringify(merged[property]) !== JSON.stringify(elementToMerge[property])) {
            // `id` keeps the first element's value; the ids of the whole selection are in `idList`.
            if (property !== 'id') merged[property] = null;
          }
        } else {
          delete merged[property];
        }
      });
    }
    return merged;
  }

  updateModel(property: string, value: UIElementValue, isInputValid: boolean | null = true): void {
    if (isInputValid) {
      this.elementService.updateElementsProperty(this.selectedElements, property, value);
    } else {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
    }
  }

  setElementInteractionEnabled(isEnabled: boolean): void {
    this.selectionService.selectedElementComponents.forEach(elementOverlay => {
      if (elementOverlay instanceof ElementOverlay) elementOverlay.setInteractionEnabled(isEnabled);
    });
  }

  deleteElement(): void {
    this.elementService.deleteElements(this.selectedElements);
  }

  duplicateElement(): void {
    this.elementService.duplicateSelectedElements();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CdkDragDrop } from '@angular/cdk/drag-drop/drag-events';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { UnitUIElement } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { SelectionService } from '../../../../selection.service';

@Component({
  selector: 'app-element-properties',
  template: `
    <ng-container *ngIf="selectedElements.length > 0">
      <mat-tab-group mat-stretch-tabs dynamicHeight>
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="example-tab-icon">build</mat-icon>
          </ng-template>
          <div fxLayout="column">
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('id')">
              <mat-label>ID</mat-label>
              <input matInput type="text" *ngIf="selectedElements.length === 1" [value]="combinedProperties.id"
                     (input)="updateModel('id', $any($event.target).value)">
              <input matInput type="text" disabled *ngIf="selectedElements.length > 1" [value]="'Muss eindeutig sein'">
            </mat-form-field>

            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('label')">
              <mat-label>Label</mat-label>
              <input matInput type="text" [value]="combinedProperties.label"
                     (input)="updateModel('label', $any($event.target).value)">
            </mat-form-field>

            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('text')">
              <mat-label>Text</mat-label>
              <textarea matInput type="text" cdkTextareaAutosize [value]="combinedProperties.text"
                        (input)="updateModel('text', $any($event.target).value)">
            </textarea>
            </mat-form-field>

            <mat-form-field *ngIf="combinedProperties.type === 'text-field'">
              <mat-label>Vorbelegung</mat-label>
              <input matInput type="text"
                     [value]="combinedProperties.value"
                     (input)="updateModel('value', $any($event.target).value)">
            </mat-form-field>
            <section *ngIf="combinedProperties.type === 'checkbox'">
              Vorbelegung
              <mat-button-toggle-group [value]="combinedProperties.value"
                                       (change)="updateModel('value', $event.value)">
                <mat-button-toggle [value]="true">wahr</mat-button-toggle>
                <mat-button-toggle [value]="false">falsch</mat-button-toggle>
              </mat-button-toggle-group>
            </section>
            <mat-form-field *ngIf="combinedProperties.type === 'dropdown' || combinedProperties.type === 'radio'"
                            appearance="fill">
              <mat-label>Vorbelegung</mat-label>
              <mat-select [value]="combinedProperties.value"
                          (selectionChange)="updateModel('value', $event.value)">
                <mat-option>undefiniert</mat-option>
                <mat-option *ngFor="let option of $any(combinedProperties).options" [value]="option">
                  {{option}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider></mat-divider>

            <mat-checkbox *ngIf="combinedProperties.hasOwnProperty('required')"
                          [checked]="$any(combinedProperties.required)"
                          (change)="updateModel('required', $event.checked)">
              Pflichtfeld
            </mat-checkbox>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('requiredWarnMessage')">
              <mat-label>Warnmeldung</mat-label>
              <input matInput type="text" [value]="combinedProperties.requiredWarnMessage"
                     (input)="updateModel('requiredWarnMessage', $any($event.target).value)">
            </mat-form-field>

            <mat-divider></mat-divider>


            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('minLength')">
              <mat-label>Minimalwert</mat-label>
              <input matInput type="number" [value]="combinedProperties.minLength"
                     (input)="updateModel('minLength', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('minLength')">
              <mat-label>MInimalwert Warnmeldung</mat-label>
              <input matInput type="text" [value]="combinedProperties.minLengthWarnMessage"
                     (input)="updateModel('minLengthWarnMessage', $any($event.target).value)">
            </mat-form-field>
            <mat-divider></mat-divider>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('maxLength')">
              <mat-label>Maximalwert</mat-label>
              <input matInput type="number" [value]="combinedProperties.maxLength"
                     (input)="updateModel('maxLength', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('maxLength')">
              <mat-label>Maximalwert Warnmeldung</mat-label>
              <input matInput type="text" [value]="combinedProperties.maxLengthWarnMessage"
                     (input)="updateModel('maxLengthWarnMessage', $any($event.target).value)">
            </mat-form-field>

            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('pattern')">
              <mat-label>Muster</mat-label>
              <input matInput type="number" [value]="combinedProperties.pattern"
                     (input)="updateModel('pattern', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('pattern')">
              <mat-label>Muster Warnmeldung</mat-label>
              <input matInput type="text" [value]="combinedProperties.patternWarnMessage"
                     (input)="updateModel('patternWarnMessage', $any($event.target).value)">
            </mat-form-field>

            <mat-form-field disabled="true" *ngIf="combinedProperties.hasOwnProperty('options')">
              <ng-container *ngIf="combinedProperties.options !== undefined">
                <mat-label>Optionen</mat-label>
                <div cdkDropList [cdkDropListData]="combinedProperties.options"
                     (cdkDropListDropped)="reorderOptions('options', $any($event))">
                  <div *ngFor="let option of $any(combinedProperties.options)" cdkDrag
                       class="list-items">
                    {{option}}
                    <button mat-icon-button color="warn"
                            (click)="removeOption('options', option)">
                        <mat-icon>clear</mat-icon>
                    </button>
                  </div>
                </div>
              </ng-container>
              <div class="newOptionElement" fxLayout="row" fxLayoutAlign="center center">
                <button mat-icon-button matPrefix
                        (click)="addOption('options', newOption.value); newOption.select()">
                  <mat-icon>add</mat-icon>
                </button>
                <input #newOption matInput type="text" placeholder="Optionstext">
              </div>
            </mat-form-field>

            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('alignment')">
              <mat-label>Ausrichtung</mat-label>
              <mat-select [value]="combinedProperties.alignment"
                          (selectionChange)="updateModel('alignment', $event.value)">
                <mat-option *ngFor="let option of ['row', 'column']" [value]="option">
                  {{option}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox *ngIf="combinedProperties.hasOwnProperty('resizeEnabled')"
                          [checked]="$any(combinedProperties.resizeEnabled)"
                          (change)="updateModel('resizeEnabled', $event.checked)">
              größenverstellbar
            </mat-checkbox>
          </div>
          <button mat-raised-button class="delete-element-button" (click)="deleteElement()">
            Element löschen
          </button>
          <button mat-raised-button class="duplicate-element-button" (click)="duplicateElement()">
            Element duplizieren
          </button>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="example-tab-icon">format_shapes</mat-icon>
          </ng-template>
          <div fxLayout="column">

            <ng-container *ngIf="!combinedProperties.dynamicPositioning; else elseBlock">
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('width')">
                <mat-label>Breite</mat-label>
                <input matInput type="number" [value]="combinedProperties.width"
                       (input)="updateModel('width', toNumber($any($event.target).value))">
              </mat-form-field>
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('height')">
                <mat-label>Hoehe</mat-label>
                <input matInput type="number" [value]="combinedProperties.height"
                       (input)="updateModel('height', toNumber($any($event.target).value))">
              </mat-form-field>
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('xPosition')">
                <mat-label>X Position</mat-label>
                <input matInput type="number" [value]="combinedProperties.xPosition"
                       (input)="updateModel('xPosition', toNumber($any($event.target).value))">
              </mat-form-field>
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('yPosition')">
                <mat-label>Y Position</mat-label>
                <input matInput type="number" [value]="combinedProperties.yPosition"
                       (input)="updateModel('yPosition', toNumber($any($event.target).value))">
              </mat-form-field>
            </ng-container>
            <ng-template #elseBlock>
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('width')">
                <mat-label>Mindestbreite</mat-label>
                <input matInput type="number" [value]="combinedProperties.width"
                       (input)="updateModel('width', toNumber($any($event.target).value))">
              </mat-form-field>
              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('height')">
                <mat-label>Mindesthoehe</mat-label>
                <input matInput type="number" [value]="combinedProperties.height"
                       (input)="updateModel('height', toNumber($any($event.target).value))">
              </mat-form-field>
              Grid-Spalte
              <div fxLayoutAlign="row">
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('gridColumnStart')">
                  <mat-label>Start</mat-label>
                  <input matInput type="number" [value]="combinedProperties.gridColumnStart"
                         (input)="updateModel('gridColumnStart', $any($event.target).value)">
                </mat-form-field>
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('gridColumnEnd')">
                  <mat-label>Ende</mat-label>
                  <input matInput type="number" [value]="combinedProperties.gridColumnEnd"
                         (input)="updateModel('gridColumnEnd', $any($event.target).value)">
                </mat-form-field>
              </div>
              Grid-Zeile
              <div fxLayoutAlign="row">
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('gridRowStart')">
                  <mat-label>Start</mat-label>
                  <input matInput type="number" [value]="combinedProperties.gridRowStart"
                         (input)="updateModel('gridRowStart', $any($event.target).value)">
                </mat-form-field>
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('gridRowEnd')">
                  <mat-label>Ende</mat-label>
                  <input matInput type="number" [value]="combinedProperties.gridRowEnd"
                         (input)="updateModel('gridRowEnd', $any($event.target).value)">
                </mat-form-field>
              </div>

              Abstand
              <div class="margin-properties" fxLayoutAlign="row">
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('marginLeft')">
                  <mat-label>links</mat-label>
                  <input matInput type="number" [value]="combinedProperties.marginLeft"
                         (input)="updateModel('marginLeft', $any($event.target).value)">
                </mat-form-field>
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('marginRight')">
                  <mat-label>rechts</mat-label>
                  <input matInput type="number" [value]="combinedProperties.marginRight"
                         (input)="updateModel('marginRight', $any($event.target).value)">
                </mat-form-field>
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('marginTop')">
                  <mat-label>oben</mat-label>
                  <input matInput type="number" [value]="combinedProperties.marginTop"
                         (input)="updateModel('marginTop', $any($event.target).value)">
                </mat-form-field>
                <mat-form-field *ngIf="combinedProperties.hasOwnProperty('marginBottom')">
                  <mat-label>unten</mat-label>
                  <input matInput type="number" [value]="combinedProperties.marginBottom"
                         (input)="updateModel('marginBottom', $any($event.target).value)">
                </mat-form-field>
              </div>

              <mat-form-field *ngIf="combinedProperties.hasOwnProperty('zIndex')">
                <mat-label>Z-Index</mat-label>
                <input matInput type="number" [value]="combinedProperties.zIndex"
                       (input)="updateModel('zIndex', $any($event.target).value)"
                       matTooltip="Priorität beim Stapeln von Elementen. Der höhere Index erscheint vorne.">
              </mat-form-field>
            </ng-template>
            <ng-container *ngIf="selectedElements.length > 1">
              Ausrichtung
              <div class="alignment-button-group" fxLayout="row" fxLayoutAlign="center center" >
                <button (click)="alignElements('left')">
                  <mat-icon>align_horizontal_left</mat-icon>
                </button>
                <button (click)="alignElements('right')">
                  <mat-icon>align_horizontal_right</mat-icon>
                </button>
                <button (click)="alignElements('top')">
                  <mat-icon>align_vertical_top</mat-icon>
                </button>
                <button (click)="alignElements('bottom')">
                  <mat-icon>align_vertical_bottom</mat-icon>
                </button>
              </div>
            </ng-container>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="example-tab-icon">palette</mat-icon>
          </ng-template>
          <div fxLayout="column">
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('backgroundColor')"
                            class="mdInput textsingleline">
              <mat-label>Hintergrundfarbe</mat-label>
              <input matInput type="text" [value]="combinedProperties.backgroundColor"
                     (input)="updateModel('backgroundColor', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('fontColor')"
                            class="mdInput textsingleline">
              <mat-label>Schriftfarbe</mat-label>
              <input matInput type="text" [value]="combinedProperties.fontColor"
                     (input)="updateModel('fontColor', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('font')"
                            class="mdInput textsingleline">
              <mat-label>Schriftart</mat-label>
              <input matInput type="text" [value]="combinedProperties.font"
                     (input)="updateModel('font', $any($event.target).value)">
            </mat-form-field>
            <mat-form-field *ngIf="combinedProperties.hasOwnProperty('fontSize')"
                            class="mdInput textsingleline">
              <mat-label>Schriftgröße</mat-label>
              <input matInput type="text" [value]="combinedProperties.fontSize"
                     (input)="updateModel('fontSize', $any($event.target).value)">
            </mat-form-field>

            <mat-checkbox *ngIf="combinedProperties.hasOwnProperty('bold')"
                          [checked]="$any(combinedProperties.bold)"
                          (change)="updateModel('bold', $event.checked)">
              Fett
            </mat-checkbox>
            <mat-checkbox *ngIf="combinedProperties.hasOwnProperty('italic')"
                          [checked]="$any(combinedProperties.italic)"
                          (change)="updateModel('italic', $event.checked)">
              Kursiv
            </mat-checkbox>
            <mat-checkbox *ngIf="combinedProperties.hasOwnProperty('underline')"
                          [checked]="$any(combinedProperties.underline)"
                          (change)="updateModel('underline', $event.checked)">
              Unterstrichen
            </mat-checkbox>
          </div>
        </mat-tab>
      </mat-tab-group>
    </ng-container>
    <ng-container *ngIf="selectedElements.length === 0">
      Kein Element ausgewählt
    </ng-container>
    `,
  styles: [
    '::ng-deep app-element-properties .margin-properties .mat-form-field-infix {width: 55px; margin: 0 5px}',
    '::ng-deep app-element-properties .mat-form-field-infix {width: 95px; margin: 0 5px}',
    '.list-items {padding: 5px 10px; border-bottom: solid 1px #ccc; cursor: move;' +
                  'display: flex;flex-direction: row; align-items: center; justify-content: space-between;}'
  ]
})
export class ElementPropertiesComponent implements OnInit, OnDestroy {
  selectedElements!: UnitUIElement[];
  combinedProperties: Record<string, string | number | boolean | string[] | undefined> = {};
  private ngUnsubscribe = new Subject<void>();

  constructor(private selectionService: SelectionService, public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.elementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.createCombinedProperties();
        }
      );
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (selectedElements: UnitUIElement[]) => {
          this.selectedElements = selectedElements;
          this.createCombinedProperties();
        }
      );
  }

  /* Create new object with properties of all selected elements. When values differ set prop to undefined. */
  createCombinedProperties(): void {
    if (this.selectedElements.length === 0) {
      this.combinedProperties = {};
    } else {
      this.combinedProperties = { ...this.selectedElements[0] };

      for (let i = 1; i < this.selectedElements.length; i++) {
        Object.keys(this.combinedProperties).forEach((property: keyof UnitUIElement) => {
          if (Object.prototype.hasOwnProperty.call(this.selectedElements[i], property)) {
            if (this.selectedElements[i][property] !== this.combinedProperties[property]) {
              this.combinedProperties[property] = undefined;
            }
          }
        });
      }
    }
  }

  updateModel(property: string, value: string | number | boolean | string[] | undefined): void {
    this.unitService.updateElementProperty(this.selectedElements, property, value);
  }

  toNumber = (value: string):number => Number(value);

  alignElements(direction: 'left' | 'right' | 'top' | 'bottom'): void {
    this.unitService.alignElements(this.selectionService.getSelectedElements(), direction);
  }

  deleteElement(): void {
    this.selectionService.selectedPageSection
      .pipe(take(1))
      .subscribe(selectedPageSection => {
        this.unitService.deleteElementsFromSection(this.selectedElements, selectedPageSection);
        this.selectionService.clearElementSelection();
      })
      .unsubscribe();
  }

  duplicateElement(): void {
    this.selectionService.selectedPageSection
      .pipe(take(1))
      .subscribe(selectedPageSection => {
        this.unitService.duplicateElementsInSection(this.selectedElements, selectedPageSection);
      })
      .unsubscribe();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addOption(property: string, value: string): void {
    (this.combinedProperties[property] as string[]).push(value);
    this.updateModel(property, this.combinedProperties[property]);
  }

  reorderOptions(property: string, event: CdkDragDrop<string[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.updateModel(property, event.container.data);
  }

  removeOption(property: string, option: string): void {
    const valueList: string[] = this.combinedProperties[property] as [];
    valueList.splice(valueList.indexOf(option), 1);
    this.updateModel(property, valueList);
  }
}

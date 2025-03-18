import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RichTextEditorComponent } from 'editor/src/app/text-editor/rich-text-editor.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray
} from '@angular/cdk/drag-drop';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';
import { Label } from 'common/interfaces';
import { FileService } from 'common/services/file.service';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { MatActionList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'aspect-editor-droplist-wizard-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    TranslateModule,
    MatButtonModule,
    RichTextEditorComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    FormsModule,
    MatRadioModule,
    NgIf,
    MatExpansionModule,
    MatCheckboxModule,
    MatToolbarModule,
    NgTemplateOutlet,
    CdkDrag,
    CdkDropList,
    NgForOf,
    MatInputModule,
    TextFieldModule,
    MatIconModule,
    MatActionList,
    MatListItem
  ],
  template: `
    <h2 mat-dialog-title>Assistent: Drag & Drop</h2>
    <div mat-dialog-content>
      @if (templateVariant == undefined) {
        <mat-action-list class="variant-choice">
          <button mat-list-item (click)="templateVariant = 'classic'">Zuordnung</button>
          <button mat-list-item (click)="templateVariant = '2pages'">Zuordnung (2-seitig)</button>
          <button mat-list-item (click)="templateVariant = 'sort'">Sortieren</button>
        </mat-action-list>
      }

      @if (templateVariant === 'classic') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>

        <ng-container *ngTemplateOutlet="startList"></ng-container>
        <mat-form-field [style.width.px]="300">
          <mat-label>ungefähre Länge der Elemente</mat-label>
          <mat-select [(ngModel)]="options.optionWidth">
            <mat-option *ngIf="options.targetLabelAlignment === 'column'"
                        [value]="'long'">lang (< 8 Wörter)
            </mat-option>
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>

        <ng-container *ngTemplateOutlet="targetList"></ng-container>
        <mat-form-field [style.width.px]="350">
          <mat-label>ungefähre Länge der Zielbeschriftungen</mat-label>
          <mat-select [(ngModel)]="options.targetWidth">
            <mat-option *ngIf="options.targetLabelAlignment === 'column'"
                        [value]="'long'">lang (< 8 Wörter)
            </mat-option>
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>

        <h3>Ausrichtung</h3>
        <mat-radio-group [(ngModel)]="options.targetLabelAlignment">
          <mat-radio-button [value]="'column'">Elementliste über Ziellisten</mat-radio-button>
          <mat-radio-button [value]="'row'">
            Elementliste neben Ziellisten (nur für kurze Elemente oder einseitige Aufgaben)
          </mat-radio-button>
        </mat-radio-group>
      } @else if (templateVariant == 'sort') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>

        <ng-container *ngTemplateOutlet="startList"></ng-container>
        <mat-form-field [style.width.px]="300">
          <mat-label>ungefähre Länge der Elemente</mat-label>
          <mat-select [(ngModel)]="options.optionWidth">
            <mat-option [value]="'medium'">mittel (< 5 Wörter)</mat-option>
            <mat-option [value]="'short'">kurz (< 3 Wörter)</mat-option>
            <mat-option [value]="'very-short'">sehr kurz (1 Wort/Zahl)</mat-option>
          </mat-select>
        </mat-form-field>

        <h3>Nummerierung</h3>
        <mat-checkbox [(ngModel)]="options.numbering">
          Nummerierung aktivieren
        </mat-checkbox>
      } @else if (templateVariant == '2pages') {
        <ng-container *ngTemplateOutlet="introText"></ng-container>

        <ng-container *ngTemplateOutlet="startList"></ng-container>

        <h3>Situierung</h3>
        <aspect-rich-text-editor [(content)]="options.text2" [placeholder]="'Hier steht die Situierung.'">
        </aspect-rich-text-editor>

        <ng-container *ngTemplateOutlet="targetList"></ng-container>

        @if (!options.targetUseImages && !options.srcUseImages) {
          <h4>Ausrichtung</h4>
          <mat-radio-group [(ngModel)]="options.labelsBelow">
            <mat-radio-button [value]="false">Zielbeschriftung oben</mat-radio-button>
            <mat-radio-button [value]="true">Zielbeschriftung unten</mat-radio-button>
          </mat-radio-group>
        }
        @if (!options.targetUseImages && options.srcUseImages) {
          <h4>Ausrichtung</h4>
          <mat-radio-group [(ngModel)]="options.targetListAlignment">
            <mat-radio-button [value]="'row'">zeilenweise</mat-radio-button>
            <mat-radio-button [value]="'grid'">Raster (2er-Reihen)</mat-radio-button>
          </mat-radio-group>
        }

        <h3>Quelle</h3>
        <aspect-rich-text-editor [(content)]="options.text3" [placeholder]="'Quelle'">
        </aspect-rich-text-editor>
      }

      <ng-template #introText>
        <h3>Frage/Instruktion</h3>
        <aspect-rich-text-editor [(content)]="options.text1" [placeholder]="'Hier steht die Fragestellung.'">
        </aspect-rich-text-editor>
      </ng-template>
      <ng-template #startList>
        <h3>Elementliste</h3>
        <aspect-rich-text-editor [(content)]="options.headingSourceList" [placeholder]="'Überschrift'"
                                 [showReducedControls]="true">
        </aspect-rich-text-editor>
        <h4>Elemente</h4>
        @if (templateVariant === '2pages') {
          <mat-checkbox [(ngModel)]="options.srcUseImages" class="image-checkbox">
            Bilder verwenden
          </mat-checkbox>
        }
        @if (templateVariant === '2pages' && options.srcUseImages) {
          <mat-radio-group [(ngModel)]="options.imageSize">
            <mat-label>Bildgröße</mat-label>
            <mat-radio-button [value]="'small'">150px x 150px</mat-radio-button>
            <mat-radio-button [value]="'medium'">200px x 200px</mat-radio-button>
          </mat-radio-group>
        }
        <ng-container
          *ngTemplateOutlet="elementInputs; context: { list: options.options, useImages: options.srcUseImages }">
        </ng-container>
      </ng-template>
      <ng-template #targetList>
        <h3>Ziel-Ablagen</h3>
        <aspect-rich-text-editor [(content)]="options.headingTargetLists" [placeholder]="'Überschrift'"
                                 [showReducedControls]="true">
        </aspect-rich-text-editor>
        <h4>Zielbeschriftungen</h4>
        @if (templateVariant === '2pages' && options.srcUseImages) {
          <mat-checkbox class="image-checkbox" [(ngModel)]="options.targetUseImages">Bilder</mat-checkbox>
        }
        <ng-container
          *ngTemplateOutlet="elementInputs; context: { list: options.targetLabels,
                                                       useImages: options.srcUseImages && options.targetUseImages }">
        </ng-container>
      </ng-template>

      <ng-template #elementInputs let-list="list" let-useImages="useImages">
        @if (templateVariant !== '2pages' || !useImages) {
          <mat-form-field appearance="outline">
            <textarea #newItem matInput cdkTextareaAutosize type="text"
                      (keydown.enter)="$event.stopPropagation(); $event.preventDefault();"
                      (keyup.enter)="list.push(newItem.value); newItem.select()"></textarea>
            <button mat-icon-button matSuffix color="primary"
                    [disabled]="newItem.value === ''"
                    (click)="list.push(newItem.value); newItem.select()">
              <mat-icon>add</mat-icon>
            </button>
          </mat-form-field>
        } @else {
          <button mat-stroked-button [style.margin-top.px]="10" [style.margin-bottom.px]="10"
                  (click)="imageUpload.click();">Bild hochladen</button>
          <input type="file" hidden accept="image/*" #imageUpload id="button-image-upload"
                 (change)="loadImage(list, imageUpload)">
        }
        <div class="drop-list" cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
          <div *ngFor="let item of list; let i = index" cdkDrag cdkDragLockAxis="y" class="drop-list-option">
            @if (useImages) {
              <img [src]="item" [style.object-fit]="'scale-down'" [style.height.px]="40">
            } @else {
              {{ item }}
            }
            <button mat-icon-button color="primary" (click)="editItem(list, i)">
              <mat-icon>build</mat-icon>
            </button>
            <button mat-icon-button color="primary" (click)="removeListItem(list, i)">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
        </div>
      </ng-template>
    </div>
    <div mat-dialog-actions>
      <button mat-button
              [disabled]="(templateVariant == 'classic' && (!options.optionWidth || !options.targetWidth)) ||
                          (templateVariant == 'sort' && !options.optionWidth)"
              [mat-dialog-close]="{ variant: templateVariant, options }">
        {{ 'confirm' | translate }}
      </button>
      <button mat-button mat-dialog-close>{{ 'cancel' | translate }}</button>
    </div>
  `,
  styleUrl: 'droplist.dialog.component.css'
})
export class DroplistWizardDialogComponent {
  templateVariant: 'classic' | '2pages' | 'sort' | undefined;
  options: ClassicTemplateOptions & SortTemplateOptions & TwoPageTemplateOptions;

  constructor(private dialogService: DialogService) {
    this.options = {
      targetLabelAlignment: 'column',
      text1: '',
      text2: '',
      text3: '',
      headingSourceList: '',
      options: [],
      optionWidth: 'short',
      headingTargetLists: '',
      targetWidth: 'short',
      targetLabels: [],
      numbering: false,
      imageSize: 'medium',
      labelsBelow: false,
      targetListAlignment: 'row',
      srcUseImages: false,
      targetUseImages: false
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async loadImage(list: string[], eventTarget: HTMLInputElement): Promise<void> {
    const imgSrc = await FileService.readFileAsText(eventTarget.files?.[0] as File, true);
    list.push(imgSrc);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.options.options, event.previousIndex, event.currentIndex);
  }

  editItem(list: string[], i: number) {
    this.dialogService.showLabelEditDialog({ text: list[i] })
      .subscribe((result: Label) => {
        if (result) {
          this.options.options[i] = result.text;
        }
      });
  }

  // eslint-disable-next-line class-methods-use-this
  removeListItem(list: string[], i: number) {
    list.splice(i, 1);
  }
}

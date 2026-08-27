import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClozeDocument } from 'common/models/elements/cloze';
import { LikertRowElement } from 'common/models/elements/likert-row';
import {
  SectionInsertDialogComponent
} from 'editor/src/app/components/dialogs/section-insert-dialog/section-insert-dialog.component';
import {
  LabelEditDialogComponent
} from 'editor/src/app/components/dialogs/label-edit-dialog/label-edit-dialog.component';
import {
  GeogebraAppDefinitionDialogComponent
} from 'editor/src/app/components/dialogs/geogebra-app-definition-dialog/geogebra-app-definition-dialog.component';
import {
  HotspotEditDialogComponent
} from 'editor/src/app/components/dialogs/hotspot-edit-dialog/hotspot-edit-dialog.component';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { Hotspot } from 'common/models/elements/hotspot-image';
import {
  StateVariablesDialogComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variables-dialog.component';
import { VisibilityRule } from 'common/models/visibility-rule';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';
import { StateVariable } from 'common/models/state-variable';
import { UnitDefErrorDialogComponent } from 'common/components/unit-def-error-dialog/unit-def-error-dialog.component';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import {
  SanitizationDialogComponent
} from 'editor/src/app/components/dialogs/sanitization-dialog/sanitization-dialog.component';
import {
  TooltipPropertiesDialogComponent
} from 'editor/src/app/components/dialogs/tooltip-properties-dialog/tooltip-properties-dialog.component';
import { UIElement } from 'common/models/elements/element';
import {
  TableEditDialogComponent, TableEditResult
} from 'editor/src/app/components/dialogs/table-edit-dialog/table-edit-dialog.component';
import { TableElement } from 'common/models/elements/table';
import { FileService, FileInformation } from 'common/services/file.service';
import { DragNDropValueObject, Label, TextImageLabel } from 'common/models/label-interfaces';
import { TooltipPosition } from 'common/models/ui-element-interfaces';
import { ImageOptions } from 'common/models/image-interfaces';

import {
  ImageResizeDialogComponent
} from 'editor/src/app/components/dialogs/image-resize-dialog/image-resize-dialog.component';
import {
  DeleteConfirmationDialogComponent
} from 'editor/src/app/components/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { TextEditDialogComponent } from 'editor/src/app/components/dialogs/text-edit-dialog/text-edit-dialog.component';
import {
  TextEditMultilineDialogComponent
} from 'editor/src/app/components/dialogs/text-edit-multiline-dialog/text-edit-multiline-dialog.component';
import {
  RichTextEditDialogComponent
} from 'editor/src/app/components/dialogs/rich-text-edit-dialog/rich-text-edit-dialog.component';
import {
  PlayerEditDialogComponent
} from 'editor/src/app/components/dialogs/player-edit-dialog/player-edit-dialog.component';
import {
  LikertRowEditDialogComponent
} from 'editor/src/app/components/dialogs/likert-row-edit-dialog/likert-row-edit-dialog.component';
import {
  DropListOptionEditDialogComponent
} from 'editor/src/app/components/dialogs/drop-list-option-edit-dialog/drop-list-option-edit-dialog.component';
import {
  DeleteReferenceDialogComponent
} from 'editor/src/app/components/dialogs/delete-reference-dialog/delete-reference-dialog.component';
import { EditorSection } from 'editor/src/app/models/editor-section';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showLabelEditDialog(label: Label): Observable<Label> {
    const dialogRef = this.dialog.open(LabelEditDialogComponent, {
      data: { label },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  /** The confirmation belongs to the unit the caller asked about, and the dialog outlives that unit as
     soon as the host loads another one -- so a replaced unit takes the dialog with it. Narrowing the
     result the way showSanitizationDialog does is left to the caller here: a cancelled delete still has
     its references to report, so this one has to tell that apart from a superseded delete rather than
     drop both. UnitService.prepareDelete does, on the unit it asked about (#1253). */
  showDeleteConfirmDialog(text: string, supersededBy: Observable<void>,
                          elementList?: UIElement[], refs?: ReferenceList[]): Observable<boolean> {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { text, elementList, refs }
    });
    supersededBy
      .pipe(takeUntil(dialogRef.afterClosed()))
      .subscribe(() => dialogRef.close(false));
    return dialogRef.afterClosed();
  }

  showUnitDefErrorDialog(text: string): void {
    this.dialog.open(UnitDefErrorDialogComponent, {
      data: { text },
      disableClose: true
    });
  }

  showDeleteReferenceDialog(refs: ReferenceList[]): Observable<boolean> {
    const dialogRef = this.dialog.open(DeleteReferenceDialogComponent, {
      data: { refs },
      autoFocus: 'button'
    });
    return dialogRef.afterClosed();
  }

  /** The dialog carries no close option and stays up until the user confirms it, so the load that
     opened it can be superseded while it is still on screen. It then describes a unit that is no
     longer loaded, and a second outdated unit would stack another dialog on top of it -- therefore a
     superseding load closes it. What the caller may act on is a confirmation of the load it asked
     about, and the returned stream is narrowed to exactly that. Ending it with the superseding load
     covers the click that still reaches the closing dialog; the value check covers every close that
     comes from somewhere other than the dialog's own button, which is the only one reporting true --
     the superseding close, and the result-less close MatDialog performs on its own dialogs when it is
     torn down (#1247). */
  showSanitizationDialog(supersededBy: Observable<void>): Observable<boolean> {
    const dialogRef = this.dialog.open<SanitizationDialogComponent, undefined, boolean>(
      SanitizationDialogComponent, { disableClose: true }
    );
    supersededBy
      .pipe(takeUntil(dialogRef.afterClosed()))
      .subscribe(() => dialogRef.close(false));
    return dialogRef.afterClosed()
      .pipe(takeUntil(supersededBy), filter(confirmed => confirmed === true));
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialogComponent, {
      data: { text },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showDropListOptionEditDialog(value: DragNDropValueObject): Observable<DragNDropValueObject> {
    const dialogRef = this.dialog.open(DropListOptionEditDialogComponent, {
      data: { value },
      height: '700px',
      // The rich text editor gives its text area a minimum width of 700px. Opened any narrower,
      // the dialog has a horizontal scrollbar even while empty and the right half of the toolbar
      // sits outside the visible area (#1347). 700px plus the content padding of 48px is already
      // 748, so 750 would leave two pixels and no room for the vertical scrollbar this dialog
      // always has. Material's default `maxWidth` of 80vw would take the 800 back below a 1000px
      // window, which is where the scrollbar came from in the first place.
      width: '800px',
      maxWidth: '95vw'
    });
    return dialogRef.afterClosed();
  }

  showMultilineTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditMultilineDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showRichTextEditDialog(text: string, defaultFontSize: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        content: text,
        defaultFontSize,
        clozeMode: false
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showClozeTextEditDialog(document: ClozeDocument, defaultFontSize: number): Observable<ClozeDocument | undefined> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        content: document,
        defaultFontSize,
        clozeMode: true
      },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(elementID: string, playerProps: PlayerProperties): Observable<PlayerProperties> {
    const dialogRef = this.dialog.open(PlayerEditDialogComponent, {
      data: { elementID, playerProps },
      height: '600px',
      width: '480px'
    });
    return dialogRef.afterClosed();
  }

  showLikertRowEditDialog(row: LikertRowElement, options: TextImageLabel[]): Observable<LikertRowElement> {
    const dialogRef = this.dialog.open(LikertRowEditDialogComponent, {
      data: { row, options },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showHotspotEditDialog(hotspot: Hotspot): Observable<Hotspot> {
    const dialogRef = this.dialog.open(HotspotEditDialogComponent, {
      data: { hotspot }
    });
    return dialogRef.afterClosed();
  }

  showSectionInsertDialog(isSelectedSectionEmpty: boolean):
  Observable<{ newSection: EditorSection, replaceSection: boolean }> {
    const dialogRef = this.dialog.open(SectionInsertDialogComponent, {
      data: { isSelectedSectionEmpty }
    });
    return dialogRef.afterClosed();
  }

  /** Undefined when the dialog is closed without a result -- the cancel button, ESC, a click on the
     backdrop. Declared, because both callers read a field of it and would throw instead of taking the
     cancellation for what it is (#1296). */
  showGeogebraAppDefinitionDialog(): Observable<FileInformation | undefined> {
    const dialogRef = this.dialog.open(GeogebraAppDefinitionDialogComponent, {
      data: { },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showTableEditDialog(table: TableElement): Observable<TableEditResult | undefined> {
    const dialogRef = this.dialog.open(TableEditDialogComponent, {
      data: { table },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showVisibilityRulesDialog(visibilityRules: VisibilityRule[],
                            logicalConnectiveOfRules: 'disjunction' | 'conjunction',
                            controlIds: { id: string, alias: string }[],
                            visibilityDelay: number,
                            animatedVisibility: boolean,
                            enableReHide: boolean
  ): Observable<{
      visibilityRules: VisibilityRule[],
      logicalConnectiveOfRules: 'disjunction' | 'conjunction',
      visibilityDelay: number,
      animatedVisibility: boolean,
      enableReHide: boolean
    }> {
    const dialogRef = this.dialog
      .open(VisibilityRulesDialogComponent, {
        data: {
          visibilityRules,
          logicalConnectiveOfRules,
          controlIds,
          visibilityDelay,
          animatedVisibility,
          enableReHide
        },
        autoFocus: false
      });
    return dialogRef.afterClosed();
  }

  showStateVariablesDialog(stateVariables: StateVariable[]): Observable<StateVariable[]> {
    const dialogRef = this.dialog.open(StateVariablesDialogComponent, {
      data: { stateVariables: stateVariables },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showTooltipDialog(
    tooltipText: string | undefined, tooltipPosition: TooltipPosition | undefined
  ): Observable<{ tooltipText: string, tooltipPosition: TooltipPosition, action: 'save' | 'delete' }> {
    const dialogRef = this.dialog.open(TooltipPropertiesDialogComponent, {
      data: { tooltipText, tooltipPosition },
      width: '750px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showImageResizeDialog(base64: string, options: ImageOptions): Observable<ImageOptions> {
    const dialogRef = this.dialog.open(ImageResizeDialogComponent, {
      data: { base64, options: { ...options } },
      width: '500px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  async importImage(): Promise<FileInformation | null> {
    const file = await FileService.getRawFile('image/*');
    const base64 = await FileService.readFileAsText(file, true);
    let content = base64;
    if (FileService.isResizable(file.type)) {
      const options = await firstValueFrom(this.showImageResizeDialog(base64, {}));
      if (options) {
        content = await FileService.scaleImage(base64, options);
      } else {
        return null;
      }
    }
    return { name: file.name, content };
  }
}

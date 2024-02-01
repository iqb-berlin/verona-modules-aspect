import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ClozeDocument } from 'common/models/elements/compound-elements/cloze/cloze';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';
import { Section } from 'common/models/section';
import { SectionInsertDialogComponent } from 'editor/src/app/components/dialogs/section-insert-dialog.component';
import { LabelEditDialogComponent } from 'editor/src/app/components/dialogs/label-edit-dialog.component';
import {
  GeogebraAppDefinitionDialogComponent
} from 'editor/src/app/components/dialogs/geogebra-app-definition-dialog.component';
import { HotspotEditDialogComponent } from 'editor/src/app/components/dialogs/hotspot-edit-dialog.component';
import { PlayerProperties } from 'common/models/elements/property-group-interfaces';
import { DragNDropValueObject, Label, TextImageLabel } from 'common/models/elements/label-interfaces';
import { Hotspot } from 'common/models/elements/input-elements/hotspot-image';
import {
  StateVariablesDialogComponent
} from 'editor/src/app/components/dialogs/state-variables-dialog/state-variables-dialog.component';
import { VisibilityRule } from 'common/models/visibility-rule';
import {
  VisibilityRulesDialogComponent
} from 'editor/src/app/components/dialogs/visibility-rules-dialog/visibility-rules-dialog.component';
import { StateVariable } from 'common/models/state-variable';
import { UnitDefErrorDialogComponent } from 'common/components/unit-def-error-dialog.component';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { SanitizationDialogComponent } from 'editor/src/app/components/dialogs/sanitization-dialog.component';
import {
  TooltipPropertiesDialogComponent
} from 'editor/src/app/components/dialogs/tooltip-properties-dialog.component';
import { TooltipPosition } from 'common/models/elements/element';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog.component';
import { TextEditDialogComponent } from '../components/dialogs/text-edit-dialog.component';
import { TextEditMultilineDialogComponent } from '../components/dialogs/text-edit-multiline-dialog.component';
import { RichTextEditDialogComponent } from '../components/dialogs/rich-text-edit-dialog.component';
import { PlayerEditDialogComponent } from '../components/dialogs/player-edit-dialog.component';
import { LikertRowEditDialogComponent } from '../components/dialogs/likert-row-edit-dialog.component';
import { DropListOptionEditDialogComponent } from '../components/dialogs/drop-list-option-edit-dialog.component';
import { DeleteReferenceDialogComponent } from '../components/dialogs/delete-reference-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  showLabelEditDialog(label: Label): Observable<Label> {
    const dialogRef = this.dialog.open(LabelEditDialogComponent, {
      data: { label }
    });
    return dialogRef.afterClosed();
  }

  showConfirmDialog(text: string, isWarning: boolean = false): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { text, isWarning }
    });
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

  showSanitizationDialog(): Observable<boolean> {
    const dialogRef = this.dialog.open(SanitizationDialogComponent,
      { disableClose: true });
    return dialogRef.afterClosed();
  }

  showTextEditDialog(text: string): Observable<string> {
    const dialogRef = this.dialog.open(TextEditDialogComponent, {
      data: { text }
    });
    return dialogRef.afterClosed();
  }

  showDropListOptionEditDialog(value: DragNDropValueObject): Observable<DragNDropValueObject> {
    const dialogRef = this.dialog.open(DropListOptionEditDialogComponent, {
      data: { value },
      height: '700px',
      width: '600px'
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
      height: '700px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showClozeTextEditDialog(document: ClozeDocument, defaultFontSize: number): Observable<string> {
    const dialogRef = this.dialog.open(RichTextEditDialogComponent, {
      data: {
        content: document,
        defaultFontSize,
        clozeMode: true
      },
      height: '795px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showPlayerEditDialog(elementID: string, playerProps: PlayerProperties): Observable<PlayerProperties> {
    const dialogRef = this.dialog.open(PlayerEditDialogComponent, {
      data: { elementID, playerProps },
      height: '600px'
    });
    return dialogRef.afterClosed();
  }

  showLikertRowEditDialog(row: LikertRowElement, options: TextImageLabel[]): Observable<LikertRowElement> {
    const dialogRef = this.dialog.open(LikertRowEditDialogComponent, {
      data: { row, options }
    });
    return dialogRef.afterClosed();
  }

  showHotspotEditDialog(hotspot: Hotspot): Observable<Hotspot> {
    const dialogRef = this.dialog.open(HotspotEditDialogComponent, {
      data: { hotspot }
    });
    return dialogRef.afterClosed();
  }

  showSectionInsertDialog(section: Section): Observable<Section> {
    const dialogRef = this.dialog.open(SectionInsertDialogComponent, {
      data: { section }
    });
    return dialogRef.afterClosed();
  }

  showGeogebraAppDefinitionDialog(): Observable<string> {
    const dialogRef = this.dialog.open(GeogebraAppDefinitionDialogComponent, {
      data: { },
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }

  showVisibilityRulesDialog(visibilityRules: VisibilityRule[],
                            logicalConnectiveOfRules: 'disjunction' | 'conjunction',
                            controlIds: string[],
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
      width: '500px',
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef
} from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import packageJSON from 'editor/../../package.json';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogActions,
    MatDialogContent
  ],
  templateUrl: './unexpected-error.component.html',
  styleUrls: ['./unexpected-error.component.scss']
})
export class UnexpectedErrorComponent {
  readonly dialogRef = inject(MatDialogRef<UnexpectedErrorComponent>);
  readonly data = inject<Error>(MAT_DIALOG_DATA);

  reportTitle: string;
  reportBody: string;

  constructor(private clipboard: Clipboard) {
    const editorVersion = packageJSON.config.editor_version;
    const userAgent = navigator.userAgent;
    this.reportTitle = `Generierte Fehlermeldung: ${this.data.message}`;
    this.reportBody = encodeURIComponent(`${this.reportTemplate(editorVersion, userAgent)}
      ${this.data.stack}`);
  }

  reportErrorViaGitHub(): void {
    const baseURL = 'https://github.com/iqb-berlin/verona-modules-aspect/issues/new?template=fehlermeldung.md';
    window.open(`${baseURL}&title=${this.reportTitle}&body=${this.reportBody}`, '_blank');
  }

  reportErrorViaEmail() {
    window.location.href = `mailto:?subject=${this.reportTitle}&body=${this.reportBody}`;
  }

  copyDetailsToClipboard(): void {
    this.clipboard.copy(JSON.stringify(this.data.message + this.data.stack));
  }

  // eslint-disable-next-line class-methods-use-this
  reportTemplate = (version: string, userAgent: string) => `**Fehlerbeschreibung**
  Klare und kurze Beschreibung des Problems

  **Nachstellen**
  Schritte zum Nachstellen des Verhaltens:
  1. Lege Element '...' an
  2. Stelle Eigenschaft '....' auf Wert '...' ein
  3. Öffne Vorschau
  4. Fehlermeldung erscheint

  **Screenshots, Links**
  - Bei Links auf Aufgaben im Studio bitte darauf achten, dass diese für uns sichtbar sind.
  - Außerdem wäre es gut, wenn die Aufgaben sich auf das Darstellen des Problems beschränken und nicht voll mit anderen Dingen sind und wir erst die Stelle suchen müssen, die Probleme macht.

  **Versionen (automatisch generiert)**
  - Editorversion: ${version}
  - Browser- und Betriebssystem: ${userAgent}

  **Fehlermeldung (automatisch generiert)**`;
}

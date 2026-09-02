import { Inject, Injectable, DOCUMENT } from '@angular/core';

import { VopMetaData } from 'player/modules/verona/models/verona';

/**
 * The player's own Verona metadata, read once from the `meta_data` script block in its HTML file, plus
 * where the player looks for the files a unit refers to.
 */
@Injectable({
  providedIn: 'root'
})
export class MetaDataService {
  /** Read in the constructor; stays undefined if the document carries no such block. */
  playerMetadata!: VopMetaData;
  /** What the host offered as `directDownloadUrl` in the player config, if it offered one. */
  resourceURL: string | undefined;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const playerMetadata: string | null | undefined = document.getElementById('meta_data')?.textContent;
    if (playerMetadata) {
      this.playerMetadata = JSON.parse(playerMetadata);
    }
  }

  /** Where to load a unit's files from: what the host named, or the player's own `assets` folder. */
  getResourceURL(): string {
    return this.resourceURL || 'assets';
  }
}

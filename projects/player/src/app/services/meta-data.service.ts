import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MetaDataService {
  playerMetadata!: any;

  constructor(@Inject(DOCUMENT) private document: Document) {
    const playerMetadata: string | null | undefined = document.getElementById('meta_data')?.textContent;
    if (playerMetadata) {
      this.playerMetadata = JSON.parse(playerMetadata);
    }
  }
}

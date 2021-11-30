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

  // eslint-disable-next-line class-methods-use-this
  verifyUnitDefinitionVersion(unitDefinition: string | undefined): boolean {
    return true;
    // return (!!unitDefinition && unitDefinition === this.playerMetadata.supportedUnitDefinitionTypes);
  }

  // eslint-disable-next-line class-methods-use-this
  verifyUnitStateDataType(unitStateDataType: string | undefined): boolean {
    return true;
    // return (!!unitStateDataType && unitStateDataType === this.playerMetadata.supportedUnitStateDataTypes);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';

@Pipe({
  name: 'getValidAudioVideoAliasAndIDs',
  standalone: false
})
export class GetValidAudioVideoAliasAndIDsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(ignoreID: string): { id: string, alias: string }[] {
    const allAudioVideoAliasAndIDs = [
      ...this.unitService.unit.getAllElements('audio').map(audio => ({ id: audio.id, alias: audio.alias })),
      ...this.unitService.unit.getAllElements('video').map(video => ({ id: video.id, alias: video.alias }))];
    return allAudioVideoAliasAndIDs.filter(element => element.id !== ignoreID);
  }
}

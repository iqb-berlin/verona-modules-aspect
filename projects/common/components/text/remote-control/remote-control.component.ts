import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { RemoteControlElement } from 'common/models/elements/text/remote-control';
import { SharedModule } from 'common/shared.module';
import { RemoteMarkingData } from 'common/models/marking-data';

@Component({
  selector: 'aspect-remote-control',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <aspect-text-marking-bar [elementModel]="elementModel"
                             [selectedColor]="selectedColor || 'none'"
                             (markingDataChanged)="remoteMarkingDataChanged
                                                   .emit({ id: elementModel.id, markingData: $event })">
    </aspect-text-marking-bar>
    <div>{{selectedColor}}</div>
  `,
  styles: []
})
export class RemoteControlComponent extends ElementComponent {
  @Input() elementModel!: RemoteControlElement;
  @Input() selectedColor!: string | undefined;
  @Output() remoteMarkingDataChanged: EventEmitter<RemoteMarkingData> = new EventEmitter<RemoteMarkingData>();
  protected readonly setTimeout = setTimeout;
}

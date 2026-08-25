import { Component, Input } from '@angular/core';
import { HotspotImageElement } from 'common/models/elements/hotspot-image';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-hotspot-image',
  templateUrl: './hotspot-image.component.html',
  styleUrls: ['./hotspot-image.component.scss'],
  standalone: false
})
export class HotspotImageComponent extends FormElementComponent {
  @Input() elementModel!: HotspotImageElement;

  setHotspotValue(index: number): void {
    const actualValue = this.elementFormControl.value;
    actualValue[index].value = !actualValue[index].value;
    this.elementFormControl.setValue(actualValue);
  }
}

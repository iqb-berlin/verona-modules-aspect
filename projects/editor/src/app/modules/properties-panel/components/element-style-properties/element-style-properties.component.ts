import { Component, Input } from '@angular/core';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-element-style-properties',
  templateUrl: './element-style-properties.component.html',
  standalone: false
})
export class ElementStylePropertiesComponent {
  @Input() styles!: Merged<Stylings> | undefined;

  constructor(public elementService: ElementService) { }
}

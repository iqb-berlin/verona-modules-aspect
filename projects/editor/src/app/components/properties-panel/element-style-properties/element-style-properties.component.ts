import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';

@Component({
  selector: 'aspect-element-style-properties',
  templateUrl: './element-style-properties.component.html',
  standalone: false
})
export class ElementStylePropertiesComponent {
  @Input() styles!: Stylings | undefined;

  constructor(public elementService: ElementService) { }
}

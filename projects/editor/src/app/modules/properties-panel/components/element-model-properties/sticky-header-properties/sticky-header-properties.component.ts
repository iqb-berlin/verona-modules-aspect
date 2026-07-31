import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import { StickyHeaderProperties } from 'common/models/ui-element-interfaces';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';
import { UnitService } from 'editor/src/app/services/unit.service';

/**
 * The panel's view of a pinnable header.
 *
 * `type` and `headerEnabled` are read alongside `stickyHeader` itself: the control is offered for
 * likert and table, but for a likert only in expert mode, and for a table only enabled while the
 * header is on. Naming that here is what turns the former `$any(combinedProperties).headerEnabled`
 * into a checked read.
 */
export type PanelStickyHeaderProperties =
  StickyHeaderProperties & Pick<TableProperties, 'type' | 'headerEnabled'>;

@Component({
  selector: 'aspect-sticky-header-properties',
  templateUrl: './sticky-header-properties.component.html',
  styleUrls: ['./sticky-header-properties.component.scss'],
  standalone: false
})
export class StickyHeaderPropertiesComponent {
  @Input() combinedProperties!: Merged<PanelStickyHeaderProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: keyof StickyHeaderProperties; value: boolean }>();

  constructor(public unitService: UnitService) { }
}

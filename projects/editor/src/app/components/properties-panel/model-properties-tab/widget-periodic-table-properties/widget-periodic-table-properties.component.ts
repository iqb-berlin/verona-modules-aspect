import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UIElement } from 'common/models/elements/element';

@Component({
  selector: 'aspect-widget-periodic-table-properties',
  imports: [
    MatCheckboxModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './widget-periodic-table-properties.component.html'
})
export class WidgetPeriodicTablePropertiesComponent {
  @Input() combinedProperties!: UIElement;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: string | number | boolean | null }>();
}

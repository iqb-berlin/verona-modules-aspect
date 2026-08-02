import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Stylings } from 'common/models/elements/property-group-interfaces';
import { ElementService } from 'editor/src/app/services/element.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { Merged } from 'editor/src/app/modules/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-element-style-properties',
  templateUrl: './element-style-properties.component.html',
  standalone: false
})
export class ElementStylePropertiesComponent {
  @Input() styles!: Merged<Stylings> | undefined;

  constructor(public elementService: ElementService,
              private messageService: MessageService,
              private translateService: TranslateService) { }

  /**
   * What `aspectNumberField` worked out for one of the four number boxes here.
   *
   * Like the dimension field set, this tab writes into the `ElementService` from its own template,
   * so the host's guard never covered it: an emptied box sent `null` into properties declared
   * `number`, and the `(change)` handler that patched the display back to 0 wrote into `styles` -
   * with one element selected that is the element's own object, so it went past the service
   * entirely (#1161).
   */
  commitStyle(property: keyof Stylings,
              update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.elementService.updateSelectedElementsStyleProperty(property, update.value);
  }
}

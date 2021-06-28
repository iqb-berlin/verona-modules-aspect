import {
  Component, Input
} from '@angular/core';
import { UnitPageSection } from '../../../common/unit';

@Component({
  selector: 'app-section',
  template: `
    SECTIOn
    `
})
export class SectionComponent {
  @Input() section!: UnitPageSection;
}

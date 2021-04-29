import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UnitService } from '../../unit.service';
import { UnitUIElement } from '../../model/unit';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styles: [
    ':host {background-color: #F9FBFB; border: 1px solid black; text-align: center; padding: 0 15px}',
    ':host {}'
  ]
})
export class PropertiesComponent implements OnDestroy{
  private elementSelectedSubscription: Subscription;

  selectedElement: UnitUIElement | undefined;

  constructor(public unitService: UnitService) {
    this.elementSelectedSubscription = this.unitService.elementSelected.subscribe((element: UnitUIElement) => {
      this.selectedElement = element;
    });
  }

  ngOnDestroy(): void {
    this.elementSelectedSubscription.unsubscribe();
  }
}

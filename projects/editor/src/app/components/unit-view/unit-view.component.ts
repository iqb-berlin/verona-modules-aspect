import { Component } from '@angular/core';
import { PageChangeService } from 'common/services/page-change.service';
import { UnitService } from '../../services/unit.service';
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: 'aspect-unit-view',
  templateUrl: './unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  pagesLoaded = true;

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public pageChangeService: PageChangeService,
              private dialogService: DialogService,
              private messageService: MessageService) { }

  selectPage(newIndex: number): void {
    this.selectionService.selectPage(newIndex);
  }

  addPage(): void {
    this.unitService.addPage();
  }
}

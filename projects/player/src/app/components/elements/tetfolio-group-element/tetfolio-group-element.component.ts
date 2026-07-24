import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { TetfolioElement } from 'common/models/elements/tetfolio/tetfolio';
import { TetfolioComponent } from 'common/components/tetfolio/tetfolio.component';
import { ValueChangeElement } from 'common/interfaces';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import {
  ElementModelElementCodeMappingService
} from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-tetfolio-group-element',
  templateUrl: './tetfolio-group-element.component.html',
  styleUrls: ['./tetfolio-group-element.component.scss'],
  standalone: false
})
export class TetfolioGroupElementComponent
  extends ElementGroupDirective implements OnInit, AfterViewInit {
  @ViewChild('elementComponent') elementComponent!: TetfolioComponent;
  TetfolioElement!: TetfolioElement;
  savedState: string | null = null;

  constructor(public unitStateService: UnitStateService,
              private elementModelElementCodeMappingService: ElementModelElementCodeMappingService) {
    super();
  }

  ngOnInit(): void {
    this.savedState = this.elementModelElementCodeMappingService.mapToElementModelValue(
      this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
    ) as string | null;
    (this.elementModel as TetfolioElement).state = this.savedState;
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      ElementModelElementCodeMappingService.mapToElementCodeValue(
        this.savedState,
        this.elementModel.type
      ),
      this.elementComponent,
      this.pageIndex);
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    (this.elementModel as TetfolioElement).state = value.value as string | null;
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }
}

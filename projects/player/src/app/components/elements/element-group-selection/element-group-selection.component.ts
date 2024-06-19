import { Component, Input, OnInit } from '@angular/core';
import { UIElement, UIElementType } from 'common/models/elements/element';
import { ElementGroupInterface, ElementGroupName } from '../../../models/element-group.interface';

@Component({
  selector: 'aspect-element-group-selection',
  templateUrl: './element-group-selection.component.html',
  styleUrls: ['./element-group-selection.component.scss']
})
export class ElementGroupSelectionComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  groups: ElementGroupInterface[] = [
    { name: 'textInputGroup', types: ['text-field', 'text-area', 'spell-correct'] },
    { name: 'mediaPlayerGroup', types: ['audio', 'video'] },
    {
      name: 'inputGroup',
      types: [
        'checkbox', 'slider', 'drop-list', 'radio', 'radio-group-images',
        'dropdown', 'hotspot-image', 'math-field', 'text-area-math'
      ]
    },
    { name: 'compoundGroup', types: ['cloze', 'likert', 'table'] },
    { name: 'textGroup', types: ['text'] },
    { name: 'interactiveGroup', types: ['button', 'image', 'math-table', 'trigger'] },
    { name: 'externalAppGroup', types: ['geometry'] }
  ];

  selectedGroup!: ElementGroupName | undefined;

  ngOnInit(): void {
    this.selectedGroup = this.selectGroup(this.elementModel.type);
  }

  private selectGroup(type: UIElementType): ElementGroupName {
    return this.groups.find(group => group.types.includes(type))?.name as ElementGroupName;
  }
}

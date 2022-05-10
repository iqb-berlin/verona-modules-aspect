import { Component, Input, OnInit } from '@angular/core';
import { ElementGroup, ElementGroupName } from '../../models/element-group';
import { UIElement } from 'common/classes/element';
import { UIElementType } from 'common/interfaces/elements';

@Component({
  selector: 'aspect-element-group-selection',
  templateUrl: './element-group-selection.component.html',
  styleUrls: ['./element-group-selection.component.scss']
})
export class ElementGroupSelectionComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  groups: ElementGroup[] = [
    { name: 'textInputGroup', types: ['text-field', 'text-area', 'spell-correct'] },
    { name: 'mediaPlayerGroup', types: ['audio', 'video'] },
    {
      name: 'inputGroup',
      types: ['checkbox', 'slider', 'drop-list', 'radio', 'radio-group-images', 'dropdown']
    },
    { name: 'compoundGroup', types: ['cloze', 'likert'] },
    { name: 'textGroup', types: ['text'] },
    { name: 'interactiveGroup', types: ['button', 'image'] }
  ];

  selectedGroup!: ElementGroupName;

  ngOnInit(): void {
    this.selectedGroup = this.selectGroup(this.elementModel.type);
  }

  selectGroup(type: UIElementType): ElementGroupName {
    return this.groups.find(group => group.types.includes(type))?.name as ElementGroupName;
  }
}

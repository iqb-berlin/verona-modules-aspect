import { Component, Input, OnInit } from '@angular/core';
import {
  UIElement, UIElementType
} from '../../../../../common/interfaces/elements';
import { ElementGroup, ElementGroupName } from '../../models/element-group';

@Component({
  selector: 'aspect-element-splitter',
  templateUrl: './element-splitter.component.html',
  styleUrls: ['./element-splitter.component.scss']
})
export class ElementSplitterComponent implements OnInit {
  @Input() elementModel!: UIElement;
  @Input() pageIndex!: number;

  groups: ElementGroup[] = [
    { name: 'textInputGroup', types: ['text-field', 'text-area'] },
    { name: 'mediaPlayerGroup', types: ['audio', 'video'] },
    {
      name: 'inputGroup',
      types: ['checkbox', 'spell-correct', 'slider', 'drop-list', 'radio', 'radio-group-images', 'dropdown']
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

import { Component, Input, OnInit } from '@angular/core';
import { UIElement, UIElementType } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-splitter',
  templateUrl: './element-splitter.component.html',
  styleUrls: ['./element-splitter.component.scss']
})
export class ElementSplitterComponent implements OnInit {
  @Input() elementModel!: UIElement;

  textInputGroup!: boolean;
  mediaPlayerGroup!: boolean;
  inputGroup!: boolean;
  indexInputGroup!: boolean;
  compoundGroup!: boolean;
  textGroup!: boolean;
  baseGroup!: boolean;

  constructor() {
  }

  ngOnInit(): void {
    this.initGroup(this.elementModel.type);
  }

  getInstance<T>(obj: any, keys: (keyof T)[]): obj is T {
    if (!obj) {
      return false;
    }
    const implementKeys = keys.reduce((impl, key) => impl && key in obj, true);

    return implementKeys;
  }

  initGroup(type: UIElementType): void {
    // export type UIElementType = 'text' | 'button' | 'text-field' | 'text-area' | 'checkbox'
    //   | 'dropdown' | 'radio' | 'image' | 'audio' | 'video' | 'likert' | 'likert-row' | 'radio-group-images'
    //   | 'drop-list' | 'cloze' | 'spell-correct' | 'slider' | 'frame' | 'toggle-button';
    //
    this.textInputGroup = ['text-field', 'text-area'].includes(type);
    this.mediaPlayerGroup = ['audio', 'video'].includes(type);
    this.inputGroup = ['checkbox', 'spell-correct', 'slider', 'drop-list'].includes(type);
    this.indexInputGroup = ['radio', 'radio-group-images', 'toggle-button', 'dropdown'].includes(type);
    this.compoundGroup = ['cloze', 'likert'].includes(type);
    this.textGroup = ['text'].includes(type);
    this.baseGroup = ['button', 'image', 'frame'].includes(type);
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ClozeElement, LikertElement, UIElement } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-compound-group',
  templateUrl: './element-compound-group.component.html',
  styleUrls: ['./element-compound-group.component.scss']
})
export class ElementCompoundGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;
  ClozeElement!: ClozeElement;
  LikertElement!: LikertElement;

  form!: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({});
  }

}

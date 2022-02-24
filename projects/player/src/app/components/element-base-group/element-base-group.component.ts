import { Component, Input, OnInit } from '@angular/core';
import {
  ButtonElement, FrameElement, ImageElement, UIElement
} from '../../../../../common/interfaces/elements';
import { VeronaPostService } from '../../services/verona-post.service';

@Component({
  selector: 'aspect-element-base-group',
  templateUrl: './element-base-group.component.html',
  styleUrls: ['./element-base-group.component.scss']
})
export class ElementBaseGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;
  ButtonElement!: ButtonElement;
  FrameElement!: FrameElement;
  ImageElement!: ImageElement;

  constructor(public veronaPostService: VeronaPostService) { }

  ngOnInit(): void {
  }
}

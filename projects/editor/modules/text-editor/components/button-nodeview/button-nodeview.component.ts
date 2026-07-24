import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-button',
  templateUrl: './button-nodeview.component.html',
  styleUrls: ['./button-nodeview.component.scss'],
  standalone: false
})
export class ButtonNodeviewComponent extends AngularNodeViewComponent { }

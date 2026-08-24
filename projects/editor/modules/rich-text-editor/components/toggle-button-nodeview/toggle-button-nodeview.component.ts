import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-toggle-button',
  templateUrl: './toggle-button-nodeview.component.html',
  styleUrls: ['./toggle-button-nodeview.component.scss'],
  standalone: false
})
export class ToggleButtonNodeviewComponent extends AngularNodeViewComponent { }

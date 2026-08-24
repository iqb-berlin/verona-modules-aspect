import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-checkbox',
  templateUrl: './checkbox-nodeview.component.html',
  styleUrls: ['./checkbox-nodeview.component.scss'],
  standalone: false
})
export class CheckboxNodeviewComponent extends AngularNodeViewComponent { }

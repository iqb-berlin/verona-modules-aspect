import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-text-field',
  templateUrl: './text-field-nodeview.component.html',
  styleUrls: ['./text-field-nodeview.component.scss'],
  standalone: false
})
export class TextFieldNodeviewComponent extends AngularNodeViewComponent {
}

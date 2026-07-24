import { Component } from '@angular/core';
import { AngularNodeViewComponent } from 'ngx-tiptap';

@Component({
  selector: 'aspect-nodeview-drop-list',
  templateUrl: './drop-list-nodeview.component.html',
  standalone: false
})
export class DropListNodeviewComponent extends AngularNodeViewComponent {}

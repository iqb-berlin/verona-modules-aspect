import { Component, Input } from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'aspect-element-list',
  imports: [
    NgForOf,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './element-list.component.html',
  styleUrls: ['./element-list.component.scss']
})
export class ElementListComponent {
  @Input() elements!: UIElement[];
}

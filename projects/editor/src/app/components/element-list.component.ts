import { Component, Input } from '@angular/core';
import { ReferenceList } from 'editor/src/app/services/reference-manager';
import { UIElement } from 'common/models/elements/element';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'aspect-element-list',
  standalone: true,
  imports: [
    NgForOf,
    MatIconModule,
    MatListModule
  ],
  template: `
    <mat-list>
      <mat-list-item *ngFor="let element of elements">
        <mat-icon matListItemIcon>
          {{ $any(element.constructor).icon }}
        </mat-icon>
        <div matListItemTitle>
          {{ $any(element.constructor).title }}: <i>{{ element.id }}</i>
        </div>
      </mat-list-item>
    </mat-list>
  `,
  styles: [

  ]
})
export class ElementListComponent {
  @Input() elements!: UIElement[];
}

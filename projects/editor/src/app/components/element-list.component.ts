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
    template: `
    <mat-list>
      <mat-list-item *ngFor="let element of elements">
        <mat-icon matListItemIcon>
          {{ $any(element.constructor).icon }}
        </mat-icon>
        <div matListItemTitle>
          {{ $any(element.constructor).title }}: <i>{{ element.alias }}</i>
        </div>
      </mat-list-item>
    </mat-list>
  `,
    styles: [
        'mat-icon {color: inherit !important;}',
        '.mat-mdc-list-item-title {color: inherit !important;}'
    ]
})
export class ElementListComponent {
  @Input() elements!: UIElement[];
}

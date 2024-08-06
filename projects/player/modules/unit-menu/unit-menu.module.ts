import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'common/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UnitMenuComponent } from './components/unit-menu/unit-menu.component';

@NgModule({
  declarations: [
    UnitMenuComponent
  ],
  exports: [
    UnitMenuComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    SharedModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class UnitMenuModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'common/shared.module';
import { OptionListPanelComponent } from './components/option-list-panel/option-list-panel.component';
import { SizeInputPanelComponent } from './components/size-input-panel/size-input-panel.component';

/**
 * Leaf controls of the editor that more than one feature area needs.
 *
 * Both components below are used by the properties panel and from outside it, so neither can be
 * declared by one of those without making it a dependency of the other. Add a component here only
 * when a second place actually needs it — this is not a dumping ground for shared-looking things.
 */
@NgModule({
  declarations: [
    OptionListPanelComponent,
    SizeInputPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
    SharedModule
  ],
  exports: [
    OptionListPanelComponent,
    SizeInputPanelComponent
  ]
})
export class EditorSharedModule { }

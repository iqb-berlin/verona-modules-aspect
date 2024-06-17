import {
  ChangeDetectorRef, Component, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { CheckboxComponent } from 'common/components/input-elements/checkbox.component';

@Component({
  selector: 'aspect-table-child-overlay',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="wrapper"
         [style.border]="isSelected ? 'purple solid 1px' : ''"
         (click)="elementSelected.emit(this); $event.stopPropagation();">
      <ng-template #elementContainer></ng-template>
    </div>
  `,
  styles: `
    .wrapper {display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;}
    button {position: absolute; opacity: 0;}
    button:hover {opacity: 1;}
  `
})
export class TableChildOverlay implements OnInit {
  @Input() element!: UIElement;
  @Output() elementSelected = new EventEmitter<TableChildOverlay>();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  childComponent!: ComponentRef<ElementComponent>;

  isSelected: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.childComponent = this.elementContainer.createComponent(this.element.getElementComponent());
    this.childComponent.instance.elementModel = this.element;

    this.childComponent.changeDetectorRef.detectChanges(); // this fires onInit, which initializes the FormControl

    if (this.childComponent.instance instanceof TextFieldComponent ||
        this.childComponent.instance instanceof CheckboxComponent) {
      this.childComponent.instance.tableMode = true;
    }
    // this.childComponent.location.nativeElement.style.pointerEvents = 'none';
    if (this.element.type !== 'text') {
      this.childComponent.location.nativeElement.style.width = '100%';
      this.childComponent.location.nativeElement.style.height = '100%';
    }
    if (this.element.type === 'text') {
      this.childComponent.location.nativeElement.style.margin = '5px';
    }
    if (this.element.type === 'drop-list') {
      this.childComponent.setInput('clozeContext', true);
    }
  }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    this.cdr.detectChanges();
  }
}
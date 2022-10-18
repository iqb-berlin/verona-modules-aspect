import {
  AfterContentChecked,
  Directive, ElementRef, Renderer2
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UIElement } from 'common/models/elements/element';
import { ExternalResourceService } from 'common/services/external-resource.service';

@Directive()
export abstract class ElementComponent implements AfterContentChecked {
  abstract elementModel: UIElement;
  project!: 'player' | 'editor';

  constructor(public elementRef: ElementRef) {}

  get domElement(): Element {
    return this.elementRef.nativeElement;
  }

  ngAfterContentChecked(): void {
    this.project = this.elementRef.nativeElement.closest('aspect-element-group-selection') ? 'player' : 'editor';
  }
}

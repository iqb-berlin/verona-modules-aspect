import {
  Directive, ElementRef, Input, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: '[appScrollIndex]'
})
export class ScrollIndexDirective implements OnInit {
  @Input() selectIndex!: Subject<number>;
  @Input() index!: number;
  @Input() pagesContainer!: HTMLElement;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.selectIndex.subscribe((selectedIndex: number): void => {
      if (selectedIndex === this.index) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

import {
  AfterViewInit,
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NativeEventService } from '../services/native-event.service';

@Directive({
  selector: '[aspectHideFirstChild]'
})
export class HideFirstChildDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() hideFirstChild!: boolean;
  @Output() childHeight = new EventEmitter<number>();

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private nativeEventService: NativeEventService
  ) {}

  ngOnInit(): void {
    if (this.elementRef.nativeElement.firstChild) {
      if (this.hideFirstChild) {
        // default usage: hide element!
        this.elementRef.nativeElement.firstChild.style.display = 'none';
      } else {
        // otherwise: send its height to handle it
        this.nativeEventService.resize
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => this.emitHeight());
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement.firstChild && !this.hideFirstChild) {
      this.emitHeight();
    }
  }

  private emitHeight(): void {
    this.childHeight.emit(this.elementRef.nativeElement.firstChild.offsetHeight);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

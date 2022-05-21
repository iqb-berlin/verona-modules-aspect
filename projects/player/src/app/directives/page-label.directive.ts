import {
  AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NativeEventService } from '../services/native-event.service';

@Directive({
  selector: '[aspectPageLabel]'
})
export class PageLabelDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() isHidden!: boolean;
  @Output() heightChanged = new EventEmitter<number>();

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private nativeEventService: NativeEventService
  ) {}

  ngOnInit(): void {
    if (this.elementRef.nativeElement.firstChild) {
      if (this.isHidden) {
        this.elementRef.nativeElement.firstChild.style.display = 'none';
      }
      this.nativeEventService.resize
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.sendHeight());
    }
  }

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement.firstChild) {
      this.sendHeight();
    }
  }

  private sendHeight(): void {
    const height = this.isHidden ? 0 : this.elementRef.nativeElement.firstChild.offsetHeight;
    this.heightChanged.emit(height);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

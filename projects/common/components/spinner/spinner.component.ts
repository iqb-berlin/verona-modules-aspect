import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'aspect-spinner',
  template: `
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  `,
  styles: ['mat-spinner {margin: auto; position: relative; z-index: 100; top: -50%;}']
})
export class SpinnerComponent implements OnInit, OnDestroy {
  @Input() isLoaded!: BehaviorSubject<boolean>;
  @Input() timeOutDuration: number = 20000;
  @Output() timeOut: EventEmitter<number> = new EventEmitter<number>();

  isLoading: boolean = true;
  private ngUnsubscribe = new Subject<void>();
  private timeOutId: number = 0;

  constructor(private changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoaded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isLoaded => {
        if (this.timeOutId) clearTimeout(this.timeOutId);
        if (!isLoaded) this.timeOutId = window.setTimeout(() => this.sendTimeOut(), this.timeOutDuration);
        this.isLoading = !isLoaded;
        this.changeDetectionRef.detectChanges();
      });
  }

  clearTimeOut(): void {
    clearTimeout(this.timeOutId);
    this.timeOutId = 0;
  }

  sendTimeOut(): void {
    if (!this.isLoaded.value) {
      this.timeOut.emit(this.timeOutDuration);
    }
    this.clearTimeOut();
  }

  ngOnDestroy(): void {
    if (this.timeOutId) this.clearTimeOut();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

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
    this.timeOutId = window.setTimeout(() => this.sendTimeOut(), this.timeOutDuration);
    this.isLoaded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isLoaded => {
        if (isLoaded) {
          if (this.timeOutId) clearTimeout(this.timeOutId);
          this.isLoading = false;
          this.changeDetectionRef.detectChanges();
        }
      });
  }

  sendTimeOut(): void {
    if (!this.isLoaded.value) {
      this.timeOut.emit(this.timeOutDuration);
    }
    clearTimeout(this.timeOutId);
  }

  ngOnDestroy(): void {
    if (this.timeOutId) clearTimeout(this.timeOutId);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

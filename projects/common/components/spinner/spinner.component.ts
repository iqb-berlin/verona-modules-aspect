import {
  ChangeDetectorRef, Component, Input, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'aspect-spinner',
  template: `
    <mat-spinner *ngIf="isLoading"></mat-spinner>
  `,
  styles: ['mat-spinner {margin: auto; position: relative; z-index: 100; top: -50%;}']
})
export class SpinnerComponent implements OnInit {
  @Input() isLoaded!: Subject<boolean>;
  isLoading: boolean = true;
  private ngUnsubscribe = new Subject<void>();

  constructor(private changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.isLoaded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(isLoaded => {
        if (isLoaded) {
          this.isLoading = false;
          this.changeDetectionRef.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

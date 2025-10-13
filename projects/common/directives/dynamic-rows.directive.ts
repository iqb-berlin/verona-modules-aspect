import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[dynamicRows]',
    standalone: false
})
export class DynamicRowsDirective implements OnInit, AfterViewInit, OnChanges {
  @Input() fontSize!: number;
  @Input() expectedCharactersCount!: number;
  @Output() dynamicRowsChange: EventEmitter<number> = new EventEmitter<number>();

  width = 0;
  observer!: ResizeObserver;

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.observer = new ResizeObserver(() => {
      this.zone.run(() => {
        this.width = this.elementRef.nativeElement.offsetWidth;
        this.calculateDynamicRows();
      });
    });
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngAfterViewInit(): void {
    this.calculateDynamicRows();
  }

  calculateDynamicRows(): void {
    const averageCharWidth = this.fontSize / 2;
    if (this.width) {
      this.dynamicRowsChange.emit(
        Math.ceil((
          this.expectedCharactersCount * averageCharWidth) /
          this.width
        )
      );
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fontSize || changes.expectedCharactersCount) {
      this.calculateDynamicRows();
    }
  }
}

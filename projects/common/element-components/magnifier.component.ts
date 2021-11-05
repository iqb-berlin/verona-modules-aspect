import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-magnifier',
  template: `
    <div *ngIf="image && image.width && image.height"
         class="hide-cursor">
<!--      <div class="magnifier-glass"-->
<!--           [style.backgroundImage] = "'url('+ (image.src) + ')'"-->
<!--           [style.backgroundPosition] = "backgroundPosition"-->
<!--           [style.left.px]="left"-->
<!--           [style.top.px]="top"-->
<!--           [style.width.px]="glassRadius * 2"-->
<!--           [style.height.px]="glassRadius * 2"-->
<!--           [style.backgroundSize] = "(image.width * zoom) + 'px ' + (image.height * zoom) + 'px'"-->
<!--           [style.backgroundRepeat] = "'no-repeat'">-->
<!--      </div>-->
    </div>
  `,
  styles: [
    ':host { position: absolute; top: 0; bottom: 0; right: 0; left: 0; }',
    '.magnifier-glass{ position: absolute; outline: 1px solid #000; pointer-events: none;}',
    '.hide-cursor{ width: 100%; height: 100%; cursor: none }'
  ]
})
export class Magnifier {
  @Input() image!: HTMLImageElement;

  glassRadius = 50;
  zoom: number = 2;
  left!: number;
  top!:number;
  backgroundPosition!: string;

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    this.left = this.calculateGlassPosition(this.image.width, event.offsetX);
    this.top = this.calculateGlassPosition(this.image.height, event.offsetY);
    this.backgroundPosition =
      `-${this.calculateBackgroundPosition(event.offsetX)}px -${this.calculateBackgroundPosition(event.offsetY)}px`;
  }

  private calculateGlassPosition(max: number, value: number): number {
    return ((max - 2 * this.glassRadius) / (max)) * value;
  }

  private calculateBackgroundPosition(value: number): number {
    return (value * this.zoom) < this.glassRadius ? 0 : (value * this.zoom - this.glassRadius);
  }
}

import {
  Component, EventEmitter, HostListener, Input, Output
} from '@angular/core';
import { ValueChangeElement } from 'common/models/input-element-interfaces';

@Component({
  selector: 'aspect-image-magnifier',
  templateUrl: './image-magnifier.component.html',
  styleUrls: ['./image-magnifier.component.scss'],
  standalone: false
})
export class ImageMagnifierComponent {
  @Input() image!: HTMLImageElement;
  @Input() imageId!: string;
  @Input() zoom!: number;
  @Input() size!: number;
  @Input() used!: boolean;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();

  left!: number;
  top!: number;
  backgroundPosition!: string;

  @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent): void {
    if (!this.used) {
      this.used = true;
      this.elementValueChanged.emit({ id: this.imageId, value: this.used });
    }
    this.left = this.calculateGlassPosition(this.image.width, event.offsetX) - 2;
    this.top = this.calculateGlassPosition(this.image.height, event.offsetY) - 2;
    this.backgroundPosition =
      `-${
        this.calculateBackgroundPosition(this.image.width, event.offsetX)
      }px -${
        this.calculateBackgroundPosition(this.image.height, event.offsetY)
      }px`;
  }

  private calculateGlassPosition(max: number, value: number): number {
    return ((max - this.size) / (max)) * value;
  }

  private calculateBackgroundPosition(max: number, value: number): number {
    return value * this.zoom - (value / max) * this.size;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';

@Pipe({ name: 'asOverlayOrigin' })

export class AsOverlayOriginPipe implements PipeTransform {
  transform(elementComponent: ElementComponent): CdkOverlayOrigin {
    return new CdkOverlayOrigin(elementComponent.elementRef);
  }
}

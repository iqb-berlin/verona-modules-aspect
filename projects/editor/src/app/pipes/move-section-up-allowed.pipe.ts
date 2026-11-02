import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moveSectionUpAllowed',
  standalone: false
})
export class MoveSectionUpAllowedPipe implements PipeTransform {
  /**
   * Whether a section can move up: within its page, or onto the page before it. Not onto a permanently visible
   * page -- a section there stands beside every page, and as the last section of that page it is offered no way
   * back down (#1634). The flag of the page before is handed in rather than the pages, so that the pure pipe
   * answers anew when that flag changes.
   */
  transform(sectionIndex: number, pageIndex: number, previousPageAlwaysVisible: boolean | undefined): boolean {
    return sectionIndex !== 0 || (pageIndex > 0 && !previousPageAlwaysVisible);
  }
}

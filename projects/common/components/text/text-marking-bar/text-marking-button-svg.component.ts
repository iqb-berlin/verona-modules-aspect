import { Component, Input } from '@angular/core';

@Component({
    selector: 'aspect-text-marking-button-svg',
    imports: [],
    template: `
    @if (buttonType === 'delete') {
      <svg x="0px" y="0px" width="24px" height="24px" viewBox="0 0 360 360">
        <g>
          <g>
            <path d="M348.994,102.946L250.04,3.993c-5.323-5.323-13.954-5.324-19.277,0l-153.7,
                       153.701l118.23,118.23l153.701-153.7 C354.317,116.902,354.317,108.271,348.994,102.946z"/>
            <path d="M52.646,182.11l-41.64,41.64c-5.324,5.322-5.324,13.953,0,19.275l98.954,98.957c5.323,5.322,13.954,
                       5.32,19.277,0 l41.639-41.641L52.646,182.11z"/>
            <polygon points="150.133,360 341.767,360 341.767,331.949 182.806,331.949"/>
          </g>
        </g>
      </svg>
    } @else if (buttonType === 'word') {
      <svg
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#000000">
        <rect
          fill="none"
          height="24"
          width="24"/>
        <path
          d="m 10.5,24 h 3 v -4 h -3 z M 13.06,5.19 16.81,8.94 7.75,18 H 4 v -3.75 z m 4.82,2.68 -3.75,-3.75 1.83,-1.83 c 0.39,-0.39 1.02,-0.39 1.41,0 l 2.34,2.34 c 0.39,0.39 0.39,1.02 0,1.41 z M 8.5,23.999816 2,24.000183 v -4 l 6.5,-3.66e-4 z M 22,24 H 15.5 V 20 H 22 Z"/>
      </svg>
    } @else if (buttonType === 'range') {
      <svg
        height="24px"
        viewBox="0 0 24 24"
        width="24px"
        fill="#000000">
        <rect
          fill="none"
          height="24"
          width="24"/>
        <path
          d="M 17,24 H 7 V 20 H 17 Z M 13.06,5.19 16.81,8.94 7.75,18 H 4 v -3.75 z m 4.82,2.68 -3.75,-3.75 1.83,-1.83 c 0.39,-0.39 1.02,-0.39 1.41,0 l 2.34,2.34 c 0.39,0.39 0.39,1.02 0,1.41 z M 5,23.999816 2,24.000183 v -4 l 3,-3.66e-4 z M 22,24 h -3 v -4 h 3 z"/>
      </svg>
    } @else {
      <svg height="24px"
           viewBox="0 0 24 24"
           width="24px"
           fill="#000000">
        <rect
          fill="none"
          height="24"
          width="24"/>
        <path
          d="M22,24H2v-4h20V24z M13.06,5.19l3.75,3.75L7.75,18H4v-3.75L13.06,5.19z M17.88,7.87l-3.75-3.75 l1.83-1.83c0.39-0.39,1.02-0.39,1.41,0l2.34,2.34c0.39,0.39,0.39,1.02,0,1.41L17.88,7.87z"
        />
      </svg>
    }
  `
})
export class TextMarkingButtonSvgComponent {
  @Input() buttonType!: 'selection' | 'word' | 'range' | 'delete';
}

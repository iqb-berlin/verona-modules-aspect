import { Mark, mergeAttributes } from '@tiptap/core';
import { TooltipPosition } from 'common/models/elements/element';

export interface TooltipExtensionOptions {
  HTMLAttributes: {
    onpointerdown: string;
    onpointerenter: string;
    onpointerleave: string;
    onmouseleave: string;
    style: string;
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tooltip: {
      setTooltip: (attributes?: {
        tooltipText: string,
        tooltipPosition: TooltipPosition,
      }) => ReturnType,
      unsetTooltip: () => ReturnType,
    }
  }
}

export const Tooltip = Mark.create<TooltipExtensionOptions>({
  get name() { return 'tooltip'; },

  addAttributes() {
    return {
      tooltipText: {
        default: '',
        parseHTML: element => element.getAttribute('data-tooltip-text'),
        renderHTML: attributes => {
          if (!attributes.tooltipText) {
            return {};
          }
          return {
            'data-tooltip-text': attributes.tooltipText
          };
        }
      },
      tooltipPosition: {
        default: 'below',
        parseHTML: element => element.getAttribute('data-tooltip-position'),
        renderHTML: attributes => {
          if (!attributes.tooltipPosition) {
            return {};
          }
          return {
            'data-tooltip-position': attributes.tooltipPosition
          };
        }
      }
    };
  },

  addOptions() {
    return {
      HTMLAttributes: {
        onpointerdown: 'this.dispatchEvent(new CustomEvent("pointerDownTooltip",' +
                       '{bubbles: true, detail: {tooltipText: this.getAttribute("data-tooltip-text"),' +
                       'tooltipPosition: this.getAttribute("data-tooltip-position")}}))',
        onpointerenter: 'this.dispatchEvent(new CustomEvent("pointerEnterTooltip",' +
                        '{bubbles: true, detail: {tooltipText: this.getAttribute("data-tooltip-text"),' +
                        'tooltipPosition: this.getAttribute("data-tooltip-position")}}))',
        onpointerleave: 'this.dispatchEvent(new CustomEvent("pointerLeaveTooltip", {bubbles: true, detail: {}}))',
        onmouseleave: 'this.dispatchEvent(new CustomEvent("mouseLeaveTooltip", {bubbles: true, detail: {}}))',
        style: 'cursor: pointer;'
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'tooltip'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tooltip', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTooltip: attributes => ({ commands }) => commands
        .setMark(this.name, attributes),
      unsetTooltip: () => ({ commands }) => commands.unsetMark(this.name)
    };
  }
});

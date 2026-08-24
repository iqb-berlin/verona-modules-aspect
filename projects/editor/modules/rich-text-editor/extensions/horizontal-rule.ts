import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    horizontalRuleExtension: {
      setHorizontalRuleShort: () => ReturnType,
    }
  }
}

export const HorizontalRuleExtension = HorizontalRule.extend({
  addAttributes() {
    return {
      short: {
        default: false,
        renderHTML: attributes => (
          {
            ...(attributes.short && { style: 'width: 20%; margin-left: 0;' }),
            short: attributes.short
          }
        ),
        parseHTML: element => element.getAttribute('short')
      }
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setHorizontalRuleShort: () => ({ commands }) => (
        commands.insertContent({ type: this.name, attrs: { short: true } })
      )
    };
  }
});

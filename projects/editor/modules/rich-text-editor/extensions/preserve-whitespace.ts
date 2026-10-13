import { extensions, RawCommands } from '@tiptap/core';

/** Preserve authored spacing when ngx-tiptap writes stored HTML through setContent. */
export const PreserveWhitespace = extensions.Commands.extend({
  name: 'preserveWhitespace',
  priority: 1,
  addCommands() {
    const originalSetContent = this.parent?.()?.setContent;
    if (!originalSetContent) throw new Error('The Tiptap setContent command is required.');
    const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}, options = {}) => (
      originalSetContent(content, emitUpdate, { preserveWhitespace: 'full', ...parseOptions }, options)
    );
    return { setContent };
  }
});

import { findParentNode } from '@tiptap/core';
import { ListItem } from '@tiptap/extension-list-item';
import { Node as ProseMirrorNode, NodeRange, ResolvedPos } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';

/**
 * The markers a sublist steps through, as Word does: a list nested one level deeper takes the one after
 * its parent's. An empty style is what pasted lists carried; the browser shows the first one for it.
 */
const NESTED_LIST_STYLES: Record<string, string[]> = {
  bulletList: ['disc', 'circle', 'square'],
  orderedList: ['decimal', 'lower-latin', 'lower-roman']
};

function nextListStyle(list: ProseMirrorNode): string {
  const styles = NESTED_LIST_STYLES[list.type.name];
  return styles[(styles.indexOf(list.attrs.listStyle || styles[0]) + 1) % styles.length];
}

function listDepth($pos: ResolvedPos): number {
  let lists = 0;
  for (let depth = $pos.depth; depth > 0; depth--) {
    if ($pos.node(depth).type.name in NESTED_LIST_STYLES) lists += 1;
  }
  return lists;
}

/**
 * Tab in a list used to give the item `Indent`'s padding. An item that moves a level down drops it, or
 * it would stand that much further right than the items it now stands with.
 */
function clearPadding(tr: Transaction, range: NodeRange): void {
  let pos = range.start;
  for (let index = range.startIndex; index < range.endIndex; index++) {
    const item = range.parent.child(index);
    if (item.attrs.indent) tr.setNodeMarkup(pos, undefined, { ...item.attrs, indent: 0 });
    pos += item.nodeSize;
  }
}

/**
 * A list ProseMirror creates gets the default attributes -- `disc`, the same marker as its parent, and
 * for numbered lists `upper-roman` and a font size of 20px whatever the parent has. The new sublist
 * keeps its parent's attributes instead and moves on one marker.
 */
function styleNewSublist(tr: Transaction, parentList: ProseMirrorNode): void {
  const sublist = findParentNode(node => node.type === parentList.type)(tr.selection);
  if (!sublist) return;
  tr.setNodeMarkup(sublist.pos, undefined, { ...parentList.attrs, listStyle: nextListStyle(parentList) });
}

/**
 * Tab and Shift-Tab move a list item a level down and up. `Indent` binds the same keys and pads the item
 * from the left, which moves the text and leaves the marker where it was (#1602).
 */
export const ListItemExtension = ListItem.extend({
  /** Ahead of `Indent`, which would otherwise be asked first. */
  priority: 101,

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: () => {
        if (!this.editor.isActive(this.name)) return false;
        const { $from, $to } = this.editor.state.selection;
        const range = $from.blockRange($to, node => node.firstChild?.type.name === this.name);
        /* The first item has nothing to hang under. It stays as it is, and the key must not move the focus
           out of the editor either. */
        if (!range || range.startIndex === 0) return true;
        const opensSublist = range.parent.child(range.startIndex - 1).lastChild?.type !== range.parent.type;
        this.editor.chain()
          .command(({ tr }) => {
            clearPadding(tr, range);
            return true;
          })
          .sinkListItem(this.name)
          .command(({ tr }) => {
            if (opensSublist) styleNewSublist(tr, range.parent);
            return true;
          })
          .run();
        return true;
      },
      /* On the top level the key stays with `Indent`, so the padding earlier versions put on an item with
         Tab can still be taken back. */
      'Shift-Tab': () => (
        listDepth(this.editor.state.selection.$from) > 1 && this.editor.commands.liftListItem(this.name)
      )
    };
  }
});

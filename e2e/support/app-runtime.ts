/* What the suite knows about the running app and its environment: Angular's debug API and the two
   browser APIs `lib.dom` does not declare. Each type names only the members a spec actually uses. */

export interface AngularDebugApi {
  getComponent<T>(element: Element): T | null;
  getDirectives<T>(element: Element): T[];
}

/* `ng` is put on the window by development builds only, which is what the suite runs against. */
export type WindowWithAngular = Window & { ng?: AngularDebugApi };

export function angularDebugApi(win: Window | null): AngularDebugApi {
  const ng = (win as WindowWithAngular | null)?.ng;
  if (!ng) throw new Error('Angulars Debug-API fehlt - läuft die App als Entwicklungsbuild?');
  return ng;
}

/* The members the specs use of the rich text editor component. */
export interface RichTextEditorInstance {
  editor: {
    commands: {
      selectAll(): void;
    };
    state: {
      selection: { from: number; to: number };
      doc: { textBetween(from: number, to: number): string };
    };
  };
}

function richTextEditorAt(element: Element): RichTextEditorInstance {
  const component = angularDebugApi(element.ownerDocument.defaultView)
    .getComponent<RichTextEditorInstance>(element);
  if (!component) throw new Error('An diesem Element hängt kein Rich-Text-Editor');
  return component;
}

/* Selecting text through the editor instance, where clicking and dragging would be brittle. */
export function selectAllInRichTextEditor(element: Element): void {
  richTextEditorAt(element).editor.commands.selectAll();
}

/**
 * The text the editor itself holds as selected. It can lag behind the DOM selection: ProseMirror
 * only picks up a selection set from outside on the next `selectionchange` (#1576).
 */
export function selectedTextInRichTextEditor(element: Element): string {
  const { state } = richTextEditorAt(element).editor;
  return state.doc.textBetween(state.selection.from, state.selection.to);
}

/* WebKit's predecessor of `caretPositionFromPoint`; the specs call it optionally and fall back. */
export type DocumentWithCaretRange = Document & {
  caretRangeFromPoint?(x: number, y: number): Range | null;
};

/* Touch detection reads `'ontouchstart' in window`, so the player tests define the property to make
   the app take its touch path. */
export type WindowWithTouchStart = Window & { ontouchstart?: () => void };

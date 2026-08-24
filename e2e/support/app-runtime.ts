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

/* The one member the specs call on the rich text editor component. */
export interface RichTextEditorInstance {
  editor: {
    commands: {
      selectAll(): void;
    };
  };
}

/* Selecting text through the editor instance, where clicking and dragging would be brittle. */
export function selectAllInRichTextEditor(element: Element): void {
  const component = angularDebugApi(element.ownerDocument.defaultView)
    .getComponent<RichTextEditorInstance>(element);
  if (!component) throw new Error('An diesem Element hängt kein Rich-Text-Editor');
  component.editor.commands.selectAll();
}

/* The directive one visibility spec patches, to hold a section visible past the point where the
   player would hide it again. Declared partial: it types every directive on the element, and only
   one of them has this member. */
export interface SectionVisibilityDirective {
  areVisibilityRulesFulfilled: () => boolean;
}

/* WebKit's predecessor of `caretPositionFromPoint`; the specs call it optionally and fall back. */
export type DocumentWithCaretRange = Document & {
  caretRangeFromPoint?(x: number, y: number): Range | null;
};

/* Touch detection reads `'ontouchstart' in window`, so the player tests define the property to make
   the app take its touch path. */
export type WindowWithTouchStart = Window & { ontouchstart?: () => void };

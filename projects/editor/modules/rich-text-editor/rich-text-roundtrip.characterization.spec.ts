/**
 * Characterization test for what the rich text editor makes of stored content (#1624).
 *
 * Purpose: a text or a cloze document that is opened in the editor and handed back must come out the way
 * it did before, whatever version of Tiptap, ProseMirror or ngx-tiptap is installed. Three things in the
 * player and in the model hang on exactly that and cannot see the editor's libraries:
 *
 * - a reader's selection marks are character offsets into the rendered text
 *   (`ElementModelElementCodeMappingService.markingBase`), and word marks are counted over its text
 *   nodes (`MarkableSupport`). A text the editor writes back differently moves the marks of stored answers.
 * - the child elements of a cloze sit in its document as model instances. `ClozeElement.setProperty`
 *   knows a new child by its placeholder id and a removed one by the instance that is missing, so an
 *   editor that copied node attributes instead of handing them on would break both.
 * - the cloze component renders the document node by node, by the names and attributes of the schema.
 *
 * The expectations live in `rich-text-roundtrip.baseline.json` rather than in a vitest snapshot, for the
 * reason given in `properties-panel.characterization.spec.ts`. The baseline is generated (by the skipped
 * group at the bottom) but committed. Treat a diff in it as a change to what units will hold once they
 * are saved again -- never regenerate it just to make the suite pass.
 *
 * Deliberately NOT part of the baseline:
 * - what a formula's node view writes once it has rendered. It replaces the stored markup with what the
 *   formula renderer of the day produces, a moment after the content was set; texts and documents are
 *   read before that, so the baseline does not move with the renderer.
 * - what the toolbar commands produce. They build the same nodes and marks the stored forms parse into.
 */
import {
  ComponentFixture, fakeAsync, flush, flushMicrotasks, tick, TestBed
} from '@angular/core/testing';
import { JSONContent } from '@tiptap/core';
import { TranslateModule } from '@ngx-translate/core';
// The factory puts itself into the registry the elements are built with.
import 'common/utils/element-factory';
import { ClozeDocument, ClozeElement } from 'common/models/elements/cloze';
import { UIElement } from 'common/models/elements/element';
import { MigrationManager } from 'common/services/migration-manager';
import { VersionManager } from 'common/services/version-manager';
import { ModelRegistry } from 'common/utils/model-registry';
import { UIElementProperties, UIElementType } from 'common/models/ui-element-interfaces';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { IDService } from 'editor/src/app/services/id.service';
import { RichTextEditorModule } from 'editor/modules/rich-text-editor/rich-text-editor.module';
import {
  RichTextEditorComponent
} from 'editor/modules/rich-text-editor/components/rich-text-editor/rich-text-editor.component';
import unit4m6 from 'test-data/unit-definitions/reference-testing/cloze.json';
import { STORED_CLOZE, STORED_TEXTS } from './rich-text-roundtrip.sources';
import baseline from './rich-text-roundtrip.baseline.json';

type PlainObject = Record<string, unknown>;

interface Baseline {
  texts: Record<string, Record<string, string>>;
  cloze: unknown;
  unit: unknown[];
  schema: unknown;
}

const BASELINE = baseline as unknown as Baseline;

/** A unit as it is stored, older than the current definition, so that it passes through the migration. */
const STORED_UNIT = unit4m6 as unknown as PlainObject;

/** The cloze elements of a unit, as the stored definition has them. */
function clozesOf(definition: unknown): PlainObject[] {
  if (Array.isArray(definition)) return definition.flatMap(clozesOf);
  if (!definition || typeof definition !== 'object') return [];
  const entry = definition as PlainObject;
  return entry.type === 'cloze' && entry.document ? [entry] : Object.values(entry).flatMap(clozesOf);
}

/** A unit the way the editor gets it: migrated to the current definition where it is older. */
function load(definition: PlainObject): PlainObject {
  const copy = structuredClone(definition);
  return VersionManager.needsMigration(copy) ?
    MigrationManager.migrate(copy, VersionManager.getCurrentVersion()) as unknown as PlainObject :
    copy;
}

function createCloze(stored: PlainObject, idService?: IDService): ClozeElement {
  return ModelRegistry.createElement(
    structuredClone(stored) as { type: UIElementType } & Partial<UIElementProperties>, idService
  ) as ClozeElement;
}

function modelsOf(node: JSONContent): UIElement[] {
  return [
    ...(node.attrs?.model ? [node.attrs.model as UIElement] : []),
    ...(node.content ?? []).flatMap(modelsOf)
  ];
}

/** The document with every child model named instead of spelled out: what the model holds is the
    element's business, and which instance it is gets its own assertion. */
function describeDocument(node: JSONContent): PlainObject {
  const { attrs, content, ...rest } = node;
  return {
    ...rest,
    ...(attrs && {
      attrs: Object.fromEntries(Object.entries(attrs).map(([name, value]) => [
        name, name === 'model' ? `model ${(value as UIElement).type} ${(value as UIElement).id}` : value
      ]))
    }),
    ...(content && { content: content.map(describeDocument) })
  };
}

describe('stored content through the rich text editor', () => {
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let component: RichTextEditorComponent;

  /** `flush` for the initial value, which ngModel hands over in a microtask and would otherwise write over
      the first content set, and for the timers the editor starts when it is created. */
  const createEditor = (clozeMode: boolean): void => {
    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    component.content = '';
    component.clozeMode = clozeMode;
    fixture.detectChanges();
    flush();
  };

  /** Hands a content to the editor the way its host does, through the `content` input, so that it takes
      the way stored content takes: ngModel writes it in a microtask, and ngx-tiptap sets it. */
  const open = (content: string | ClozeDocument): void => {
    fixture.componentRef.setInput('content', content);
    fixture.detectChanges();
    flushMicrotasks();
  };

  /** What the editor would save for a stored text. Read before the node views get to run. */
  const writeBack = (source: string): string => {
    open(source);
    const written = component.editor.getHTML();
    fixture.detectChanges();
    flush();
    return written;
  };

  const writeBackAll = (sources: string[]): Record<string, string> => Object.fromEntries(
    sources.map(source => [source, writeBack(source)])
  );

  /** What the editor holds for a cloze document it was given. Read before the node views get to run, like
      the texts. */
  const handBack = (document: ClozeDocument): JSONContent => {
    open(document);
    const handedBack = component.editor.getJSON();
    fixture.detectChanges();
    flush();
    return handedBack;
  };

  /** What the component reports to whoever opened it once the user has typed something -- the value the
      dialog closes with, and so what reaches the cloze. */
  const reportedAfterTyping = (): ClozeDocument => {
    const reported: (string | ClozeDocument)[] = [];
    const subscription = component.contentChange.subscribe(value => reported.push(value));
    component.editor.commands.insertContentAt(component.editor.state.doc.content.size, '<p>getippt</p>');
    fixture.detectChanges();
    flush();
    subscription.unsubscribe();
    return reported[reported.length - 1] as ClozeDocument;
  };

  const schema = (): PlainObject => {
    const attributes = (spec: { attrs?: Record<string, { default?: unknown }> }): PlainObject => Object.fromEntries(
      Object.entries(spec.attrs ?? {}).map(([name, attribute]) => [
        name, attribute.default instanceof UIElement ? `model ${attribute.default.type}` : attribute.default ?? null
      ])
    );
    return {
      nodes: Object.entries(component.editor.schema.nodes).map(([name, type]) => ({
        name,
        content: type.spec.content ?? null,
        group: type.spec.group ?? null,
        inline: type.spec.inline ?? false,
        attributes: attributes(type.spec)
      })),
      marks: Object.entries(component.editor.schema.marks).map(([name, type]) => ({
        name,
        excludes: type.spec.excludes ?? null,
        attributes: attributes(type.spec)
      }))
    };
  };

  /** The cloze documents of the stored unit, loaded as the editor loads it and handed back by the editor. */
  const unitDocuments = (): PlainObject[] => clozesOf(load(STORED_UNIT))
    .map(cloze => describeDocument(handBack(createCloze(cloze).document)));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditorModule, TranslateModule.forRoot()],
      providers: [{ provide: DialogService, useValue: {} }]
    }).compileComponents();
  });

  describe('texts', () => {
    it.each(Object.keys(STORED_TEXTS))('should write the stored forms of "%s" back as recorded', fakeAsync(
      (group: string) => {
        createEditor(false);
        expect(writeBackAll(STORED_TEXTS[group])).toEqual(BASELINE.texts[group]);
      }
    ));

    /* Tiptap 3 reports every content that is set unless it is told not to, and ngx-tiptap tells it. A text
       that reported a change on being opened would replace what the dialog holds, and saving without
       having typed anything would write the stored text back in the editor's form. */
    it('should report nothing for a text that is only opened', fakeAsync(() => {
      createEditor(false);
      const reported = vi.fn();
      component.contentChange.subscribe(reported);

      open('<p>Text</p>');
      fixture.detectChanges();
      flush();

      expect(component.editor.getText()).toBe('Text');
      expect(reported).not.toHaveBeenCalled();
    }));
  });

  describe('cloze documents', () => {
    it('should hand a stored document back as recorded', fakeAsync(() => {
      createEditor(true);
      const cloze = createCloze(STORED_CLOZE);

      expect(describeDocument(handBack(cloze.document))).toEqual(BASELINE.cloze);
    }));

    /* The same objects, not equal ones: the cloze finds the children the user removed by looking for
       the instances that are missing from what the editor hands back. */
    it('should hand every child back as the instance it was given', fakeAsync(() => {
      createEditor(true);
      const cloze = createCloze(STORED_CLOZE);
      const children = cloze.getChildElements();

      handBack(cloze.document);
      const handedBack = modelsOf(reportedAfterTyping() as JSONContent);

      expect(children.map(child => child.type)).toEqual(
        ['text-field-simple', 'drop-list', 'toggle-button', 'button', 'checkbox', 'dropdown', 'text-field-simple']
      );
      expect(handedBack.length).toBe(children.length);
      handedBack.forEach((model, index) => expect(model).toBe(children[index]));
    }));

    it('should render a node view with its element for every child', fakeAsync(() => {
      createEditor(true);
      handBack(createCloze(STORED_CLOZE).document);

      const rendered = Array.from<HTMLElement>(component.editor.view.dom.querySelectorAll(
        'aspect-text-field-simple, aspect-drop-list, aspect-toggle-button, aspect-button, aspect-checkbox, ' +
        'aspect-dropdown'
      )).map(element => element.tagName.toLowerCase());
      expect(rendered).toEqual([
        'aspect-text-field-simple', 'aspect-drop-list', 'aspect-toggle-button', 'aspect-button', 'aspect-checkbox',
        'aspect-dropdown', 'aspect-text-field-simple'
      ]);
    }));

    it('should insert every kind of gap with the placeholder id and a model of its own', fakeAsync(() => {
      createEditor(true);

      component.insertTextField();
      component.insertDropList();
      component.insertToggleButton();
      component.insertButton();
      component.insertCheckbox();
      component.insertDropdown();
      fixture.detectChanges();
      flush();

      const inserted = modelsOf(component.editor.getJSON());
      expect(inserted.map(model => model.type)).toEqual(
        ['text-field-simple', 'drop-list', 'toggle-button', 'button', 'checkbox', 'dropdown']
      );
      expect(inserted.map(model => model.id)).toEqual(Array(6).fill('cloze-child-id-placeholder'));
      expect(new Set(inserted).size).toBe(6);
      inserted.forEach(model => expect(model).toBeInstanceOf(UIElement));
    }));

    /* The whole way round: one child removed in the editor, one inserted, one left alone. */
    it('should let the cloze tell removed, new and kept children apart in what it gets back', fakeAsync(() => {
      const idService = TestBed.inject(IDService);
      const cloze = createCloze(STORED_CLOZE, idService);
      const [removed, kept] = cloze.getChildElements();
      createEditor(true);
      handBack(cloze.document);

      let removedAt = -1;
      component.editor.state.doc.descendants((node, position) => {
        if (node.attrs.model === removed) removedAt = position;
      });
      component.editor.commands.deleteRange({ from: removedAt, to: removedAt + 1 });
      component.editor.commands.setTextSelection(removedAt);
      component.insertCheckbox();
      const handedBack = reportedAfterTyping();

      expect(cloze.getRemovedClozeElements(handedBack)).toEqual([removed]);
      cloze.setProperty('document', handedBack);
      const [added, stillThere] = cloze.getChildElements();
      expect(stillThere).toBe(kept);
      expect(added.type).toBe('checkbox');
      expect(added.id).not.toBe('cloze-child-id-placeholder');
      expect(added.alias).not.toBe('cloze-child-alias-placeholder');
      expect(idService.isIDAvailable(added.id)).toBe(false);
      expect(idService.isIDAvailable(removed.id)).toBe(true);
    }));

    /* `tick` past the delay within which the history takes the loading and the removal for one step. */
    it('should bring a removed child back as the same instance on undo, and take it away on redo', fakeAsync(() => {
      createEditor(true);
      const cloze = createCloze(STORED_CLOZE);
      const children = cloze.getChildElements();
      handBack(cloze.document);
      tick(1000);

      let firstAt = -1;
      component.editor.state.doc.descendants((node, position) => {
        if (node.attrs.model === children[0]) firstAt = position;
      });
      component.editor.commands.deleteRange({ from: firstAt, to: firstAt + 1 });
      fixture.detectChanges();
      flush();
      expect(modelsOf(component.editor.getJSON())).toEqual(children.slice(1));

      component.editor.commands.undo();
      fixture.detectChanges();
      flush();
      const restored = modelsOf(component.editor.getJSON());
      expect(restored.length).toBe(children.length);
      restored.forEach((model, index) => expect(model).toBe(children[index]));

      component.editor.commands.redo();
      fixture.detectChanges();
      flush();
      expect(modelsOf(component.editor.getJSON())).toEqual(children.slice(1));
    }));

    it('should hand the cloze documents of a stored 4.6.0 unit back as recorded', fakeAsync(() => {
      createEditor(true);
      expect(unitDocuments()).toEqual(BASELINE.unit);
    }));
  });

  /* The cloze component and the cloze model read the document by these names and attributes. */
  it('should keep the nodes, marks and attributes of the cloze schema as recorded', fakeAsync(() => {
    createEditor(true);
    expect(schema()).toEqual(BASELINE.schema);
  }));

  /**
   * Regenerates `rich-text-roundtrip.baseline.json`.
   *
   *   1. change `describe.skip` below to `describe`
   *   2. `npx ng test editorModules --watch=false --reporters=default \
   *          --include "**\/rich-text-roundtrip.characterization.spec.ts" > /tmp/b.log`
   *      `--reporters=default` for the reason given at the regeneration group of
   *      `properties-panel.characterization.spec.ts`.
   *   3. `node scripts/rich-text-baseline-from-log.js /tmp/b.log`
   *   4. skip the group again and read the diff -- it is the list of changes to what units will hold
   *
   * The console forwards long lines in pieces of its own choosing, so the baseline is handed over in
   * numbered chunks.
   */
  describe.skip('baseline regeneration', () => {
    it('prints the baseline', fakeAsync(() => {
      const current: Partial<Baseline> = { texts: {} };
      Object.entries(STORED_TEXTS).forEach(([group, sources]) => {
        createEditor(false);
        (current.texts as Baseline['texts'])[group] = writeBackAll(sources);
      });
      createEditor(true);
      current.cloze = describeDocument(handBack(createCloze(STORED_CLOZE).document));
      createEditor(true);
      current.unit = unitDocuments();
      current.schema = schema();

      const json = JSON.stringify(current);
      const size = 4000;
      // eslint-disable-next-line no-console
      console.log(`<<<BASELINE ${Math.ceil(json.length / size)}>>>`);
      for (let index = 0; index * size < json.length; index++) {
        // eslint-disable-next-line no-console
        console.log(`<<<CHUNK ${index}>>>${json.slice(index * size, (index + 1) * size)}<<<END>>>`);
      }
      expect(json.length).toBeGreaterThan(0);
    }));
  });
});

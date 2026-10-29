import { TestBed } from '@angular/core/testing';
import * as singleElement from 'test-data/unit-definitions/reference-testing/single-element.json';
import * as elementRef from 'test-data/unit-definitions/reference-testing/element-ref.json';
import * as elementRef2 from 'test-data/unit-definitions/reference-testing/2elements-ref.json';
import * as section1 from 'test-data/unit-definitions/reference-testing/section-deletion.json';
import * as section2 from 'test-data/unit-definitions/reference-testing/section2.json';
import * as pageRefs from 'test-data/unit-definitions/reference-testing/pageRefs.json';
import * as cloze from 'test-data/unit-definitions/reference-testing/cloze.json';
import * as pageNav from 'test-data/unit-definitions/reference-testing/pageNav.json';
import { APIService } from 'common/shared.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageProperties } from 'common/models/page';
import { ClozeElement, ClozeProperties } from 'common/models/elements/cloze';
import { UIElement, PlayerElement } from 'common/models/elements/element';
import { AbstractIDService } from 'common/models/id-interfaces';
import { PositionedUIElement, UIElementProperties } from 'common/models/ui-element-interfaces';
import { ElementFactory } from 'common/utils/element-factory';
import { StateVariable } from 'common/models/state-variable';
import { TextElement } from 'common/models/elements/text';
import { ButtonElement } from 'common/models/elements/button';
import { TriggerElement } from 'common/models/elements/trigger';
import { ReferenceManager } from 'editor/src/app/classes/reference-manager';
import { UnitProperties } from 'common/models/unit';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorUnit } from 'editor/src/app/models/editor-unit';

describe('ReferenceManager', () => {
  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  const elementOf = (refMan: ReferenceManager, id: string): UIElement => refMan.unit.getAllElements()
    .find(element => element.id === id) as UIElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APIService, useClass: ApiStubService }
      ],
      imports: [MatSnackBarModule, MatDialogModule, BrowserAnimationsModule, TranslateModule.forRoot()]
    });
  });

  it('should load data', () => {
    expect(singleElement).toBeTruthy();
  });

  it('should find no refs for single element', () => {
    const refMan = new ReferenceManager(new EditorUnit(singleElement as UnitProperties));
    expect(refMan.getElementsReferences(refMan.unit.getAllElements()))
      .toEqual([]);
  });

  it('should find refs when deleting element (connected droplist)', () => {
    const refMan = new ReferenceManager(new EditorUnit(elementRef as UnitProperties));
    const element = elementOf(refMan, 'drop-list_1731317829457_1');

    const refs = refMan.getElementsReferences([element]);

    expect(refs.length).toEqual(1);
    expect(refs[0].element).toBe(element);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({ type: 'drop-list', alias: 'drop-list_2' }));
  });

  it('should find 2 refs when deleting 2 elements', () => {
    const refMan = new ReferenceManager(new EditorUnit(elementRef2 as UnitProperties));
    const element1 = elementOf(refMan, 'drop-list_1731317829457_1');
    const element2 = elementOf(refMan, 'audio_1731318487080_1');

    const refs = refMan.getElementsReferences([element1, element2]);

    expect(refs.length).toEqual(2);
    expect(refs[0].element).toBe(element1);
    expect(refs[1].element).toEqual(expect.objectContaining({ type: 'audio', alias: 'audio_1' }));
    expect(refs[1].refs[0]).toEqual(expect.objectContaining({ type: 'audio', alias: 'audio_2' }));
  });

  it('should find ref when deleting section', () => {
    const refMan = new ReferenceManager(new EditorUnit(section1 as UnitProperties));
    const refs = refMan.getSectionElementsReferences([refMan.unit.pages[0].sections[0]]);

    expect(refs.length).toEqual(1);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({
      type: 'drop-list', id: 'drop-list_1731318755523_1', alias: 'drop-list_2'
    }));
  });

  it('should find refs when deleting section but ignore refs within same section', () => {
    const refMan = new ReferenceManager(new EditorUnit(section2 as UnitProperties));
    const refs = refMan.getSectionElementsReferences([refMan.unit.pages[0].sections[0]]);

    expect(refs.length).toEqual(1);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({ type: 'drop-list', alias: 'drop-list_3' }));
  });

  it('should ignore refs within same page', () => {
    const refMan = new ReferenceManager(new EditorUnit(pageRefs as UnitProperties));
    const page = new EditorPage(JSON.parse(JSON.stringify(pageRefs)).pages[0] as PageProperties);
    const refs = refMan.getPageElementsReferences(page);

    expect(refs.length).toEqual(1);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({ type: 'drop-list', alias: 'drop-list_3' }));
  });

  it('should find cloze refs but ignore refs within same cloze', () => {
    const refMan = new ReferenceManager(new EditorUnit(cloze as UnitProperties));
    const clozeElement = new ClozeElement(
      JSON.parse(JSON.stringify(cloze)).pages[0].sections[0].elements[0] as ClozeProperties);
    const refs = refMan.getElementsReferences([clozeElement]);

    expect(refs.length).toEqual(1);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({ type: 'drop-list', alias: 'drop-list_3' }));
  });

  it('should find page refs via buttons', () => {
    const refMan = new ReferenceManager(new EditorUnit(pageNav as UnitProperties));
    const refs = refMan.getButtonReferencesForPage(0);

    expect(refs.length).toEqual(1);
    expect(refs[0].refs.length).toEqual(1);
    expect(refs[0].refs[0]).toEqual(expect.objectContaining({ type: 'button', alias: 'button_1' }));
  });

  /* Every kind of reference, found when its target goes, removed when the author confirms, and looked after when a
     unit is loaded (#1509). */
  describe('the kinds of references', () => {
    const idService = {
      getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
      register: (): void => {},
      unregister: (): void => {},
      isAliasAvailable: (): boolean => true,
      changeAlias: (): void => {}
    } as unknown as AbstractIDService;
    const create = <T extends UIElement>(properties: Record<string, unknown>): T => ElementFactory
      .createElement(properties as unknown as UIElementProperties, idService) as T;
    const stateVariableParam = (): StateVariable => new StateVariable('state_1', 'zustand', '1');

    let unit: EditorUnit;
    let refMan: ReferenceManager;
    let video1: PlayerElement;
    let video2: PlayerElement;
    let panel: UIElement;
    let text: TextElement;
    let anchorText: TextElement;
    let field: UIElement;
    let button: ButtonElement;
    let stateTrigger: TriggerElement;
    let highlightTrigger: TriggerElement;

    beforeEach(() => {
      unit = new EditorUnit(undefined, idService);
      unit.pages.push(new EditorPage(undefined, idService));
      unit.stateVariables = [new StateVariable('state_1', 'zustand', '')];
      video1 = create({ type: 'video', id: 'video_1', alias: 'video_1' });
      video2 = create({
        type: 'video', id: 'video_2', alias: 'video_2', player: { activeAfterID: 'video_1' }
      });
      panel = create({ type: 'marking-panel', id: 'marking-panel_1', alias: 'panel' });
      text = create({
        type: 'text', id: 'text_1', alias: 'lesetext', markingPanels: ['marking-panel_1']
      });
      anchorText = create({
        type: 'text',
        id: 'text_2',
        alias: 'ankertext',
        text: '<p><aspect-anchor data-anchor-id="a1">Stelle</aspect-anchor></p>'
      });
      field = create({ type: 'text-field', id: 'text-field_1', alias: 'feld' });
      button = create({
        type: 'button', id: 'button_1', alias: 'knopf', action: 'stateVariableChange', actionParam: stateVariableParam()
      });
      stateTrigger = create({
        type: 'trigger',
        id: 'trigger_1',
        alias: 'setzen',
        action: 'stateVariableChange',
        actionParam: stateVariableParam()
      });
      highlightTrigger = create({
        type: 'trigger', id: 'trigger_2', alias: 'hervorheben', action: 'highlightText', actionParam: 'a1'
      });
      unit.pages[0].sections[0].elements.push(...[video1, video2, panel, text, anchorText, field, button,
        stateTrigger, highlightTrigger] as PositionedUIElement[]);
      unit.pages[1].sections[0].visibilityRules = [
        { id: 'text-field_1', operator: '=', value: 'a' },
        { id: 'state_1', operator: '=', value: '1' }
      ];
      refMan = new ReferenceManager(unit);
    });

    it('should find a video another one waits for, and stop the waiting', () => {
      const refs = refMan.getElementsReferences([video1]);

      expect(refs.map(refList => refList.refs)).toEqual([[video2]]);
      ReferenceManager.deleteReferences(refs);
      expect(video2.player.activeAfterID).toBe('');
    });

    it('should find a marking panel a text names, and take it out of the text', () => {
      const refs = refMan.getElementsReferences([panel]);

      expect(refs.map(refList => refList.refs)).toEqual([[text]]);
      ReferenceManager.deleteReferences(refs);
      expect(text.markingPanels).toEqual([]);
    });

    it('should find a section whose visibility rule asks the element, and remove the rule', () => {
      const refs = refMan.getElementsReferences([field]);

      expect(refs[0].refs).toEqual([]);
      expect(refs[0].sections).toEqual([{ section: unit.pages[1].sections[0], pageIndex: 1, sectionIndex: 0 }]);
      ReferenceManager.deleteReferences(refs);
      expect(unit.pages[1].sections[0].visibilityRules.map(rule => rule.id)).toEqual(['state_1']);
    });

    it('should find what sets or asks a state variable, and let go of it', () => {
      const refs = refMan.getStateVariableReferences(unit.stateVariables);

      expect(refs[0].element).toEqual({ type: 'state-variable', id: 'state_1', alias: 'zustand' });
      expect(refs[0].refs).toEqual([button, stateTrigger]);
      expect(refs[0].sections?.map(location => location.pageIndex)).toEqual([1]);
      ReferenceManager.deleteReferences(refs);
      expect(button.actionParam).toBeNull();
      expect(stateTrigger.actionParam).toBeNull();
      // Without its variable, the panel would offer the first remaining one as if it were chosen.
      expect(button.action).toBeNull();
      expect(stateTrigger.action).toBeNull();
      expect(unit.pages[1].sections[0].visibilityRules.map(rule => rule.id)).toEqual(['text-field_1']);
    });

    /* Buttons were looked at, triggers were not; and the anchor group had no type, so nothing was removed although
       the dialog said it would be. */
    it('should find a trigger that highlights a range of a deleted text, and clear it', () => {
      const refs = refMan.getElementsReferences([anchorText]);

      expect(refs).toEqual([expect.objectContaining({
        element: expect.objectContaining({ type: 'text-anchor', id: 'a1' }), refs: [highlightTrigger]
      })]);
      ReferenceManager.deleteReferences(refs);
      expect(highlightTrigger.actionParam).toBeNull();
    });

    /* An anchor's id is the marked text itself: two texts can hold the same one, a duplicated text always does. */
    it('should leave a highlight alone whose range another text still holds', () => {
      unit.pages[1].sections[0].elements.push(create<PositionedUIElement>({
        type: 'text',
        id: 'text_3',
        alias: 'kopie',
        text: '<p><aspect-anchor data-anchor-id="a1">Stelle</aspect-anchor></p>'
      }));

      expect(refMan.getElementsReferences([anchorText])).toEqual([]);
      expect(refMan.getTextAnchorReferences(['a1'], new Set(['text_2']))).toEqual([]);
    });

    /* The target stays and only its id changes, so every kind points at the new one (#1508). */
    it('should point every kind of reference at a replaced id', () => {
      refMan.replaceReferences('video_1', 'video_new', video1);
      refMan.replaceReferences('marking-panel_1', 'marking-panel_new', panel);
      refMan.replaceReferences('text-field_1', 'text-field_new', field);
      refMan.replaceReferences('state_1', 'state_new', unit.stateVariables[0]);

      expect(video2.player.activeAfterID).toBe('video_new');
      expect(text.markingPanels).toEqual(['marking-panel_new']);
      expect(unit.pages[1].sections[0].visibilityRules.map(rule => rule.id)).toEqual(['text-field_new', 'state_new']);
      expect((button.actionParam as StateVariable).id).toBe('state_new');
      expect((stateTrigger.actionParam as StateVariable).id).toBe('state_new');
      expect(button.action).toBe('stateVariableChange');
    });

    it('should point a drop-list connection at a replaced id and leave the others', () => {
      const listA = create<PositionedUIElement>({ type: 'drop-list', id: 'Ablage 1', alias: 'ablage' });
      const listB = create<PositionedUIElement>({
        type: 'drop-list', id: 'drop-list_2', alias: 'zweite', connectedTo: ['Ablage 1', 'drop-list_3']
      });
      unit.pages[0].sections[0].elements.push(listA, listB);

      refMan.replaceReferences('Ablage 1', 'drop-list_new', listA);

      expect((listB as unknown as { connectedTo: string[] }).connectedTo).toEqual(['drop-list_new', 'drop-list_3']);
    });

    /* Stored units can hold two objects with exactly the same id. Where a kind could mean either, nothing tells them
       apart and the references stay with the twin; where it can only mean the replaced one, they follow it. */
    it('should follow the replaced one where a twin of another kind cannot be meant, and stay where it can', () => {
      const twinField = create<UIElement>({ type: 'text-field', id: 'state_1', alias: 'zwilling' });

      refMan.replaceReferences('state_1', 'state_new', unit.stateVariables[0], [twinField]);

      expect((button.actionParam as StateVariable).id).toBe('state_new');
      expect(unit.pages[1].sections[0].visibilityRules.map(rule => rule.id)).toEqual(['text-field_1', 'state_1']);
    });

    it('should leave the references alone for a twin of the same kind', () => {
      const twinVideo = create<UIElement>({ type: 'video', id: 'video_1', alias: 'zwilling' });

      refMan.replaceReferences('video_1', 'video_new', video1, [twinVideo]);

      expect(video2.player.activeAfterID).toBe('video_1');
    });

    it('should not count references among what is deleted together', () => {
      expect(refMan.getElementsReferences([video1, video2])).toEqual([]);
      expect(refMan.getElementsReferences([panel, text])).toEqual([]);
    });

    it('should not count a visibility rule of a section deleted along with its target', () => {
      unit.pages[1].sections[0].elements.push(create<PositionedUIElement>({
        type: 'checkbox', id: 'checkbox_1', alias: 'box'
      }));
      unit.pages[1].sections[0].visibilityRules.push({ id: 'checkbox_1', operator: '=', value: 'true' });

      expect(refMan.getSectionElementsReferences([unit.pages[1].sections[0]])).toEqual([]);
    });

    describe('on loading', () => {
      it('should leave valid references alone', () => {
        expect(refMan.repairInvalidReferences()).toEqual([]);
        expect(refMan.getRulesIntoNothing()).toEqual([]);
      });

      it('should remove the references into nothing the player makes nothing of', () => {
        video2.player.activeAfterID = 'video_9';
        text.markingPanels = ['marking-panel_1', 'marking-panel_9'];
        (button.actionParam as StateVariable).id = 'state_9';

        expect(refMan.repairInvalidReferences()).toEqual([video2, text, button]);
        expect(video2.player.activeAfterID).toBe('');
        expect(text.markingPanels).toEqual(['marking-panel_1']);
        expect(button.actionParam).toBeNull();
      });

      /* A rule into nothing is never fulfilled: with "and" its section is never shown, and without any rule it is
         always shown. Removing it on load would change what test takers see. */
      it('should only report a visibility rule into nothing, and leave it as it is', () => {
        unit.pages[1].sections[0].visibilityRules[0].id = 'text-field_9';

        expect(refMan.repairInvalidReferences()).toEqual([]);
        expect(refMan.getRulesIntoNothing()).toEqual([{
          location: { section: unit.pages[1].sections[0], pageIndex: 1, sectionIndex: 0 },
          targetIDs: ['text-field_9']
        }]);
        expect(unit.pages[1].sections[0].visibilityRules.length).toBe(2);
      });

      /* Asked on every change, so a rule the author corrects drops out of the list (#1520). */
      it('should no longer report a rule once it asks for something the unit holds', () => {
        unit.pages[1].sections[0].visibilityRules[0].id = 'text-field_9';
        expect(refMan.getRulesIntoNothing().length).toBe(1);

        unit.pages[1].sections[0].visibilityRules[0].id = 'state_1';

        expect(refMan.getRulesIntoNothing()).toEqual([]);
      });

      it('should repair a navigation to a page beyond the last', () => {
        const navigation = create<ButtonElement>({
          type: 'button', id: 'button_2', alias: 'weiter', action: 'pageNav', actionParam: 5
        });
        unit.pages[0].sections[0].elements.push(navigation as unknown as PositionedUIElement);

        expect(refMan.repairInvalidReferences()).toEqual([navigation]);
        expect(navigation.actionParam).toBeNull();
      });
    });
  });

  /* A navigation button stores the number of a page among those it can lead to, which leaves out a permanently
     visible page. Each step on the pages renumbers them, and the button has to keep leading to its page (#1511). */
  describe('the page numbers of navigation buttons', () => {
    const idService = {
      getAndRegisterNewID: (idType: string): string => `${idType}_generated`,
      register: (): void => {},
      unregister: (): void => {}
    } as unknown as AbstractIDService;

    let unit: EditorUnit;
    let refMan: ReferenceManager;
    let pages: EditorPage[];

    /** A button on the first page that leads to the page numbered `target`. */
    const navigateTo = (target: number): ButtonElement => {
      const button = ElementFactory.createElement({
        type: 'button', id: `button_${target}`, alias: `button_${target}`, action: 'pageNav', actionParam: target
      } as unknown as UIElementProperties, idService) as ButtonElement;
      unit.pages[0].sections[0].elements.push(button as unknown as PositionedUIElement);
      return button;
    };

    /** Runs a step on the pages between taking the targets and writing them back, as `UnitService` does. */
    const keepingTargets = (operation: () => void, mergedInto?: Map<EditorPage, EditorPage>): void => {
      const targets = refMan.capturePageTargets();
      operation();
      refMan.restorePageTargets(targets, mergedInto);
    };

    beforeEach(() => {
      unit = new EditorUnit(undefined, idService);
      pages = [0, 1, 2].map(() => new EditorPage(undefined, idService));
      unit.pages = [...pages];
      refMan = new ReferenceManager(unit);
    });

    it('should follow its page when a page before it is deleted', () => {
      const button = navigateTo(2);

      keepingTargets(() => unit.pages.splice(1, 1));

      expect(button.actionParam).toBe(1);
    });

    it('should lose its target when its page is deleted', () => {
      const button = navigateTo(2);
      const before = navigateTo(1);

      keepingTargets(() => unit.pages.splice(2, 1));

      expect(button.actionParam).toBeNull();
      expect(before.actionParam).toBe(1);
    });

    it('should follow its page when the pages are reordered', () => {
      const button = navigateTo(1);

      keepingTargets(() => unit.pages.push(unit.pages.splice(1, 1)[0]));

      expect(button.actionParam).toBe(2);
    });

    it('should follow its page when a page is inserted before it', () => {
      const button = navigateTo(1);

      keepingTargets(() => unit.pages.splice(1, 0, new EditorPage(undefined, idService)));

      expect(button.actionParam).toBe(2);
    });

    it('should lead to the page that took over the content of its page', () => {
      const button = navigateTo(2);
      const after = new EditorPage(undefined, idService);
      unit.pages.push(after);
      const afterButton = navigateTo(3);

      keepingTargets(() => unit.pages.splice(2, 1), new Map([[pages[2], pages[1]]]));

      expect(button.actionParam).toBe(1);
      expect(afterButton.actionParam).toBe(2);
    });

    /* Its page went into the page the button stands on. A button cannot lead to its own page: the panel offers no
       such option, and in the player it would do nothing. */
    it('should lose its target when its page goes into the page it stands on', () => {
      const button = navigateTo(1);

      keepingTargets(() => unit.pages.splice(1, 1), new Map([[pages[1], pages[0]]]));

      expect(button.actionParam).toBeNull();
    });

    it('should say whether any button changed', () => {
      const button = navigateTo(2);
      const targets = refMan.capturePageTargets();

      expect(refMan.restorePageTargets(targets)).toBe(false);
      unit.pages.splice(1, 1);
      expect(refMan.restorePageTargets(targets)).toBe(true);
      expect(button.actionParam).toBe(1);
    });

    /* Made permanently visible, a page moves to the front and is no longer counted. It is always in view then, so
       there is nothing left to navigate to. */
    it('should be renumbered when a page becomes permanently visible', () => {
      const button = navigateTo(2);
      const madeVisible = navigateTo(1);

      keepingTargets(() => {
        unit.movePageToFront(1);
        pages[1].alwaysVisible = true;
      });

      expect(button.actionParam).toBe(1);
      expect(madeVisible.actionParam).toBeNull();
    });

    it('should be renumbered when the permanently visible page becomes a page like the others', () => {
      pages[0].alwaysVisible = true;
      const button = navigateTo(1);

      keepingTargets(() => { pages[0].alwaysVisible = false; });

      expect(button.actionParam).toBe(2);
    });

    /* Compared with the position in `unit.pages`, a permanently visible page in front shifted every number by
       one: deleting a page reported the buttons that lead to the page after it. */
    it('should report the buttons that lead to a page, counting as the buttons count', () => {
      pages[0].alwaysVisible = true;
      const button = navigateTo(1);

      expect(refMan.getButtonReferencesForPage(2)[0].refs).toEqual([button]);
      expect(refMan.getButtonReferencesForPage(2)[0].element.alias).toBe('Seite 2');
      expect(refMan.getButtonReferencesForPage(1)).toEqual([]);
      expect(refMan.getButtonReferencesForPage(0)).toEqual([]);
    });

    it('should repair a navigation beyond the last page it can lead to', () => {
      pages[0].alwaysVisible = true;
      const button = navigateTo(2);
      const valid = navigateTo(1);

      expect(refMan.repairInvalidReferences()).toEqual([button]);
      expect(button.actionParam).toBeNull();
      expect(valid.actionParam).toBe(1);
    });

    it('should repair a navigation to a number that names no page at all', () => {
      const negative = navigateTo(-1);
      const fraction = navigateTo(0.5);

      expect(refMan.repairInvalidReferences()).toEqual([negative, fraction]);
      expect(negative.actionParam).toBeNull();
      expect(fraction.actionParam).toBeNull();
    });
  });
});

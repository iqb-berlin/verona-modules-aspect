import { ApplicationRef } from '@angular/core';
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { RichTextEditorModule } from 'editor/modules/rich-text-editor/rich-text-editor.module';
import {
  RichTextEditorComponent
} from 'editor/modules/rich-text-editor/components/rich-text-editor/rich-text-editor.component';

describe('RichTextEditorComponent', () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;

  const createClipboardEvent = (data: Record<string, string>): ClipboardEvent => {
    const clipboardData = new DataTransfer();
    Object.entries(data).forEach(([type, value]) => clipboardData.setData(type, value));
    return new ClipboardEvent('paste', { clipboardData, cancelable: true, bubbles: true });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditorModule, TranslateModule.forRoot()],
      providers: [{ provide: DialogService, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    component.content = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* The reduced controls leave the alignment out; a table header cell asks for it back (#1430). */
  describe('text alignment with the reduced controls', () => {
    const alignmentGroup = (): HTMLElement | null => fixture.nativeElement.querySelector('.text-alignment-group');

    beforeEach(() => {
      component.controlPanelFolded = false;
      component.showReducedControls = true;
    });

    it('should leave the alignment out by default', () => {
      fixture.detectChanges();
      expect(alignmentGroup()).toBeNull();
    });

    it('should offer the alignment when asked for it', () => {
      component.showTextAlignment = true;
      fixture.detectChanges();
      expect(alignmentGroup()).not.toBeNull();
    });

    /* Migration4m12To4m13 writes the alignment of a stored header cell in exactly this form; the editor
       has to read it back as an alignment and keep it, with the paragraph's margins at zero. */
    it('should read and keep an aligned paragraph the way the 4.13 migration stores it', () => {
      component.editor.commands
        .setContent('<p style="margin-bottom: 0px; margin-top: 0; text-align: center">a &lt; b</p>');

      expect(component.editor.isActive({ textAlign: 'center' })).toBe(true);
      const paragraph = new DOMParser().parseFromString(component.editor.getHTML(), 'text/html')
        .querySelector('p') as HTMLParagraphElement;
      expect(paragraph.style.textAlign).toBe('center');
      expect(paragraph.style.marginTop).toBe('0px');
      expect(paragraph.style.marginBottom).toBe('0px');
      expect(paragraph.textContent).toBe('a < b');
    });
  });

  it('should paste formatted clipboard content as plain text', () => {
    component.editor.view.dom.dispatchEvent(createClipboardEvent({
      'text/plain': 'Hallo Welt',
      'text/html': '<p><strong style="color: red;">Hallo Welt</strong></p>'
    }));

    const html = component.editor.getHTML();
    expect(html).toContain('Hallo Welt');
    expect(html).not.toContain('<strong');
    expect(html).not.toContain('color');
  });

  it('should paste multi-line text as separate paragraphs', () => {
    component.editor.view.dom.dispatchEvent(createClipboardEvent({
      'text/plain': 'Zeile 1\r\nZeile 2\nZeile 3'
    }));

    const doc = component.editor.state.doc;
    expect(doc.childCount).toBe(3);
    expect(doc.child(0).textContent).toBe('Zeile 1');
    expect(doc.child(1).textContent).toBe('Zeile 2');
    expect(doc.child(2).textContent).toBe('Zeile 3');
  });

  it('should paste HTML-only clipboard content as plain text', () => {
    component.editor.view.dom.dispatchEvent(createClipboardEvent({
      'text/html': '<h1>Titel</h1><p>Erster Absatz<br>mit Umbruch</p>'
    }));

    const html = component.editor.getHTML();
    expect(html).not.toContain('<h1');
    expect(html).not.toContain('<br');
    expect(component.editor.state.doc.textContent).toContain('Titel');
    expect(component.editor.state.doc.textContent).toContain('Erster Absatz');
    expect(component.editor.state.doc.textContent).toContain('mit Umbruch');
  });

  it('should insert dropped text as plain text', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', 'Angekommen');
    dataTransfer.setData('text/html', '<p><em>Angekommen</em></p>');
    const coords = component.editor.view.coordsAtPos(1);
    component.editor.view.dom.dispatchEvent(new DragEvent('drop', {
      dataTransfer,
      clientX: coords.left,
      clientY: coords.top,
      cancelable: true,
      bubbles: true
    }));

    const html = component.editor.getHTML();
    expect(html).toContain('Angekommen');
    expect(html).not.toContain('<em');
  });

  /* One switch for the session: every editor follows it, also one opened after it was switched (#1476). */
  describe('marking non-breaking spaces', () => {
    const markers = (editorComponent: RichTextEditorComponent): number => editorComponent.editor.view.dom
      .querySelectorAll('.nbsp-marker').length;

    const createEditor = (): RichTextEditorComponent => {
      const other = TestBed.createComponent(RichTextEditorComponent);
      other.componentInstance.content = '';
      other.detectChanges();
      other.componentInstance.editor.commands.setContent('<p>3&nbsp;m</p>');
      return other.componentInstance;
    };

    beforeEach(() => {
      component.editor.commands.setContent('<p>10&nbsp;kg</p>');
      component.controlPanelFolded = false;
      fixture.detectChanges();
    });

    const toggleSwitch = (): HTMLButtonElement => fixture.nativeElement
      .querySelector('.show-nbsp-toggle button[role="switch"]');

    it('should switch the marking with the switch below the text', () => {
      expect(markers(component)).toBe(0);

      toggleSwitch().click();
      fixture.detectChanges();

      expect(markers(component)).toBe(1);
      expect(toggleSwitch().getAttribute('aria-checked')).toBe('true');
    });

    it('should offer the switch with the reduced toolbar and with the toolbar folded', () => {
      component.showReducedControls = true;
      fixture.detectChanges();
      expect(toggleSwitch()).not.toBeNull();

      component.controlPanelFolded = true;
      fixture.detectChanges();
      expect(toggleSwitch()).not.toBeNull();
    });

    it('should lock the switch together with the editor', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(toggleSwitch().disabled).toBe(true);
    });

    it('should switch an editor open beside it and one opened afterwards', () => {
      const beside = createEditor();

      component.nonBreakingSpaceVisibility.toggle();

      expect(markers(beside)).toBe(1);
      expect(markers(createEditor())).toBe(1);
    });

    it('should not report a change of the content when switched', () => {
      const changes = vi.fn();
      component.contentChange.subscribe(changes);

      component.nonBreakingSpaceVisibility.toggle();
      fixture.detectChanges();

      expect(changes).not.toHaveBeenCalled();
    });
  });

  /* Measured in the editor before the fix: every closed text dialog left its editor alive, with its
     node views and about 1,200 DOM nodes (#1516). */
  describe('closing the editor', () => {
    it('should destroy the tiptap editor', () => {
      const { editor } = component;

      fixture.destroy();

      expect(editor.isDestroyed).toBe(true);
    });

    /* The node views are what change detection keeps visiting: ngx-tiptap attaches each one to the
       application and detaches it only when the editor destroys it. The hook is called directly so the
       fixture's own view stays where it is and the count changes by the node view alone; the teardown
       calls it a second time, which both the subject and the editor take without complaint. `flush`
       for the timer the formula's node view sets when it renders. */
    it('should take its node views out of the application', fakeAsync(() => {
      const appRef = TestBed.inject(ApplicationRef);
      const withoutFormula = appRef.viewCount;
      component.editor.commands.setContent(
        '<p>a <aspect-nodeview-math-formula formula="x"></aspect-nodeview-math-formula></p>'
      );
      flush();
      expect(appRef.viewCount).toBe(withoutFormula + 1);

      component.ngOnDestroy();

      expect(appRef.viewCount).toBe(withoutFormula);
    }));
  });
});

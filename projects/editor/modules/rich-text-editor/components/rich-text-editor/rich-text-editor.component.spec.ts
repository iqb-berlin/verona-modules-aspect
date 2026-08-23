import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      imports: [RichTextEditorModule],
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
});

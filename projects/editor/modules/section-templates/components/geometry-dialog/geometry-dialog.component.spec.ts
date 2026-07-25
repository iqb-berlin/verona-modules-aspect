import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import {
  GeometryWizardDialogComponent
} from 'editor/modules/section-templates/components/geometry-dialog/geometry-dialog.component';

@Component({
  standalone: false,
  selector: 'aspect-rich-text-editor',
  template: ''
})
class MockRichTextEditorComponent {
  @Input() content: string = '';
  @Input() placeholder: string = '';
  @Output() contentChange = new EventEmitter<string>();
}

describe('GeometryWizardDialogComponent', () => {
  let component: GeometryWizardDialogComponent;
  let fixture: ComponentFixture<GeometryWizardDialogComponent>;

  const mockDialogRef = {
    close: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        GeometryWizardDialogComponent,
        MockRichTextEditorComponent
      ],
      imports: [
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeometryWizardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with helper enabled and no app definition', () => {
    expect(component.showHelper).toBe(true);
    expect(component.geometryAppDefinition).toBeUndefined();
    expect(component.geometryFileName).toBeUndefined();
  });

  it('should set app definition and file name after loading a file', fakeAsync(() => {
    vi.spyOn(FileService, 'loadFile').mockResolvedValue({ name: 'figure.ggb', content: 'ggb-content' });

    component.changeSrc();
    flushMicrotasks();

    expect(FileService.loadFile).toHaveBeenCalledWith(['.ggb'], true);
    expect(component.geometryAppDefinition).toBe('ggb-content');
    expect(component.geometryFileName).toBe('figure.ggb');
  }));

  it('should disable the confirm button until an app definition is set', () => {
    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);

    component.geometryAppDefinition = 'ggb-content';
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
  });

  it('should close the dialog with the entered values on confirm', () => {
    component.text = 'question';
    component.geometryAppDefinition = 'ggb-content';
    component.geometryFileName = 'figure.ggb';
    component.showHelper = false;
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('div[mat-dialog-actions] button') as HTMLButtonElement;
    confirmButton.click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      text: 'question',
      geometryAppDefinition: 'ggb-content',
      geometryFileName: 'figure.ggb',
      showHelper: false
    });
  });
});

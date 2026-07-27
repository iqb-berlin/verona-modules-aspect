import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Mock } from 'vitest';
import { FileService } from 'common/services/file.service';
import {
  GeogebraAppDefinitionDialogComponent
} from 'editor/src/app/components/dialogs/geogebra-app-definition-dialog/geogebra-app-definition-dialog.component';

describe('GeogebraAppDefinitionDialogComponent', () => {
  let component: GeogebraAppDefinitionDialogComponent;
  let fixture: ComponentFixture<GeogebraAppDefinitionDialogComponent>;
  let dialogRefMock: { close: Mock };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    await TestBed.configureTestingModule({
      declarations: [GeogebraAppDefinitionDialogComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GeogebraAppDefinitionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the status area as long as there is no message', () => {
    const statusArea = fixture.nativeElement.querySelector('.status-area') as HTMLElement;
    expect(statusArea.hidden).toBe(true);
  });

  it('should close with the pasted base64 definition', () => {
    const validBase64 = btoa('<geogebra/>');

    component.validateBase64(validBase64);

    expect(component.statusMessage).toBeUndefined();
    expect(dialogRefMock.close).toHaveBeenCalledWith({ fileName: '', content: validBase64 });
  });

  it('should show an error message for a malformed base64 definition', () => {
    component.validateBase64('YW Jj');
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component.statusMessage?.color).toBe('red');
    const statusArea = fixture.nativeElement.querySelector('.status-area') as HTMLElement;
    expect(statusArea.hidden).toBe(false);
    expect(statusArea.textContent).toContain('Fehler beim Lesen');
  });

  it('should show an error message when nothing was pasted', () => {
    component.validateBase64(undefined);

    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component.statusMessage).toBeTruthy();
  });

  it('should close with the loaded GeoGebra file', async () => {
    const file = { name: 'definition.ggb', content: 'base64-content' };
    vi.spyOn(FileService, 'loadFile').mockResolvedValue(file);

    await component.loadGeogebraFile();

    expect(FileService.loadFile).toHaveBeenCalledWith(['.ggb'], true);
    expect(dialogRefMock.close).toHaveBeenCalledWith(file);
  });
});

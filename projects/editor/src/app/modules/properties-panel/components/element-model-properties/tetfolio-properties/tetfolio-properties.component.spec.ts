import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import { zipSync } from 'fflate/browser';
import { Distpacker } from 'common/utils/distpacker';
import { TetfolioPropertiesComponent } from './tetfolio-properties.component';

describe('TetfolioPropertiesComponent', () => {
  let component: TetfolioPropertiesComponent;
  let fixture: ComponentFixture<TetfolioPropertiesComponent>;
  let emitted: { property: string; value: unknown }[];

  const zipFileOf = (files: Record<string, string>): File => {
    const encoder = new TextEncoder();
    const entries = Object.fromEntries(
      Object.entries(files).map(([path, content]) => [path, encoder.encode(content)])
    );
    const zipped = zipSync(entries);
    return new File([new Uint8Array(zipped)], 'unit.zip', { type: 'application/zip' });
  };

  const selectZip = async (file: File): Promise<void> => {
    const input = document.createElement('input');
    input.type = 'file';
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    await component.onZipSelected({ target: input } as unknown as Event);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TetfolioPropertiesComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TetfolioPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = { type: 'tetfolio', htmlContent: '' };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  // The spies sit on a static method, so a failed expectation must not leave one in place.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pack a valid zip and emit the html content', async () => {
    await selectZip(zipFileOf({
      'tetfolio.fu-berlin.de/web/123.html': '<html><body><p>unit</p></body></html>'
    }));
    expect(component.processingError).toBeNull();
    expect(emitted).toHaveLength(1);
    expect(emitted[0].property).toBe('htmlContent');
    expect(emitted[0].value).toContain('<p>unit</p>');
  });

  it('should report an error for a zip without html entry', async () => {
    await selectZip(zipFileOf({ 'style.css': 'body {}' }));
    expect(component.processingError).toBe('tetfolioZipNoHtml');
    expect(emitted).toHaveLength(0);
  });

  it('should report an error for a file that is no zip', async () => {
    await selectZip(new File(['not a zip'], 'broken.zip'));
    expect(component.processingError).toContain('tetfolioZipError');
    expect(emitted).toHaveLength(0);
  });

  it('should hand the bytes of the selected file to the distpacker', async () => {
    const packSpy = vi.spyOn(Distpacker, 'packZip').mockResolvedValue('<html>packed</html>');
    const zip = zipFileOf({ 'tetfolio.fu-berlin.de/web/123.html': '<html></html>' });
    await selectZip(zip);
    expect(packSpy).toHaveBeenCalledWith(new Uint8Array(await zip.arrayBuffer()));
    expect(emitted).toEqual([{ property: 'htmlContent', value: '<html>packed</html>' }]);
  });

  it('should report a failure of the distpacker as an error', async () => {
    vi.spyOn(Distpacker, 'packZip').mockRejectedValue(new Error('broken'));
    await selectZip(zipFileOf({ 'tetfolio.fu-berlin.de/web/123.html': '<html></html>' }));
    expect(component.processingError).toContain('tetfolioZipError');
    expect(component.isProcessing).toBe(false);
    expect(emitted).toHaveLength(0);
  });

  it('should reset the processing flag after the upload', async () => {
    await selectZip(zipFileOf({
      'tetfolio.fu-berlin.de/web/123.html': '<html><body></body></html>'
    }));
    expect(component.isProcessing).toBe(false);
  });
});

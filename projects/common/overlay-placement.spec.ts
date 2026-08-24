/* eslint-disable max-classes-per-file -- the host component and the module that gives it
   its template scope belong together in this spec. */
import {
  Component, NgModule, Provider, TemplateRef, ViewChild
} from '@angular/core';
import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { OVERLAY_DEFAULT_CONFIG, OverlayModule } from '@angular/cdk/overlay';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

/**
 * Since CDK 21 an overlay renders through the native popover API next to its trigger instead
 * of being moved into the `.cdk-overlay-container` on the body, which both app modules switch
 * off through OVERLAY_DEFAULT_CONFIG (#986).
 *
 * The e2e suite only covers the overlays it happens to open - a `matTooltip` that is merely
 * rendered has never produced an overlay at all - so the four kinds the player and the editor
 * use are opened here directly: the ones CDK decides for on its own (`mat-menu`, `matTooltip`
 * and `cdkConnectedOverlay`, the last standing in for the floating keypad, the marking bar and
 * the print label) and the one that reads the token itself (`mat-select`). `MatDialog` is in
 * because a globally positioned overlay takes a different branch than an anchored one
 * (`isInlinePopover` asks for `_popoverLocation !== 'global'`); `MatSnackBar` shares that path.
 */
@Component({
  template: `
    <mat-select><mat-option value="a">A</mat-option></mat-select>

    <button [matMenuTriggerFor]="menu">menu</button>
    <mat-menu #menu="matMenu"><button mat-menu-item>entry</button></mat-menu>

    <span matTooltip="hint">tooltip</span>

    <ng-template #dialogContent>dialog</ng-template>

    <div cdkOverlayOrigin #origin="cdkOverlayOrigin"></div>
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="origin"
                 [cdkConnectedOverlayOpen]="connectedOpen">
      <div class="connected-content">content</div>
    </ng-template>
  `,
  standalone: false
})
class OverlayHostComponent {
  @ViewChild(MatSelect) select!: MatSelect;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild(MatTooltip) tooltip!: MatTooltip;
  @ViewChild('dialogContent') dialogContent!: TemplateRef<unknown>;
  connectedOpen = false;
}

/* The host is declared in a module rather than through `declarations`: its template is compiled
   ahead of the TestBed configuration, so it only sees directives its own module scope names. */
@NgModule({
  declarations: [OverlayHostComponent],
  imports: [MatSelectModule, MatMenuModule, MatTooltipModule, MatDialogModule, OverlayModule]
})
class OverlayHostModule {}

const OVERLAY_KINDS = 5;

const openEveryOverlay = (fixture: ComponentFixture<OverlayHostComponent>): void => {
  const component = fixture.componentInstance;
  component.select.open();
  component.menuTrigger.openMenu();
  component.tooltip.show(0);
  component.connectedOpen = true;
  TestBed.inject(MatDialog).open(component.dialogContent);
  fixture.detectChanges();
  tick(500); // the tooltip shows on a timer even with a zero delay
  fixture.detectChanges();
};

const createHost = async (providers: Provider[]): Promise<ComponentFixture<OverlayHostComponent>> => {
  await TestBed.configureTestingModule({
    imports: [OverlayHostModule],
    providers
  }).compileComponents();
  const fixture = TestBed.createComponent(OverlayHostComponent);
  fixture.detectChanges();
  return fixture;
};

describe('overlay placement', () => {
  let fixture: ComponentFixture<OverlayHostComponent>;

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(container => container.remove());
  });

  describe('with the app modules\' OVERLAY_DEFAULT_CONFIG', () => {
    beforeEach(async () => {
      fixture = await createHost([
        { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } }
      ]);
    });

    it('keeps every overlay out of the popover top layer', fakeAsync(() => {
      openEveryOverlay(fixture);

      expect(document.querySelectorAll('[popover]').length).toBe(0);
      expect(document.querySelectorAll('.cdk-overlay-popover').length).toBe(0);
    }));

    it('puts every overlay into the global overlay container', fakeAsync(() => {
      openEveryOverlay(fixture);

      const panes = Array.from(document.querySelectorAll('.cdk-overlay-pane'));
      expect(panes.length).toBe(OVERLAY_KINDS);
      panes.forEach(pane => {
        expect(pane.closest('.cdk-overlay-container')).not.toBeNull();
      });
    }));
  });

  /* Without the provider these overlays have to land in the top layer instead, otherwise the
     assertions above would also hold for a CDK that never had the popover placement. */
  describe('without it', () => {
    beforeEach(async () => {
      fixture = await createHost([]);
    });

    it('renders the overlays as popovers', fakeAsync(() => {
      openEveryOverlay(fixture);

      expect(document.querySelectorAll('.cdk-overlay-popover').length).toBeGreaterThan(0);
    }));
  });
});

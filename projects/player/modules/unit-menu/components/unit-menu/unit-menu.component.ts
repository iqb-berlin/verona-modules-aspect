import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileService } from 'common/services/file.service';
import {
  PagingMode,
  UnitState,
  VopPageNavigationCommand,
  VopPlayerConfigChangedNotification,
  VopStartCommand
} from 'player/modules/verona/models/verona';
import { Page } from 'common/models/page';
import { Response } from '@iqb/responses';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'aspect-unit-menu',
  templateUrl: './unit-menu.component.html',
  styleUrls: ['./unit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitMenuComponent {
  @Input() scrollPages!: Page[];
  @Input() elementCodes!: (Response & { alias: string })[];
  @Input() stateVariableCodes!: (Response & { alias: string })[];

  private postTarget: Window = window;
  formControl = new FormControl('');

  private vopStartCommandMessage: VopStartCommand = {
    type: 'vopStartCommand',
    sessionId: 'dev',
    unitDefinition: undefined,
    playerConfig: {
      pagingMode: undefined
    },
    unitState: undefined
  };

  private vopPlayerConfigChangedNotificationMessage: VopPlayerConfigChangedNotification = {
    type: 'vopPlayerConfigChangedNotification',
    sessionId: 'dev',
    playerConfig: {
      pagingMode: undefined
    }
  };

  private vopPageNavigationCommandMessage: VopPageNavigationCommand = {
    type: 'vopPageNavigationCommand',
    sessionId: 'dev',
    target: '0'
  };

  async load(pagingMode: PagingMode): Promise<void> {
    await FileService.loadFile(['.json', '.voud']).then(unitDefinition => {
      this.loadUnit(unitDefinition.content, pagingMode, {});
    });
  }

  reloadUnit(): void {
    const elementCodes: Response[] = this.elementCodes
      .map(ec => ({ id: ec.alias, status: ec.status, value: ec.value }));
    const stateVariableCodes: Response[] = this.stateVariableCodes
      .map(sv => ({ id: sv.alias, status: sv.status, value: sv.value }));
    this.vopStartCommandMessage.unitState = {
      dataParts: {
        elementCodes: JSON.stringify(elementCodes),
        stateVariableCodes: JSON.stringify(stateVariableCodes)
      }
    };
    this.setStartPage();
    this.postMessage(this.vopStartCommandMessage);
  }

  goToPage(pageIndex: number) {
    this.vopPageNavigationCommandMessage.target = pageIndex.toString();
    this.postTarget.postMessage(this.vopPageNavigationCommandMessage, '*');
  }

  private setStartPage(): void {
    if (this.formControl.value && this.vopStartCommandMessage.playerConfig) {
      this.vopStartCommandMessage.playerConfig.startPage = this.formControl.value;
    }
  }

  changePagingMode(pagingMode: PagingMode): void {
    this.vopPlayerConfigChangedNotificationMessage.playerConfig.pagingMode = pagingMode;
    this.postMessage(this.vopPlayerConfigChangedNotificationMessage);
  }

  private loadUnit(unitDefinition: string, pagingMode: PagingMode, unitSate: UnitState): void {
    this.vopStartCommandMessage.unitDefinition = unitDefinition;
    this.vopStartCommandMessage.playerConfig = { pagingMode };
    this.setStartPage();
    this.vopStartCommandMessage.unitState = unitSate;
    this.postMessage(this.vopStartCommandMessage);
  }

  private postMessage(message: VopStartCommand | VopPageNavigationCommand | VopPlayerConfigChangedNotification): void {
    this.postTarget.postMessage(message, '*');
  }
}

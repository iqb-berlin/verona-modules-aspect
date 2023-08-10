import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FileService } from 'common/services/file.service';
import {
  ElementCode,
  PagingMode,
  UnitState,
  VopContinueCommand,
  VopGetStateRequest,
  VopPageNavigationCommand,
  VopStartCommand,
  VopStopCommand
} from 'player/modules/verona/models/verona';
import { Page } from 'common/models/page';

@Component({
  selector: 'aspect-unit-menu',
  templateUrl: './unit-menu.component.html',
  styleUrls: ['./unit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitMenuComponent {
  @Input() scrollPages!: Page[];
  @Input() elementCodes!: ElementCode[];
  @Input() stateVariableCodes!: ElementCode[];

  private postTarget: Window = window;

  private vopStartCommandMessage: VopStartCommand = {
    type: 'vopStartCommand',
    sessionId: 'dev',
    unitDefinition: undefined,
    playerConfig: {
      pagingMode: undefined
    },
    unitState: undefined
  };

  private vopPageNavigationCommandMessage: VopPageNavigationCommand = {
    type: 'vopPageNavigationCommand',
    sessionId: 'dev',
    target: '0'
  };

  private vopStopCommandMessage: VopStopCommand = {
    type: 'vopStopCommand',
    sessionId: 'dev'
  };

  private vopContinueCommandMessage: VopContinueCommand = {
    type: 'vopContinueCommand',
    sessionId: 'dev'
  };

  private vopGetStateRequestMessage: VopGetStateRequest = {
    type: 'vopGetStateRequest',
    sessionId: 'dev',
    stop: true
  };

  async load(pagingMode: PagingMode): Promise<void> {
    await this.loadUnit(await FileService.loadFile(['.json', '.voud']), pagingMode, {});
  }

  reloadUnit(): void {
    this.vopStartCommandMessage.unitState = {
      dataParts: {
        elementCodes: JSON.stringify(this.elementCodes),
        stateVariableCodes: JSON.stringify(this.stateVariableCodes)
      }
    };
    this.postMessage(this.vopStartCommandMessage);
  }

  goToPage(pageIndex: number) {
    this.vopPageNavigationCommandMessage.target = pageIndex.toString();
    this.postTarget.postMessage(this.vopPageNavigationCommandMessage, '*');
  }

  stop() {
    this.postTarget.postMessage(this.vopStopCommandMessage, '*');
  }

  continue() {
    this.postTarget.postMessage(this.vopContinueCommandMessage, '*');
  }

  request() {
    this.postTarget.postMessage(this.vopGetStateRequestMessage, '*');
  }

  private loadUnit(unitDefinition: string, pagingMode: PagingMode, unitSate: UnitState): void {
    this.vopStartCommandMessage.unitDefinition = unitDefinition;
    this.vopStartCommandMessage.playerConfig = { pagingMode };
    this.vopStartCommandMessage.unitState = unitSate;
    this.postMessage(this.vopStartCommandMessage);
  }

  private postMessage = (message: VopStartCommand | VopPageNavigationCommand): void => {
    this.postTarget.postMessage(message, '*');
  };
}

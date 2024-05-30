import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  commandList: HistoryEntry[] = [];

  addCommand(command: UnitUpdateCommand, deletedData: Record<string, unknown>): void {
    this.commandList.push({ ...command, deletedData: deletedData });
  }

  rollback(): void {
    const lastCommand = this.commandList[this.commandList.length - 1];
    lastCommand.rollback(lastCommand.deletedData);
    this.commandList.splice(this.commandList.length - 1, 1);
  }
}

export interface UnitUpdateCommand {
  title: string;
  command: () => Record<string, unknown> | Promise<Record<string, unknown>>;
  rollback: (deletedData: Record<string, unknown>) => void;
}

interface HistoryEntry extends UnitUpdateCommand {
  deletedData: Record<string, unknown>
}

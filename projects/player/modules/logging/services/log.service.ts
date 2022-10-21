import { Injectable } from '@angular/core';

export enum LogLevel { DEBUG = 1, INFO = 2, WARN = 3, ERROR = 4, NONE = 5}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  static level: LogLevel = 2;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static error(...args: any[]): void {
    if (LogService.level <= LogLevel.ERROR) {
      window.console.error.apply(console, args);
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static warn(...args: any[]): void {
    if (LogService.level <= LogLevel.WARN) {
      window.console.warn.apply(console, args);
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static info(...args: any[]): void {
    if (LogService.level <= LogLevel.INFO) {
      window.console.info.apply(console, args);
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static debug(...args: any[]): void {
    if (LogService.level <= LogLevel.DEBUG) {
      window.console.log.apply(console, args);
    }
  }
}

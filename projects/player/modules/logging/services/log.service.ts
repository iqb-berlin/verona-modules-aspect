import { Injectable } from '@angular/core';

export enum LogLevel { LOG = 0, INFO = 1, WARN = 2, ERROR = 3, NONE = 4}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  static level: LogLevel = 3;

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static error(...args: any[]): void {
    if (LogService.level <= LogLevel.ERROR) {
      window.console.error.apply( console, args );
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static warn(...args: any[]): void {
    if (LogService.level <= LogLevel.WARN) {
      window.console.warn.apply( console, args );
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static info(...args: any[]): void {
    if (LogService.level <= LogLevel.INFO) {
      window.console.info.apply( console, args );
    }
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  static log(...args: any[]): void {
    if (LogService.level <= LogLevel.LOG) {
      window.console.log.apply( console, args );
    }
  }
}

import { Injectable } from '@angular/core';

export enum LogLevels { LOG = 0, INFO = 1, WARN = 2, ERROR = 3, NONE = 4}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  static level: LogLevels = 0;

  static error(...args: any[]): void {
    if (LogService.level >= LogLevels.ERROR) {
      window.console.error.apply( console, args );
    }
  }

  static warn(...args: any[]): void {
    if (LogService.level >= LogLevels.WARN) {
      window.console.warn.apply( console, args );
    }
  }

  static info(...args: any[]): void {
    if (LogService.level >= LogLevels.INFO) {
      window.console.info.apply( console, args );
    }
  }

  static log(...args: any[]): void {
    if (LogService.level >= LogLevels.LOG) {
      window.console.info.apply( console, args );
    }
  }
}

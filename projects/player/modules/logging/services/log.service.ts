import { Injectable } from '@angular/core';

export enum LogLevel { LOG = 0, INFO = 1, WARN = 2, ERROR = 3, NONE = 4}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  static level: LogLevel = 1;

  static error(...args: any[]): void {
    if (LogService.level >= LogLevel.ERROR) {
      window.console.error.apply( console, args );
    }
  }

  static warn(...args: any[]): void {
    if (LogService.level >= LogLevel.WARN) {
      window.console.warn.apply( console, args );
    }
  }

  static info(...args: any[]): void {
    if (LogService.level >= LogLevel.INFO) {
      window.console.info.apply( console, args );
    }
  }

  static log(...args: any[]): void {
    if (LogService.level >= LogLevel.LOG) {
      window.console.info.apply( console, args );
    }
  }
}

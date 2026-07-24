export class IDError extends Error {
  highSeverity: boolean = false;

  constructor(message: string, public code?: number, highSeverity: boolean = false) {
    super(message);
    this.name = 'IDError';
    this.highSeverity = highSeverity;
  }
}

/**
 * The user closed a dialog that was part of adding an element, so nothing is added and nothing is
 * said -- the cancellation is the answer. It is an error class rather than the string it used to be
 * because the caller now tells the two outcomes apart: everything that is NOT this is a failure the
 * user has to be told about (#1296).
 */
export class DialogCanceledError extends Error {
  constructor() {
    super('Dialog canceled');
    this.name = 'DialogCanceledError';
  }
}

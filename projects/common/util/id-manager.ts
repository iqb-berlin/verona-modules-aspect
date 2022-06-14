export class IDManager {
  private static instance: IDManager;

  givenIDs: string[] = [];
  private idCounter: Record<string, number> = {
    text: 0,
    button: 0,
    'text-field': 0,
    'text-field-simple': 0,
    'number-field': 0,
    'text-area': 0,
    checkbox: 0,
    dropdown: 0,
    radio: 0,
    image: 0,
    audio: 0,
    video: 0,
    likert: 0,
    'likert-row': 0,
    slider: 0,
    'spell-correct': 0,
    'radio-group-images': 0,
    'drop-list': 0,
    'drop-list-simple': 0,
    cloze: 0,
    frame: 0,
    'toggle-button': 0,
    value: 0
  };

  static getInstance() {
    return this.instance || (this.instance = new this());
  }

  getNewID(type: string): string {
    if (!type) {
      throw Error('ID-Service: No type given!');
    }
    do {
      this.idCounter[type] += 1;
    } while (!this.isIdAvailable(`${type}_${this.idCounter[type]}`));
    return `${type}_${this.idCounter[type]}`;
  }

  addID(id: string): void {
    this.givenIDs.push(id);
  }

  isIdAvailable(value: string): boolean {
    return !this.givenIDs.includes(value);
  }

  /* Remove ID from givenIDs, so it can be used again. */
  removeId(id: string): void {
    this.givenIDs.splice(this.givenIDs.indexOf(id, 0), 1);
  }

  reset(): void {
    Object.keys(this.idCounter).forEach(counter => {
      this.idCounter[counter] = 0;
    });
    this.givenIDs = [];
  }
}

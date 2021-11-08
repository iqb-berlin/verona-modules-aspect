export class IdService {
  private static instance: IdService;

  private givenIDs: string[] = [];
  private idCounter: Record<string, number> = {
    text: 0,
    button: 0,
    'text-field': 0,
    'number-field': 0,
    'text-area': 0,
    checkbox: 0,
    dropdown: 0,
    radio: 0,
    image: 0,
    audio: 0,
    video: 0,
    likert: 0,
    likert_row: 0,
    'radio-group-images': 0
  };

  static getInstance(): IdService {
    if (!IdService.instance) {
      IdService.instance = new IdService();
    }
    return IdService.instance;
  }

  getNewID(type: string): string {
    do {
      this.idCounter[type] += 1;
    }
    while (!this.isIdAvailable(`${type}_${this.idCounter[type]}`));
    this.givenIDs.push(`${type}_${this.idCounter[type]}`);
    return `${type}_${this.idCounter[type]}`;
  }

  addID(id: string): void {
    this.givenIDs.push(id);
  }

  isIdAvailable(value: string): boolean {
    return !this.givenIDs.includes(value);
  }

  addId(id: string): void {
    this.givenIDs.push(id);
  }

  removeId(id: string): void {
    const index = this.givenIDs.indexOf(id, 0);
    if (index > -1) {
      this.givenIDs.splice(index, 1);
    }
  }
}

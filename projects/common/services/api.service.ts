/**
 * The one thing `common` needs from whichever application it is running in: where to load files from.
 * The editor answers it from its `VeronaAPIService`, the player from its `MetaDataService`, and code in
 * `common` stays free of both.
 */
export abstract class APIService {
  abstract getResourceURL(): string;
}

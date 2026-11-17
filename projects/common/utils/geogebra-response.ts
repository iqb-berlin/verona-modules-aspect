// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import {
  strFromU8, strToU8, unzipSync, zipSync, Unzipped
} from 'fflate/browser';

/**
 * The answer of a geometry element: a ggb archive that holds the construction, `geogebra.xml`, and
 * nothing else (#1650). The settings, the script, the custom tools and the pictures of the GeoGebra file
 * are in the unit already, and every state the player sends holds every answer of the unit: with the
 * whole file as the answer, a file with a picture of 1.4 MB made each of them 1.9 MB, whichever element
 * had changed.
 *
 * A picture the person inserts with GeoGebra's tool "Bild" is not part of the answer either. It stays
 * while the unit is shown and is missing once the answer is restored, as when the person comes back to
 * the unit. No test has used that tool so far; carrying such pictures would mean asking GeoGebra for its
 * whole file again, which takes about 70 ms with a picture of 1.4 MB.
 *
 * The answer stays a ggb archive rather than the XML as text. Hosts and coding tools recognize a
 * GeoGebra answer by the zip header (`UEsD` in base64), the variable info calls it `GGB_FILE`, and packed
 * it is smaller than the whole file was even without a picture -- the XML as text would be larger.
 *
 * An answer is restored by loading the unit's file with the answer's files put in
 * (`restoredDefinition`): the answer alone would lack the pictures, the settings and the custom tools.
 * An answer saved before #1650 is a whole ggb file and goes the same way.
 */
export class GeoGebraResponse {
  private static readonly CONSTRUCTION = 'geogebra.xml';

  /** Every archive written here gets this date. With the current time, every report would differ from
   * the one before in the timestamp alone, and a device whose clock stands before 1980 -- where one with a
   * flat clock battery starts -- would make fflate throw. The earliest date a zip can hold. */
  private static readonly FILE_DATE = new Date(1980, 0, 1);

  /** The answer to a construction, as an applet's `getXML` hands it out. */
  static fromConstruction(xml: string): string {
    return GeoGebraResponse.toBase64(zipSync(
      { [GeoGebraResponse.CONSTRUCTION]: strToU8(xml) },
      { mtime: GeoGebraResponse.FILE_DATE }
    ));
  }

  /** The answer before the first edit: the construction of the unit's own file. Empty when the unit has
   * no file, or one that cannot be read. */
  static fromDefinition(appDefinition: string): string {
    const xml = GeoGebraResponse.construction(appDefinition);
    return xml ? GeoGebraResponse.fromConstruction(xml) : '';
  }

  /**
   * The ggb file that shows an answer: the unit's file with every file of the answer put in, its
   * construction in place of the unit's. Loading it restores the answer as loading the whole answer did
   * before #1650: objects, values and the exported picture come out the same (measured in GeoGebra
   * 5.4.916). Undefined when the answer holds no construction that can be read; the applet then shows
   * the unit's file.
   *
   * Undefined as well for an answer that is the unit's own construction and nothing else, as that of an
   * element nobody has worked on: the unit's file shows the same, and loading it as it is spares
   * unpacking and packing its pictures, some 50 to 90 ms with a picture of 1.4 MB on every load.
   *
   * Not `evalXML` over the unit's construction, although that would keep the random numbers, which
   * loading a file draws anew, and what the unit's `ggbOnInit` set up on its objects: it keeps the unit's
   * definition of a number or truth value the person changed, so a slider made by typing `a = 5` came
   * back at 5, and the algebra view went on showing the old coordinates of a moved point.
   *
   * Stored rather than packed: the file only goes to GeoGebra, and packing a picture of 1.4 MB anew takes
   * longer than everything else here.
   */
  static restoredDefinition(response: string, appDefinition: string): string | undefined {
    const answer = GeoGebraResponse.unzip(response, () => true);
    const construction = answer[GeoGebraResponse.CONSTRUCTION];
    if (!construction) return undefined;
    if (Object.keys(answer).length === 1 &&
      strFromU8(construction) === GeoGebraResponse.construction(appDefinition)) return undefined;
    const unit = GeoGebraResponse.unzip(appDefinition, () => true);
    return GeoGebraResponse.toBase64(zipSync({ ...unit, ...answer }, { level: 0, mtime: GeoGebraResponse.FILE_DATE }));
  }

  /** The construction an archive holds, its `geogebra.xml`. Empty when there is none or the archive
   * cannot be read. */
  private static construction(archive: string): string {
    const entry = GeoGebraResponse.unzip(archive, name => name === GeoGebraResponse.CONSTRUCTION)[
      GeoGebraResponse.CONSTRUCTION];
    return entry ? strFromU8(entry) : '';
  }

  /** The files of an archive that `wanted` asks for; none when it cannot be read. */
  private static unzip(archive: string, wanted: (name: string) => boolean): Unzipped {
    if (!archive) return {};
    try {
      return unzipSync(GeoGebraResponse.fromBase64(archive), { filter: file => wanted(file.name) });
    } catch {
      return {};
    }
  }

  /**
   * Takes a data URL as well as plain base64: the editor stores a ggb file uploaded to an element or to
   * the geometry assistant as a data URL (`readAsDataURL`), one pasted as text as plain base64, and
   * GeoGebra loads either.
   *
   * A loop rather than `Uint8Array.from` with a mapping function, which calls the function for every
   * byte: for a unit file with a picture of 1.4 MB that took about 90 ms, the loop a fraction of it.
   */
  private static fromBase64(archive: string): Uint8Array {
    const binary = atob(archive.replace(/^data:[^,]*;base64,/, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  /** In chunks: spread into one call, the bytes of a large picture exceed the arguments a call can take. */
  private static toBase64(bytes: Uint8Array): string {
    const chunkSize = 0x8000;
    const chunks = Array.from(
      { length: Math.ceil(bytes.length / chunkSize) },
      (_, index) => String.fromCharCode(...bytes.subarray(index * chunkSize, (index + 1) * chunkSize))
    );
    return btoa(chunks.join(''));
  }
}

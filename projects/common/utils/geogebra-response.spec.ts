// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import {
  strFromU8, strToU8, unzipSync, zipSync
} from 'fflate/browser';
import { GeoGebraResponse } from 'common/utils/geogebra-response';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

/** A ggb file, as the editor stores it in the unit. */
const archiveOf = (files: Record<string, string>): string => toBase64(zipSync(Object.fromEntries(
  Object.entries(files).map(([name, content]) => [name, strToU8(content)])
)));

const contentsOf = (archive: string): Record<string, string> => Object.fromEntries(
  Object.entries(unzipSync(Uint8Array.from(atob(archive), character => character.charCodeAt(0))))
    .map(([name, content]) => [name, strFromU8(content)])
);

const unitConstruction = '<geogebra><construction><element type="point" label="A"/></construction></geogebra>';
const edited = '<geogebra>edited</geogebra>';

/** A whole ggb file with everything GeoGebra puts into one, and a picture. */
const unitFiles = {
  'geogebra.xml': unitConstruction,
  'geogebra_defaults2d.xml': '<defaults/>',
  'geogebra_defaults3d.xml': '<defaults/>',
  'geogebra_javascript.js': 'function ggbOnInit() {}',
  'geogebra_thumbnail.png': 'thumbnail',
  'xx/unit.png': 'unit picture'
};
const unitFile = archiveOf(unitFiles);
/** The same file uploaded in the editor, which stores it as `readAsDataURL` reads it. */
const uploadedUnitFile = `data:application/vnd.geogebra.file;base64,${unitFile}`;

describe('GeoGebraResponse', () => {
  describe('the answer (#1650)', () => {
    it('should be a ggb archive with the construction alone, which coding tools tell by its zip header', () => {
      const answer = GeoGebraResponse.fromConstruction(unitConstruction);

      expect(contentsOf(answer)).toEqual({ 'geogebra.xml': unitConstruction });
      expect(answer.startsWith('UEsD')).toBe(true);
    });

    it('should be the same answer for the same construction, whenever it is given', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0));
        const first = GeoGebraResponse.fromConstruction(unitConstruction);
        vi.setSystemTime(new Date(2026, 5, 1, 12, 30, 0));
        const later = GeoGebraResponse.fromConstruction(unitConstruction);

        expect(later).toBe(first);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should start out as the construction of the unit\'s file, without settings, script or pictures', () => {
      expect(contentsOf(GeoGebraResponse.fromDefinition(unitFile))).toEqual({ 'geogebra.xml': unitConstruction });
    });

    it('should start out empty for a unit without a file or with one that cannot be read', () => {
      expect(GeoGebraResponse.fromDefinition('')).toBe('');
      expect(GeoGebraResponse.fromDefinition('no archive')).toBe('');
    });
  });

  describe('restoring an answer (#1650)', () => {
    it('should put the answer\'s construction into the unit\'s file, keeping all else it has', () => {
      const restored = GeoGebraResponse.restoredDefinition(archiveOf({ 'geogebra.xml': edited }), unitFile);

      expect(contentsOf(restored ?? '')).toEqual({ ...unitFiles, 'geogebra.xml': edited });
    });

    it('should load an answer given before #1650, a whole ggb file, as it is', () => {
      const answer = archiveOf({
        ...unitFiles, 'geogebra.xml': edited, 'geogebra_thumbnail.png': 'edited thumbnail'
      });

      expect(contentsOf(GeoGebraResponse.restoredDefinition(answer, unitFile) ?? '')).toEqual(contentsOf(answer));
    });

    it('should answer and restore on a device whose clock stands before 1980, which a zip cannot hold', () => {
      const answer = archiveOf({ 'geogebra.xml': edited });
      vi.useFakeTimers({ toFake: ['Date'] });
      try {
        vi.setSystemTime(new Date(1970, 0, 1));

        expect(() => GeoGebraResponse.fromConstruction(edited)).not.toThrow();
        expect(() => GeoGebraResponse.restoredDefinition(answer, unitFile)).not.toThrow();
      } finally {
        vi.useRealTimers();
      }
    });

    /* The answer of an element nobody has worked on: loading the unit's file as it is spares unpacking and
       packing its pictures. */
    it('should leave the unit\'s file as it is for an answer that is the unit\'s own construction', () => {
      expect(GeoGebraResponse.restoredDefinition(GeoGebraResponse.fromDefinition(unitFile), unitFile))
        .toBeUndefined();
      expect(GeoGebraResponse.restoredDefinition(GeoGebraResponse.fromDefinition(uploadedUnitFile), uploadedUnitFile))
        .toBeUndefined();
    });

    /* Before #1650 an element nobody had worked on stored the unit's whole file of that time, which is
       loaded as it is, as then. */
    it('should still load an answer given before #1650 with the unit\'s construction but other files', () => {
      const answer = archiveOf({ ...unitFiles, 'xx/unit.png': 'earlier picture' });

      expect(contentsOf(GeoGebraResponse.restoredDefinition(answer, unitFile) ?? '')).toEqual(contentsOf(answer));
    });

    it('should restore nothing from an answer that holds no construction that can be read', () => {
      expect(GeoGebraResponse.restoredDefinition('UEsDBBQ', unitFile)).toBeUndefined();
      expect(GeoGebraResponse.restoredDefinition(archiveOf({ 'other.xml': '<x/>' }), unitFile)).toBeUndefined();
    });
  });

  describe('a unit file uploaded in the editor, stored as a data URL', () => {
    it('should start out as the construction of the unit\'s file', () => {
      expect(contentsOf(GeoGebraResponse.fromDefinition(uploadedUnitFile)))
        .toEqual({ 'geogebra.xml': unitConstruction });
    });

    it('should restore the answer into the unit\'s file, keeping its script and pictures', () => {
      const restored = GeoGebraResponse.restoredDefinition(archiveOf({ 'geogebra.xml': edited }), uploadedUnitFile);

      expect(contentsOf(restored ?? '')).toEqual({ ...unitFiles, 'geogebra.xml': edited });
    });
  });
});

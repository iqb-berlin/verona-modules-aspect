import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { IDService } from 'editor/src/app/services/id.service';
import { AliasRefusalPipe } from 'editor/src/app/modules/properties-panel/pipes/alias-refusal.pipe';

describe('AliasRefusalPipe', () => {
  let idService: SpyObj<IDService>;
  let pipe: AliasRefusalPipe;

  beforeEach(() => {
    idService = createSpyObj<IDService>(['isAliasAvailable']);
    idService.isAliasAvailable.mockReturnValue(true);
    pipe = new AliasRefusalPipe(idService);
  });

  it('should say nothing before anything was typed, or when the element took what was typed', () => {
    expect(pipe.transform(null, 'erstes')).toBeNull();
    expect(pipe.transform('erstes', 'erstes')).toBeNull();
    expect(idService.isAliasAvailable).not.toHaveBeenCalled();
  });

  /* The element keeps its alias when it refuses one, the field keeps the typed text (#1523). */
  it('should name the reason of a typed name the element refused', () => {
    expect(pipe.transform('März', 'maerz')).toBe('idContainsInvalidCharacters');
    expect(pipe.transform('mit leer', 'maerz')).toBe('idContainsSpace');

    idService.isAliasAvailable.mockReturnValue(false);
    expect(pipe.transform('zweites', 'erstes')).toBe('idTaken');
    expect(idService.isAliasAvailable).toHaveBeenCalledWith('zweites', 'erstes');
  });
});

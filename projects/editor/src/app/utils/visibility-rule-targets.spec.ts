import { TextElement } from 'common/models/elements/text';
import { ImageElement } from 'common/models/elements/image';
import { ButtonElement } from 'common/models/elements/button';
import { TextAreaMathElement } from 'common/models/elements/text-area-math';
import { GeometryElement } from 'common/models/elements/geometry';
import { VisibilityRuleOperators } from 'common/models/visibility-rule';
import { VisibilityRuleTargets } from './visibility-rule-targets';

describe('VisibilityRuleTargets', () => {
  describe('isOffered (#1718)', () => {
    it('should offer elements that report an answer, and no button', () => {
      expect(VisibilityRuleTargets.isOffered(new TextAreaMathElement({ type: 'text-area-math', id: 'a', alias: 'a' })))
        .toBe(true);
      expect(VisibilityRuleTargets.isOffered(new ButtonElement({ type: 'button', id: 'b', alias: 'b' }))).toBe(false);
    });

    it('should offer a text only when it can be marked', () => {
      expect(VisibilityRuleTargets.isOffered(new TextElement({ type: 'text', id: 't', alias: 't' }))).toBe(false);
      const markable = new TextElement({ type: 'text', id: 't', alias: 't' });
      markable.highlightableYellow = true;
      expect(VisibilityRuleTargets.isOffered(markable)).toBe(true);
    });

    it('should offer an image only when it has a magnifier', () => {
      expect(VisibilityRuleTargets.isOffered(new ImageElement({ type: 'image', id: 'i', alias: 'i' }))).toBe(false);
      const withMagnifier = new ImageElement({ type: 'image', id: 'i', alias: 'i' });
      withMagnifier.magnifier = true;
      expect(VisibilityRuleTargets.isOffered(withMagnifier)).toBe(true);
    });

    it('should offer a drawing, of which only a change can be asked', () => {
      expect(VisibilityRuleTargets.isOffered(new GeometryElement({ type: 'geometry', id: 'g', alias: 'g' })))
        .toBe(true);
    });
  });

  describe('kindOf and operatorsFor (#1718)', () => {
    const targets = [
      { id: 'area', alias: 'Formelbereich', type: 'text-area-math' as const },
      { id: 'drawing', alias: 'Geometrie', type: 'geometry' as const },
      { id: 'check', alias: 'Kontrollkästchen', type: 'checkbox' as const },
      { id: 'old', alias: 'ohne Typ' }
    ];
    const operatorsOf = (id: string): string[] => VisibilityRuleTargets
      .operatorsFor(VisibilityRuleTargets.kindOf(id, targets));

    it('should offer a formula area every operator', () => {
      expect(operatorsOf('area')).toEqual(VisibilityRuleOperators);
    });

    it('should offer a drawing only whether it has been changed', () => {
      expect(operatorsOf('drawing')).toEqual(['changed', 'notChanged']);
    });

    it('should offer a checkbox no size comparison', () => {
      expect(operatorsOf('check')).toEqual(['answered', 'notAnswered', 'changed', 'notChanged', '=', '≠']);
    });

    it('should offer every operator for a target of unknown type or one not in the list', () => {
      expect(operatorsOf('old')).toEqual(VisibilityRuleOperators);
      expect(operatorsOf('deleted')).toEqual(VisibilityRuleOperators);
    });
  });
});

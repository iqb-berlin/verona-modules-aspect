import { addElement, setCheckbox } from '../../util';

/**
 * Adds a marking panel element and configures its highlightable colors.
 * @param colors Object containing color flags (yellow, turquoise, orange)
 * @param id Optional ID for the element
 */
export function addMarkingPanel(colors: { yellow?: boolean, turquoise?: boolean, orange?: boolean }, id?: string): void {
    addElement('Textmarkierung', 'Sonstige', id);

    if (colors.yellow !== undefined) {
        // Yellow is true by default, so we only toggle if explicitly false
        if (!colors.yellow) setCheckbox('Gelb');
    }
    if (colors.turquoise) setCheckbox('Türkis');
    if (colors.orange) setCheckbox('Orange');
}

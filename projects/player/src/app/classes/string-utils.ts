/**
 * Converts a string between the four notations the interfaces around the player use: camelCase,
 * UPPER_SNAKE_CASE, kebab-case and PascalCase, in every direction.
 *
 * What holds for all twelve, and what the individual names do not say:
 *
 * - An empty string is returned as it is; nothing else is treated as a special case, and no input is
 *   rejected. A string already in the target notation usually passes through unchanged, but nothing
 *   checks that the input is in the notation the method name claims.
 * - Every capital counts as a word boundary, so an acronym is split letter by letter:
 *   `camelCaseToUpperSnakeCase('parseXMLValue')` gives `PARSE_X_M_L_VALUE`. Between camelCase and
 *   UPPER_SNAKE_CASE that is lossless -- the way back restores `parseXMLValue`.
 * - The two `camelCaseTo…` methods make no exception for the first letter, so a PascalCase string
 *   handed to them comes back with a leading separator: `ParseXml` gives `_PARSE_XML`. Only
 *   `pascalCaseTo…` spares the first capital.
 * - Digits are not boundaries in one direction and are in the other: `item2Value` becomes
 *   `ITEM2_VALUE`, while `ITEM_2_VALUE` comes back as `item2Value`. A round trip that starts from
 *   the snake side can therefore lose an underscore.
 */
export class StringUtils {
  // camelCase conversions
  static camelCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
  }

  static camelCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  static camelCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // UPPER_SNAKE_CASE conversions
  static upperSnakeCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  static upperSnakeCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/_/g, '-');
  }

  static upperSnakeCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.toLowerCase().replace(/(^|_)([a-z0-9])/g, (_, __, letter) => letter.toUpperCase());
  }

  // kebab-case conversions
  static kebabCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  static kebabCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/-/g, '_').toUpperCase();
  }

  static kebabCaseToPascalCase(str: string): string {
    if (!str) return str;
    return str.replace(/(^|-)([a-z0-9])/g, (_, __, letter) => letter.toUpperCase());
  }

  // PascalCase conversions
  static pascalCaseToCamelCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  static pascalCaseToUpperSnakeCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, (letter, i) => (i === 0 ? letter : `_${letter}`)).toUpperCase();
  }

  static pascalCaseToKebabCase(str: string): string {
    if (!str) return str;
    return str.replace(/[A-Z]/g, (letter, i) => (i === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`));
  }
}

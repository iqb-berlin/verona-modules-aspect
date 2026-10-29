/**
 * Counts the words of a text the way the projects asked for it (#989): a word is what stands between
 * two stretches of whitespace -- spaces, tabs and line breaks alike -- and only whitespace separates.
 * An apostrophe or a hyphen therefore does not split a word, and `z.B.` is one.
 *
 * A piece counts only if it holds at least one letter or digit, so punctuation standing on its own --
 * a dash between two spaces, a detached exclamation mark or quotation mark -- is not a word, while
 * punctuation attached to a word changes nothing about it.
 */
export class WordCounter {
  static count(text: string): number {
    return text
      .split(/\s+/)
      .filter(piece => /[\p{L}\p{N}]/u.test(piece))
      .length;
  }
}

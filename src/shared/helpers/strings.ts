/**
 * Capitalize the first letter of each word in a string
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Clean target string from special characters and spaces
 * @param str - The string to clean
 * @returns The cleaned string
 */
export function onSetTextFieldValueChanged(str: string | { target: { value: string } }): string {
  if (str && typeof str === 'object' && 'target' in str) {
    return str.target.value;
  }

  return str;
}

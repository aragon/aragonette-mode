/**
 * @desc Checks the URL parameter is a stingified number or "all"
 * @param {string} value - The URL parameter to check.
 */
export function isNumberlikeOrAll(value: string | undefined): boolean {
  if (!value) {
    return false;
  } else if (value === "all") {
    return true;
  } else if (isNaN(Number(value))) {
    return false;
  } else {
    return true;
  }
}

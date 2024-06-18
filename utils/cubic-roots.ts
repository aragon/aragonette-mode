type Options = {
  isZero?: (value: number) => boolean;
};

/**
 * Return whether the value is considered a zero
 */
const defaultIsZero = (value: number) => {
  // Value is so small it doesn't matter, it can happen that the value is nearly 0 due to
  // javascript floating point arithmetic errors
  return Math.abs(value) < 1e-8;
};

/**
 * Calculate the cubic roots of cubic equation: ax^3 + bx^2 + cx + d = 0
 * Based on https://stackoverflow.com/a/27176424
 */
export const calculateCubicRoots = (a = 0, b = 0, c = 0, d = 0, options: Options = {}): number[] => {
  const { isZero = defaultIsZero } = options;

  if (isZero(a)) {
    // Quadratic case ax^2 + bx + c = 0
    a = b;
    b = c;
    c = d;
    if (isZero(a)) {
      // Linear case ax + b = 0
      a = b;
      b = c;
      if (isZero(a)) return [];
      return [-b / a];
    }

    // Quadratic roots are (-b +- sqrt(b^2 - 4ac)) / 2a
    // D = b^2 - 4ac
    const D = b ** 2 - 4 * a * c;
    // When D is zero, we have only one root
    if (isZero(D)) return [-b / (2 * a)];
    if (D > 0) return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
    return [];
  }

  // Convert to depressed cubic form of t^3 + pt + q = 0
  // We can remove the x^2 by substituting x = t - b/3a
  // https://en.wikipedia.org/wiki/Cubic_equation#Depressed_cubic
  // p = (3ac - b^2) / 3a^2
  // q = (2b^3 - 9abc + 27a^2d) / 27a^3
  const p = (3 * a * c - b ** 2) / (3 * a ** 2);
  const q = (2 * b ** 3 - 9 * a * b * c + 27 * a ** 2 * d) / (27 * a ** 3);

  let roots;
  if (isZero(p)) {
    // p = 0 -> t^3 = -q -> t = -q^1/3
    roots = [Math.cbrt(-q)];
  } else if (isZero(q)) {
    // q = 0 -> t^3 + pt = 0 -> t(t^2+p) = 0 -> t = sqrt(-p)
    // Only when p is negative, we have a real roots
    roots = [0, ...(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : [])];
  } else {
    // From the cubic formula cbrt(-q/2 - sqrt(q^2/4 + p^3/27)) + cbrt(-q/2 + sqrt(q^2/4 + p^3/27))
    // D = q^2/4 + p^3/27
    const D = q ** 2 / 4 + p ** 3 / 27;
    if (isZero(D)) {
      // D = 0 -> two roots
      roots = [(-1.5 * q) / p, (3 * q) / p];
    } else if (D > 0) {
      // Only one real root
      const u = Math.cbrt(-q / 2 - Math.sqrt(D));
      roots = [u - p / (3 * u)];
    } else {
      // D < 0, three roots, but needs to use complex numbers/trigonometric solution
      const u = 2 * Math.sqrt(-p / 3);
      const t = Math.acos((3 * q) / p / u) / 3; // D < 0 implies p < 0 and acos argument in [-1..1]
      const k = (2 * Math.PI) / 3;
      roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
    }
  }

  // Convert back from depressed cubic based on substitution to get the real x values
  return roots.map((root) => root - b / (3 * a));
};

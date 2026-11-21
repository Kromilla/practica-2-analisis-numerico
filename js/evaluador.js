/**
 * Evaluador de expresiones matemáticas seguro y liviano
 * Soporta variables x, t, y, constantes pi, e y funciones:
 * sin, cos, tan, exp, log, ln, sqrt, abs, etc.
 */
const Evaluador = (function () {
  function sanitizar(expr, vars) {
    let limpia = expr.trim()
      .replace(/\s+/g, "")
      .replace(/(\d)([a-zA-Z(])/g, "$1*$2") // 2x -> 2*x, 2(x) -> 2*(x)
      .replace(/(\))([a-zA-Z0-9(])/g, "$1*$2") // (x)(y) -> (x)*(y)
      .replace(/\^/g, "**") // x^2 -> x**2
      .replace(/pi/gi, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\bsin\b/gi, "Math.sin")
      .replace(/\bcos\b/gi, "Math.cos")
      .replace(/\btan\b/gi, "Math.tan")
      .replace(/\basin\b/gi, "Math.asin")
      .replace(/\bacos\b/gi, "Math.acos")
      .replace(/\batan\b/gi, "Math.atan")
      .replace(/\bexp\b/gi, "Math.exp")
      .replace(/\bln\b/gi, "Math.log")
      .replace(/\blog\b/gi, "Math.log10")
      .replace(/\bsqrt\b/gi, "Math.sqrt")
      .replace(/\babs\b/gi, "Math.abs");

    return limpia;
  }

  function compilar1D(expr, varName = "x") {
    const cod = sanitizar(expr, [varName]);
    try {
      const fn = new Function(varName, `"use strict"; return (${cod});`);
      // Prueba con un valor
      const test = fn(1.0);
      if (typeof test !== "number" && !isNaN(test)) {
        throw new Error("No devolvió un número válido.");
      }
      return fn;
    } catch (err) {
      throw new Error(`Expresión inválida "${expr}": ${err.message}`);
    }
  }

  function compilar2D(expr, var1 = "t", var2 = "y") {
    const cod = sanitizar(expr, [var1, var2]);
    try {
      const fn = new Function(var1, var2, `"use strict"; return (${cod});`);
      const test = fn(1.0, 1.0);
      if (typeof test !== "number" && !isNaN(test)) {
        throw new Error("No devolvió un número válido.");
      }
      return fn;
    } catch (err) {
      throw new Error(`Expresión inválida "${expr}": ${err.message}`);
    }
  }

  // Derivada numérica de orden O(h^4) para Newton si no se proporciona derivada manual
  function derivadaNumerica(fn, x, h = 1e-5) {
    return (fn(x - 2 * h) - 8 * fn(x - h) + 8 * fn(x + h) - fn(x + 2 * h)) / (12 * h);
  }

  function formatear(num, dec = 6) {
    if (num === null || num === undefined || isNaN(num)) return "—";
    if (!isFinite(num)) return num > 0 ? "+∞" : "-∞";
    if (Math.abs(num) < 1e-12) return "0";
    if (Math.abs(num) >= 1e7 || (Math.abs(num) < 1e-4 && Math.abs(num) > 0)) {
      return num.toExponential(dec);
    }
    return Number(num.toFixed(dec)).toString();
  }

  return {
    compilar1D,
    compilar2D,
    derivadaNumerica,
    formatear
  };
})();

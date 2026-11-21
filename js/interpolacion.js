(function () {
  const metodoSelect = document.getElementById("metodo-interp");
  const seccionPuntos = document.getElementById("seccion-puntos");
  const seccionTaylor = document.getElementById("seccion-taylor");
  const form = document.getElementById("form-interpolacion");
  const btnEjemplo = document.getElementById("btn-ejemplo-interp");
  const contenedorAlerta = document.getElementById("contenedor-alerta");
  const resumenResultado = document.getElementById("resumen-resultado");
  const estadoInicial = document.getElementById("estado-inicial");
  const cajaEvaluacion = document.getElementById("caja-evaluacion");
  const formulaPolinomio = document.getElementById("formula-polinomio");
  const detalleMetodo = document.getElementById("detalle-metodo");

  function actualizarCampos() {
    const m = metodoSelect.value;
    seccionPuntos.style.display = m === "taylor" ? "none" : "block";
    seccionTaylor.style.display = m === "taylor" ? "block" : "none";
  }

  metodoSelect.addEventListener("change", actualizarCampos);

  btnEjemplo.addEventListener("click", () => {
    const m = metodoSelect.value;
    if (m === "taylor") {
      document.getElementById("fx-taylor").value = "exp(x)";
      document.getElementById("x0-taylor").value = "0";
      document.getElementById("grado-taylor").value = "4";
      document.getElementById("punto-eval").value = "0.5";
    } else {
      document.getElementById("puntos-entrada").value = "1, 1.0\n2, 0.5\n4, 0.25\n5, 0.2";
      document.getElementById("punto-eval").value = "3.0";
    }
    form.dispatchEvent(new Event("submit"));
  });

  function parsearPuntos(texto) {
    const lineas = texto.trim().split("\n");
    const pts = [];
    const xs = new Set();
    lineas.forEach((lin, idx) => {
      const l = lin.trim();
      if (!l) return;
      const partes = l.split(/[,;\s]+/).filter(Boolean);
      if (partes.length < 2) throw new Error(`Línea ${idx + 1} inválida: debe tener "x, y".`);
      const x = parseFloat(partes[0]);
      const y = parseFloat(partes[1]);
      if (isNaN(x) || isNaN(y)) throw new Error(`Línea ${idx + 1}: valores numéricos inválidos.`);
      if (xs.has(x)) throw new Error(`El valor de x = ${x} está repetido. Los nodos deben ser distintos.`);
      xs.add(x);
      pts.push({ x, y });
    });
    if (pts.length < 2) throw new Error("Se requieren al menos 2 puntos para interpolar.");
    pts.sort((a, b) => a.x - b.x);
    return pts;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    contenedorAlerta.innerHTML = "";
    resumenResultado.style.display = "none";
    estadoInicial.style.display = "none";

    try {
      const metodo = metodoSelect.value;
      const xEval = parseFloat(document.getElementById("punto-eval").value);
      if (isNaN(xEval)) throw new Error("Ingrese un valor numérico para x*.");

      let res;
      if (metodo === "lagrange") {
        const pts = parsearPuntos(document.getElementById("puntos-entrada").value);
        res = resolverLagrange(pts, xEval);
      } else if (metodo === "newton") {
        const pts = parsearPuntos(document.getElementById("puntos-entrada").value);
        res = resolverNewton(pts, xEval);
      } else if (metodo === "taylor") {
        const expr = document.getElementById("fx-taylor").value;
        const x0 = parseFloat(document.getElementById("x0-taylor").value);
        const n = parseInt(document.getElementById("grado-taylor").value, 10);
        res = resolverTaylor(expr, x0, n, xEval);
      }

      renderizar(res);
    } catch (err) {
      contenedorAlerta.innerHTML = `<div class="alerta error">${err.message}</div>`;
      estadoInicial.style.display = "block";
    }
  });

  function resolverLagrange(pts, xEval) {
    const n = pts.length;
    let yEval = 0;
    const detallesL = [];
    const terminosStr = [];

    for (let i = 0; i < n; i++) {
      let L_i = 1;
      const numTerms = [];
      let denom = 1;

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          L_i *= (xEval - pts[j].x) / (pts[i].x - pts[j].x);
          numTerms.push(`(x - ${pts[j].x})`);
          denom *= (pts[i].x - pts[j].x);
        }
      }

      const contrib = pts[i].y * L_i;
      yEval += contrib;

      detallesL.push({
        i,
        xi: pts[i].x,
        yi: pts[i].y,
        Li_val: L_i,
        contrib
      });

      const signoY = pts[i].y >= 0 ? "+ " : "- ";
      terminosStr.push(`${signoY}${Math.abs(pts[i].y).toFixed(4)}·[${numTerms.join("·")} / ${denom.toFixed(4)}]`);
    }

    const formula = "P(x) = " + terminosStr.join("\n     ");

    // Función evaluadora para graficar
    const fnPolinomio = (x) => {
      let suma = 0;
      for (let i = 0; i < n; i++) {
        let L_i = 1;
        for (let j = 0; j < n; j++) {
          if (i !== j) L_i *= (x - pts[j].x) / (pts[i].x - pts[j].x);
        }
        suma += pts[i].y * L_i;
      }
      return suma;
    };

    return {
      metodo: "Lagrange",
      formula,
      xEval,
      yEval,
      pts,
      detallesL,
      fnPolinomio
    };
  }

  function resolverNewton(pts, xEval) {
    const n = pts.length;
    // Tabla de diferencias divididas: n x n
    const tabla = Array.from({ length: n }, () => Array(n).fill(null));

    for (let i = 0; i < n; i++) {
      tabla[i][0] = pts[i].y;
    }

    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        tabla[i][j] = (tabla[i + 1][j - 1] - tabla[i][j - 1]) / (pts[i + j].x - pts[i].x);
      }
    }

    // Evaluación en xEval
    let yEval = tabla[0][0];
    let mult = 1;
    const terminosStr = [`${tabla[0][0].toFixed(4)}`];

    for (let j = 1; j < n; j++) {
      mult *= (xEval - pts[j - 1].x);
      yEval += tabla[0][j] * mult;

      const factores = pts.slice(0, j).map((p) => `(x - ${p.x})`).join("·");
      const a = tabla[0][j];
      const signo = a >= 0 ? " + " : " - ";
      terminosStr.push(`${signo}${Math.abs(a).toFixed(4)}·${factores}`);
    }

    const formula = "P(x) = " + terminosStr.join("");

    const fnPolinomio = (x) => {
      let val = tabla[0][0];
      let prod = 1;
      for (let j = 1; j < n; j++) {
        prod *= (x - pts[j - 1].x);
        val += tabla[0][j] * prod;
      }
      return val;
    };

    return {
      metodo: "Newton",
      formula,
      xEval,
      yEval,
      pts,
      tablaDD: tabla,
      fnPolinomio
    };
  }

  function resolverTaylor(expr, x0, n, xEval) {
    const fnF = Evaluador.compilar1D(expr, "x");
    const coefs = [];
    const fact = [1];
    for (let i = 1; i <= n + 1; i++) fact[i] = fact[i - 1] * i;

    // Aproximar derivadas sucesivas en x0 usando diferencias finitas
    const h = 1e-3;
    function derivadaK(f, x, k) {
      if (k === 0) return f(x);
      if (k === 1) return (f(x + h) - f(x - h)) / (2 * h);
      if (k === 2) return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
      if (k === 3) return (f(x + 2 * h) - 2 * f(x + h) + 2 * f(x - h) - f(x - 2 * h)) / (2 * h * h * h);
      if (k === 4) return (f(x + 2 * h) - 4 * f(x + h) + 6 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / (h ** 4);
      // Para k > 4 generalizamos
      return (derivadaK(f, x + h, k - 1) - derivadaK(f, x - h, k - 1)) / (2 * h);
    }

    const terminosStr = [];
    let yEval = 0;

    for (let k = 0; k <= n; k++) {
      const d_k = derivadaK(fnF, x0, k);
      const a_k = d_k / fact[k];
      coefs.push({ k, dk: d_k, ak: a_k });

      yEval += a_k * ((xEval - x0) ** k);

      const signo = a_k >= 0 ? (k === 0 ? "" : " + ") : " - ";
      const pot = k === 0 ? "" : k === 1 ? `·(x - ${x0})` : `·(x - ${x0})^${k}`;
      terminosStr.push(`${signo}${Math.abs(a_k).toFixed(4)}${pot}`);
    }

    const formula = `P_${n}(x) = ` + terminosStr.join("");
    const valorReal = fnF(xEval);
    const errorAbs = Math.abs(valorReal - yEval);

    const fnPolinomio = (x) => {
      let suma = 0;
      for (let k = 0; k <= n; k++) {
        suma += coefs[k].ak * ((x - x0) ** k);
      }
      return suma;
    };

    return {
      metodo: "Taylor",
      formula,
      xEval,
      yEval,
      valorReal,
      errorAbs,
      coefs,
      x0,
      fnPolinomio,
      fnOriginal: fnF
    };
  }

  function renderizar(res) {
    resumenResultado.style.display = "block";
    formulaPolinomio.textContent = res.formula;

    let mensajeExito = `
      Valor interpolado en <strong>x* = ${res.xEval}</strong>:
      <strong>P(${res.xEval}) = ${Evaluador.formatear(res.yEval, 6)}</strong>
    `;
    if (res.metodo === "Taylor" && res.valorReal !== undefined) {
      mensajeExito += ` | Valor real f(x*): <strong>${Evaluador.formatear(res.valorReal, 6)}</strong> (Error Abs: <strong>${Evaluador.formatear(res.errorAbs, 6)}</strong>)`;
    }
    cajaEvaluacion.innerHTML = mensajeExito;

    detalleMetodo.innerHTML = "";

    if (res.metodo === "Lagrange") {
      let html = `
        <h3>Detalle de Polinomios Base Lᵢ(x*)</h3>
        <div class="contenedor-tabla">
          <table class="tabla-datos">
            <thead>
              <tr><th>i</th><th>xᵢ</th><th>yᵢ</th><th>Lᵢ(x*)</th><th>Contribución yᵢ·Lᵢ</th></tr>
            </thead>
            <tbody>
      `;
      res.detallesL.forEach((d) => {
        html += `<tr>
          <td>${d.i}</td>
          <td>${Evaluador.formatear(d.xi, 4)}</td>
          <td>${Evaluador.formatear(d.yi, 4)}</td>
          <td>${Evaluador.formatear(d.Li_val, 5)}</td>
          <td>${Evaluador.formatear(d.contrib, 5)}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      detalleMetodo.innerHTML = html;
    } else if (res.metodo === "Newton") {
      const n = res.pts.length;
      let html = `
        <h3>Tabla Triangular de Diferencias Divididas</h3>
        <div class="contenedor-tabla">
          <table class="tabla-datos">
            <thead>
              <tr>
                <th>i</th>
                <th>xᵢ</th>
                <th>f[xᵢ]</th>
                ${Array.from({ length: n - 1 }, (_, k) => `<th>Orden ${k + 1}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
      `;
      for (let i = 0; i < n; i++) {
        html += `<tr>
          <td>${i}</td>
          <td>${Evaluador.formatear(res.pts[i].x, 4)}</td>
        `;
        for (let j = 0; j < n - i; j++) {
          const val = res.tablaDD[i][j];
          const esCoef = i === 0;
          html += `<td style="${esCoef ? 'font-weight:bold; color:var(--primario); background:#eef8f2;' : ''}">${Evaluador.formatear(val, 5)}</td>`;
        }
        for (let j = n - i; j < n; j++) {
          html += `<td>—</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table></div>`;
      detalleMetodo.innerHTML = html;
    } else if (res.metodo === "Taylor") {
      let html = `
        <h3>Términos del Polinomio de Taylor alrededor de x₀ = ${res.x0}</h3>
        <div class="contenedor-tabla">
          <table class="tabla-datos">
            <thead>
              <tr><th>Grado k</th><th>f⁽ᵏ⁾(x₀)</th><th>Coeficiente aₖ = f⁽ᵏ⁾/k!</th><th>Término aₖ(x - x₀)ᵏ evaluado</th></tr>
            </thead>
            <tbody>
      `;
      res.coefs.forEach((c) => {
        const valTerm = c.ak * ((res.xEval - res.x0) ** c.k);
        html += `<tr>
          <td>${c.k}</td>
          <td>${Evaluador.formatear(c.dk, 5)}</td>
          <td>${Evaluador.formatear(c.ak, 5)}</td>
          <td>${Evaluador.formatear(valTerm, 5)}</td>
        </tr>`;
      });
      html += `</tbody></table></div>`;
      detalleMetodo.innerHTML = html;
    }

    // Gráfica
    let xMin, xMax;
    const puntosDestacados = [];
    if (res.pts) {
      xMin = Math.min(...res.pts.map((p) => p.x), res.xEval) - 1;
      xMax = Math.max(...res.pts.map((p) => p.x), res.xEval) + 1;
      res.pts.forEach((p, idx) => {
        puntosDestacados.push({ x: p.x, y: p.y, color: "#0e4d4a", radio: 5, etiqueta: `P${idx}(${p.x}, ${p.y})` });
      });
    } else {
      xMin = Math.min(res.x0, res.xEval) - 2;
      xMax = Math.max(res.x0, res.xEval) + 2;
    }

    puntosDestacados.push({ x: res.xEval, y: res.yEval, color: "#c0392b", radio: 7, etiqueta: `x* = ${res.xEval}` });

    const series = [
      { fn: res.fnPolinomio, color: "#2a7b76", grosor: "2.5", nombre: "P(x)" }
    ];
    if (res.fnOriginal) {
      series.unshift({ fn: res.fnOriginal, color: "#95a5a6", grosor: "1.5", estilo: "punteado", nombre: "f(x)" });
    }

    Graficador.graficarCurvas("grafica-interp", {
      xMin,
      xMax,
      series,
      puntosDestacados
    });
  }

  actualizarCampos();
})();

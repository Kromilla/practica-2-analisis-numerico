(function () {
  const metodoSelect = document.getElementById("metodo");
  const campoFx = document.getElementById("campo-fx");
  const campoGx = document.getElementById("campo-gx");
  const campoDfx = document.getElementById("campo-dfx");
  const camposIntervalo = document.getElementById("campos-intervalo");
  const camposSecante = document.getElementById("campos-secante");
  const campoX0 = document.getElementById("campo-x0");

  const form = document.getElementById("form-raices");
  const btnEjemplo = document.getElementById("btn-ejemplo");
  const contenedorAlerta = document.getElementById("contenedor-alerta");
  const resumenResultado = document.getElementById("resumen-resultado");
  const estadoInicial = document.getElementById("estado-inicial");
  const formulaUsada = document.getElementById("formula-usada");
  const cajaRaiz = document.getElementById("caja-raiz");
  const tablaHead = document.querySelector("#tabla-iteraciones thead");
  const tablaBody = document.querySelector("#tabla-iteraciones tbody");

  function actualizarCampos() {
    const m = metodoSelect.value;
    campoGx.style.display = m === "punto_fijo" ? "block" : "none";
    campoDfx.style.display = m === "newton" ? "block" : "none";
    camposIntervalo.style.display = m === "biseccion" || m === "falsa_posicion" ? "grid" : "none";
    camposSecante.style.display = m === "secante" ? "grid" : "none";
    campoX0.style.display = m === "newton" || m === "punto_fijo" ? "block" : "none";
  }

  metodoSelect.addEventListener("change", actualizarCampos);

  btnEjemplo.addEventListener("click", () => {
    const m = metodoSelect.value;
    if (m === "biseccion" || m === "falsa_posicion") {
      document.getElementById("fx").value = "x^3 - 2*x - 5";
      document.getElementById("val-a").value = "2";
      document.getElementById("val-b").value = "3";
    } else if (m === "secante") {
      document.getElementById("fx").value = "x^3 - 2*x - 5";
      document.getElementById("val-x0-sec").value = "2";
      document.getElementById("val-x1-sec").value = "3";
    } else if (m === "newton") {
      document.getElementById("fx").value = "x^3 - 2*x - 5";
      document.getElementById("dfx").value = "3*x^2 - 2";
      document.getElementById("val-x0").value = "2.5";
    } else if (m === "punto_fijo") {
      document.getElementById("fx").value = "x^3 - 2*x - 5";
      document.getElementById("gx").value = "(2*x + 5)^(1/3)";
      document.getElementById("val-x0").value = "2.5";
    }
    form.dispatchEvent(new Event("submit"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    contenedorAlerta.innerHTML = "";
    resumenResultado.style.display = "none";
    estadoInicial.style.display = "none";

    try {
      const metodo = metodoSelect.value;
      const exprFx = document.getElementById("fx").value;
      const fnF = Evaluador.compilar1D(exprFx, "x");
      const tol = parseFloat(document.getElementById("tol").value);
      const maxIter = parseInt(document.getElementById("max-iter").value, 10);
      const tipoError = document.getElementById("tipo-error").value;

      if (isNaN(tol) || tol <= 0) throw new Error("La tolerancia debe ser un número positivo.");
      if (isNaN(maxIter) || maxIter <= 0) throw new Error("Las iteraciones máximas deben ser mayores a 0.");

      let res;
      if (metodo === "biseccion") {
        const a = parseFloat(document.getElementById("val-a").value);
        const b = parseFloat(document.getElementById("val-b").value);
        res = resolverBiseccion(fnF, a, b, tol, maxIter, tipoError);
      } else if (metodo === "falsa_posicion") {
        const a = parseFloat(document.getElementById("val-a").value);
        const b = parseFloat(document.getElementById("val-b").value);
        res = resolverFalsaPosicion(fnF, a, b, tol, maxIter, tipoError);
      } else if (metodo === "secante") {
        const x0 = parseFloat(document.getElementById("val-x0-sec").value);
        const x1 = parseFloat(document.getElementById("val-x1-sec").value);
        res = resolverSecante(fnF, x0, x1, tol, maxIter, tipoError);
      } else if (metodo === "newton") {
        const x0 = parseFloat(document.getElementById("val-x0").value);
        const exprDfx = document.getElementById("dfx").value.trim();
        const fnDf = exprDfx ? Evaluador.compilar1D(exprDfx, "x") : (x) => Evaluador.derivadaNumerica(fnF, x);
        res = resolverNewton(fnF, fnDf, x0, tol, maxIter, tipoError);
      } else if (metodo === "punto_fijo") {
        const exprGx = document.getElementById("gx").value;
        const fnG = Evaluador.compilar1D(exprGx, "x");
        const x0 = parseFloat(document.getElementById("val-x0").value);
        res = resolverPuntoFijo(fnF, fnG, x0, tol, maxIter, tipoError);
      }

      renderizarResultados(res, fnF);
    } catch (err) {
      contenedorAlerta.innerHTML = `<div class="alerta error">${err.message}</div>`;
      estadoInicial.style.display = "block";
    }
  });

  function calcularError(xNuevo, xAnt, tipoError) {
    if (xAnt === null || xAnt === undefined) return null;
    if (tipoError === "relativo") {
      if (Math.abs(xNuevo) < 1e-14) return Math.abs(xNuevo - xAnt) * 100;
      return Math.abs((xNuevo - xAnt) / xNuevo) * 100;
    }
    return Math.abs(xNuevo - xAnt);
  }

  function resolverBiseccion(f, a, b, tol, maxIter, tipoError) {
    let fa = f(a);
    let fb = f(b);
    if (fa * fb > 0) {
      throw new Error(`No se cumple el Teorema de Bolzano: f(a) y f(b) tienen el mismo signo. f(${a})=${fa.toFixed(4)}, f(${b})=${fb.toFixed(4)}.`);
    }

    const pasos = [];
    let xr = a;
    let xrAnt = null;
    let error = Infinity;
    let converge = false;

    for (let i = 1; i <= maxIter; i++) {
      xr = (a + b) / 2;
      const fxr = f(xr);
      error = calcularError(xr, xrAnt, tipoError);

      pasos.push({
        i, a, b, xr, fa, fb, fxr,
        signo: fa * fxr < 0 ? "< 0" : "> 0",
        error
      });

      if (error !== null && error < tol) {
        converge = true;
        break;
      }

      if (Math.abs(fxr) < 1e-14) {
        converge = true;
        break;
      }

      if (fa * fxr < 0) {
        b = xr;
        fb = fxr;
      } else {
        a = xr;
        fa = fxr;
      }
      xrAnt = xr;
    }

    return {
      metodo: "Bisección",
      formula: "x_r = (a + b) / 2",
      raiz: xr,
      fRaiz: f(xr),
      pasos,
      converge,
      columnas: ["i", "a", "b", "x_r", "f(a)", "f(x_r)", "f(a)·f(x_r)", tipoError === "relativo" ? "Error Rel (%)" : "Error Abs"]
    };
  }

  function resolverFalsaPosicion(f, a, b, tol, maxIter, tipoError) {
    let fa = f(a);
    let fb = f(b);
    if (fa * fb > 0) {
      throw new Error(`No se cumple el Teorema de Bolzano: f(a) y f(b) tienen el mismo signo.`);
    }

    const pasos = [];
    let xr = a;
    let xrAnt = null;
    let error = Infinity;
    let converge = false;

    for (let i = 1; i <= maxIter; i++) {
      xr = b - (fb * (a - b)) / (fa - fb);
      const fxr = f(xr);
      error = calcularError(xr, xrAnt, tipoError);

      pasos.push({
        i, a, b, xr, fa, fb, fxr,
        signo: fa * fxr < 0 ? "< 0" : "> 0",
        error
      });

      if (error !== null && error < tol) {
        converge = true;
        break;
      }

      if (fa * fxr < 0) {
        b = xr;
        fb = fxr;
      } else {
        a = xr;
        fa = fxr;
      }
      xrAnt = xr;
    }

    return {
      metodo: "Falsa Posición",
      formula: "x_r = b - [f(b)(a - b)] / [f(a) - f(b)]",
      raiz: xr,
      fRaiz: f(xr),
      pasos,
      converge,
      columnas: ["i", "a", "b", "x_r", "f(a)", "f(x_r)", "f(a)·f(x_r)", tipoError === "relativo" ? "Error Rel (%)" : "Error Abs"]
    };
  }

  function resolverSecante(f, x0, x1, tol, maxIter, tipoError) {
    const pasos = [];
    let converge = false;

    pasos.push({ i: 0, x: x0, fx: f(x0), error: null });
    let f1 = f(x1);
    let error = calcularError(x1, x0, tipoError);
    pasos.push({ i: 1, x: x1, fx: f1, error });

    let xAntAnt = x0;
    let xAnt = x1;
    let xAct = x1;

    for (let i = 2; i <= maxIter; i++) {
      const fAnt = f(xAnt);
      const fAntAnt = f(xAntAnt);
      const denom = fAnt - fAntAnt;
      if (Math.abs(denom) < 1e-14) throw new Error("División por cero en el método de la Secante (f(x_{i}) - f(x_{i-1}) ≈ 0).");

      xAct = xAnt - (fAnt * (xAnt - xAntAnt)) / denom;
      const fxAct = f(xAct);
      error = calcularError(xAct, xAnt, tipoError);

      pasos.push({ i, x: xAct, fx: fxAct, error });

      if (error < tol || Math.abs(fxAct) < 1e-14) {
        converge = true;
        break;
      }

      xAntAnt = xAnt;
      xAnt = xAct;
    }

    return {
      metodo: "Secante",
      formula: "x_{i+1} = x_i - [f(x_i)(x_i - x_{i-1})] / [f(x_i) - f(x_{i-1})]",
      raiz: xAct,
      fRaiz: f(xAct),
      pasos,
      converge,
      columnas: ["i", "x_i", "f(x_i)", tipoError === "relativo" ? "Error Rel (%)" : "Error Abs"]
    };
  }

  function resolverNewton(f, df, x0, tol, maxIter, tipoError) {
    const pasos = [];
    let xAct = x0;
    let xAnt = null;
    let converge = false;

    for (let i = 0; i <= maxIter; i++) {
      const fx = f(xAct);
      const dfx = df(xAct);
      const error = calcularError(xAct, xAnt, tipoError);

      pasos.push({ i, x: xAct, fx, dfx, error });

      if (i > 0 && error < tol) {
        converge = true;
        break;
      }

      if (Math.abs(dfx) < 1e-14) throw new Error(`Derivada f'(x) cercana a cero en x = ${xAct.toFixed(6)}.`);

      xAnt = xAct;
      xAct = xAct - fx / dfx;
    }

    return {
      metodo: "Newton-Raphson",
      formula: "x_{i+1} = x_i - f(x_i) / f'(x_i)",
      raiz: xAct,
      fRaiz: f(xAct),
      pasos,
      converge,
      columnas: ["i", "x_i", "f(x_i)", "f'(x_i)", tipoError === "relativo" ? "Error Rel (%)" : "Error Abs"]
    };
  }

  function resolverPuntoFijo(f, g, x0, tol, maxIter, tipoError) {
    const pasos = [];
    let xAct = x0;
    let xAnt = null;
    let converge = false;

    for (let i = 0; i <= maxIter; i++) {
      const fx = f(xAct);
      const error = calcularError(xAct, xAnt, tipoError);

      pasos.push({ i, x: xAct, gx: g(xAct), fx, error });

      if (i > 0 && error < tol) {
        converge = true;
        break;
      }

      xAnt = xAct;
      xAct = g(xAct);
      if (!isFinite(xAct) || Math.abs(xAct) > 1e12) throw new Error("El método del Punto Fijo divergió (g(x) creció sin control).");
    }

    return {
      metodo: "Punto Fijo",
      formula: "x_{i+1} = g(x_i)",
      raiz: xAnt || xAct,
      fRaiz: f(xAnt || xAct),
      pasos,
      converge,
      columnas: ["i", "x_i", "g(x_i)", "f(x_i)", tipoError === "relativo" ? "Error Rel (%)" : "Error Abs"]
    };
  }

  function renderizarResultados(res, f) {
    resumenResultado.style.display = "block";
    formulaUsada.textContent = `Fórmula: ${res.formula}`;

    cajaRaiz.className = `alerta ${res.converge ? "exito" : "alerta"}`;
    cajaRaiz.innerHTML = `
      <strong>${res.converge ? "Convergencia alcanzada" : "Límite de iteraciones"}</strong>:
      Raíz aproximada: <strong>x ≈ ${Evaluador.formatear(res.raiz, 7)}</strong> con <strong>f(x) ≈ ${Evaluador.formatear(res.fRaiz, 7)}</strong>
      en ${res.pasos.length} iteraciones.
    `;

    // Tabla
    tablaHead.innerHTML = `<tr>${res.columnas.map((c) => `<th>${c}</th>`).join("")}</tr>`;
    tablaBody.innerHTML = "";

    res.pasos.forEach((p, idx) => {
      const tr = document.createElement("tr");
      if (idx === res.pasos.length - 1 && res.converge) tr.className = "fila-convergencia";

      let celdas = [];
      if (res.metodo === "Bisección" || res.metodo === "Falsa Posición") {
        celdas = [
          p.i,
          Evaluador.formatear(p.a, 5),
          Evaluador.formatear(p.b, 5),
          Evaluador.formatear(p.xr, 6),
          Evaluador.formatear(p.fa, 5),
          Evaluador.formatear(p.fxr, 5),
          p.signo,
          p.error !== null ? Evaluador.formatear(p.error, 5) : "—"
        ];
      } else if (res.metodo === "Secante") {
        celdas = [
          p.i,
          Evaluador.formatear(p.x, 6),
          Evaluador.formatear(p.fx, 5),
          p.error !== null ? Evaluador.formatear(p.error, 5) : "—"
        ];
      } else if (res.metodo === "Newton-Raphson") {
        celdas = [
          p.i,
          Evaluador.formatear(p.x, 6),
          Evaluador.formatear(p.fx, 5),
          Evaluador.formatear(p.dfx, 5),
          p.error !== null ? Evaluador.formatear(p.error, 5) : "—"
        ];
      } else if (res.metodo === "Punto Fijo") {
        celdas = [
          p.i,
          Evaluador.formatear(p.x, 6),
          Evaluador.formatear(p.gx, 6),
          Evaluador.formatear(p.fx, 5),
          p.error !== null ? Evaluador.formatear(p.error, 5) : "—"
        ];
      }

      tr.innerHTML = celdas.map((v) => `<td>${v}</td>`).join("");
      tablaBody.appendChild(tr);
    });

    // Gráfica
    const centro = res.raiz;
    const rango = Math.max(Math.abs(centro) * 0.8, 3);
    Graficador.graficarCurvas("grafica-contenedor", {
      xMin: centro - rango,
      xMax: centro + rango,
      series: [
        { fn: f, color: "#0e4d4a", grosor: "2.5", nombre: "f(x)" }
      ],
      puntosDestacados: [
        { x: res.raiz, y: res.fRaiz, color: "#c0392b", radio: 6, etiqueta: `Raíz: ${res.raiz.toFixed(4)}` }
      ]
    });
  }

  // Inicialización
  actualizarCampos();
})();

(function () {
  const tipoOp = document.getElementById("tipo-operacion");
  const origenDatos = document.getElementById("origen-datos");
  const seccionFuncion = document.getElementById("seccion-funcion");
  const seccionTabla = document.getElementById("seccion-tabla");
  const paramsDif = document.getElementById("params-diferenciacion");
  const paramsInt = document.getElementById("params-integracion");
  const camposLimites = document.getElementById("campos-limites");
  const campoSubint = document.getElementById("campo-subintervalos");

  const form = document.getElementById("form-dif-int");
  const btnEjemplo = document.getElementById("btn-ejemplo-difint");
  const contenedorAlerta = document.getElementById("contenedor-alerta");
  const resumenResultado = document.getElementById("resumen-resultado");
  const estadoInicial = document.getElementById("estado-inicial");
  const bloquePasos = document.getElementById("bloque-pasos");

  function sincronizarVisibilidad() {
    const esDif = tipoOp.value === "diferenciacion";
    const esFunc = origenDatos.value === "funcion";

    paramsDif.style.display = esDif ? "block" : "none";
    paramsInt.style.display = esDif ? "none" : "block";

    seccionFuncion.style.display = esFunc ? "block" : "none";
    seccionTabla.style.display = esFunc ? "none" : "block";

    if (!esDif) {
      camposLimites.style.display = esFunc ? "grid" : "none";
      campoSubint.style.display = esFunc ? "block" : "none";
    }
  }

  tipoOp.addEventListener("change", sincronizarVisibilidad);
  origenDatos.addEventListener("change", sincronizarVisibilidad);

  btnEjemplo.addEventListener("click", () => {
    if (tipoOp.value === "diferenciacion") {
      origenDatos.value = "funcion";
      document.getElementById("fx-dif").value = "x^2 + 1/x";
      document.getElementById("x0-dif").value = "4.0";
      document.getElementById("h-dif").value = "0.1";
      document.getElementById("metodo-dif").value = "todas";
    } else {
      origenDatos.value = "tabla";
      document.getElementById("tabla-entrada").value = "0, 5\n1, 4\n2, 6\n3, -2\n4, 5\n5, 7\n6, 3";
      document.getElementById("metodo-int").value = "todas";
    }
    sincronizarVisibilidad();
    form.dispatchEvent(new Event("submit"));
  });

  function parsearTablaNodos(texto) {
    const lineas = texto.trim().split("\n");
    const nodos = [];
    lineas.forEach((l, idx) => {
      const limpio = l.trim();
      if (!limpio) return;
      const partes = limpio.split(/[,;\s]+/).filter(Boolean);
      if (partes.length < 2) throw new Error(`Fila ${idx + 1} de la tabla es inválida.`);
      const x = parseFloat(partes[0]);
      const y = parseFloat(partes[1]);
      if (isNaN(x) || isNaN(y)) throw new Error(`Fila ${idx + 1}: valores numéricos incorrectos.`);
      nodos.push({ x, y });
    });
    if (nodos.length < 2) throw new Error("Se requieren al menos 2 nodos.");
    nodos.sort((a, b) => a.x - b.x);

    // Verificar h constante
    const h = nodos[1].x - nodos[0].x;
    for (let i = 2; i < nodos.length; i++) {
      const diff = nodos[i].x - nodos[i - 1].x;
      if (Math.abs(diff - h) > 1e-6) {
        throw new Error(`Los nodos deben estar equiespaciados. Encontrado h=${diff.toFixed(4)} vs h=${h.toFixed(4)}.`);
      }
    }
    return { nodos, h };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    contenedorAlerta.innerHTML = "";
    resumenResultado.style.display = "none";
    estadoInicial.style.display = "none";

    try {
      if (tipoOp.value === "diferenciacion") {
        ejecutarDiferenciacion();
      } else {
        ejecutarIntegracion();
      }
    } catch (err) {
      contenedorAlerta.innerHTML = `<div class="alerta error">${err.message}</div>`;
      estadoInicial.style.display = "block";
    }
  });

  function ejecutarDiferenciacion() {
    const esFunc = origenDatos.value === "funcion";
    let fnF, x0, h, valorReal = null;

    if (esFunc) {
      const expr = document.getElementById("fx-dif").value;
      fnF = Evaluador.compilar1D(expr, "x");
      x0 = parseFloat(document.getElementById("x0-dif").value);
      h = parseFloat(document.getElementById("h-dif").value);
      if (isNaN(x0) || isNaN(h) || h <= 0) throw new Error("Parámetros x₀ y h deben ser números válidos y h > 0.");
      try {
        // Derivada de referencia de alta precisión (h/1000)
        valorReal = Evaluador.derivadaNumerica(fnF, x0, 1e-6);
      } catch (e) {}
    } else {
      const { nodos, h: paso } = parsearTablaNodos(document.getElementById("tabla-entrada").value);
      x0 = parseFloat(document.getElementById("x0-dif").value);
      h = paso;
      // Diccionario de búsqueda
      const mapa = new Map();
      nodos.forEach((p) => mapa.set(Number(p.x.toFixed(6)), p.y));
      fnF = (x) => {
        const k = Number(x.toFixed(6));
        if (!mapa.has(k)) throw new Error(`El nodo x = ${x.toFixed(4)} no está en la tabla.`);
        return mapa.get(k);
      };
    }

    const formulas = [];

    // 1. Adelante O(h)
    try {
      const f_x0 = fnF(x0);
      const f_x0_h = fnF(x0 + h);
      const val = (f_x0_h - f_x0) / h;
      formulas.push({
        nombre: "Diferencia hacia adelante (Progresiva)",
        orden: "O(h)",
        formula: "f'(x₀) ≈ [f(x₀ + h) - f(x₀)] / h",
        pasos: [
          `f(x₀) = f(${x0}) = ${Evaluador.formatear(f_x0, 6)}`,
          `f(x₀ + h) = f(${(x0 + h).toFixed(4)}) = ${Evaluador.formatear(f_x0_h, 6)}`,
          `f'(${x0}) ≈ [${Evaluador.formatear(f_x0_h, 6)} - ${Evaluador.formatear(f_x0, 6)}] / ${h}`,
          `f'(${x0}) ≈ ${Evaluador.formatear(val, 6)}`
        ],
        resultado: val
      });
    } catch (e) {}

    // 2. Atrás O(h)
    try {
      const f_x0 = fnF(x0);
      const f_x0_mh = fnF(x0 - h);
      const val = (f_x0 - f_x0_mh) / h;
      formulas.push({
        nombre: "Diferencia hacia atrás (Regresiva)",
        orden: "O(h)",
        formula: "f'(x₀) ≈ [f(x₀) - f(x₀ - h)] / h",
        pasos: [
          `f(x₀) = f(${x0}) = ${Evaluador.formatear(f_x0, 6)}`,
          `f(x₀ - h) = f(${(x0 - h).toFixed(4)}) = ${Evaluador.formatear(f_x0_mh, 6)}`,
          `f'(${x0}) ≈ [${Evaluador.formatear(f_x0, 6)} - ${Evaluador.formatear(f_x0_mh, 6)}] / ${h}`,
          `f'(${x0}) ≈ ${Evaluador.formatear(val, 6)}`
        ],
        resultado: val
      });
    } catch (e) {}

    // 3. Centrada O(h^2)
    try {
      const f_mas = fnF(x0 + h);
      const f_men = fnF(x0 - h);
      const val = (f_mas - f_men) / (2 * h);
      formulas.push({
        nombre: "Diferencia centrada (3 puntos)",
        orden: "O(h²)",
        formula: "f'(x₀) ≈ [f(x₀ + h) - f(x₀ - h)] / (2h)",
        pasos: [
          `f(x₀ + h) = f(${(x0 + h).toFixed(4)}) = ${Evaluador.formatear(f_mas, 6)}`,
          `f(x₀ - h) = f(${(x0 - h).toFixed(4)}) = ${Evaluador.formatear(f_men, 6)}`,
          `f'(${x0}) ≈ [${Evaluador.formatear(f_mas, 6)} - ${Evaluador.formatear(f_men, 6)}] / (2 · ${h})`,
          `f'(${x0}) ≈ ${Evaluador.formatear(f_mas - f_men, 6)} / ${(2 * h).toFixed(4)} = ${Evaluador.formatear(val, 6)}`
        ],
        resultado: val
      });
    } catch (e) {}

    // 4. Centrada O(h^4)
    try {
      const f_p2 = fnF(x0 + 2 * h);
      const f_p1 = fnF(x0 + h);
      const f_m1 = fnF(x0 - h);
      const f_m2 = fnF(x0 - 2 * h);
      const num = f_m2 - 8 * f_m1 + 8 * f_p1 - f_p2;
      const den = 12 * h;
      const val = num / den;
      formulas.push({
        nombre: "Diferencia centrada de 5 puntos (alta precisión)",
        orden: "O(h⁴)",
        formula: "f'(x₀) ≈ [f(x₀ - 2h) - 8f(x₀ - h) + 8f(x₀ + h) - f(x₀ + 2h)] / (12h)",
        pasos: [
          `f(x₀ - 2h) = f(${(x0 - 2 * h).toFixed(4)}) = ${Evaluador.formatear(f_m2, 6)}`,
          `f(x₀ - h)  = f(${(x0 - h).toFixed(4)}) = ${Evaluador.formatear(f_m1, 6)}`,
          `f(x₀ + h)  = f(${(x0 + h).toFixed(4)}) = ${Evaluador.formatear(f_p1, 6)}`,
          `f(x₀ + 2h) = f(${(x0 + 2 * h).toFixed(4)}) = ${Evaluador.formatear(f_p2, 6)}`,
          `Numerador = ${Evaluador.formatear(f_m2, 5)} - 8·(${Evaluador.formatear(f_m1, 5)}) + 8·(${Evaluador.formatear(f_p1, 5)}) - ${Evaluador.formatear(f_p2, 5)} = ${Evaluador.formatear(num, 6)}`,
          `Denominador = 12 · ${h} = ${den.toFixed(4)}`,
          `f'(${x0}) ≈ ${Evaluador.formatear(num, 6)} / ${den.toFixed(4)} = ${Evaluador.formatear(val, 6)}`
        ],
        resultado: val
      });
    } catch (e) {}

    if (formulas.length === 0) {
      throw new Error("No hay suficientes nodos adyacentes para aplicar las fórmulas de derivación en x₀.");
    }

    renderizarDif(formulas, valorReal, x0, h);
  }

  function renderizarDif(formulas, valorReal, x0, h) {
    resumenResultado.style.display = "block";
    let html = `
      <div class="alerta info">
        Diferenciación en <strong>x₀ = ${x0}</strong> con paso <strong>h = ${h}</strong>.
        ${valorReal !== null ? `Valor de referencia: <strong>f'(${x0}) ≈ ${Evaluador.formatear(valorReal, 6)}</strong>` : ""}
      </div>
      <h3>Tabla Comparativa de Fórmulas de Derivación</h3>
      <div class="contenedor-tabla">
        <table class="tabla-datos">
          <thead>
            <tr><th>Fórmula</th><th>Orden</th><th>Aproximación f'(x₀)</th><th>Error Relativo %</th></tr>
          </thead>
          <tbody>
    `;

    formulas.forEach((f) => {
      let errStr = "—";
      if (valorReal !== null && Math.abs(valorReal) > 1e-12) {
        const errRel = Math.abs((valorReal - f.resultado) / valorReal) * 100;
        errStr = `${errRel.toFixed(5)}%`;
      }
      html += `<tr>
        <td style="text-align:left; font-weight:600;">${f.nombre}</td>
        <td><code>${f.orden}</code></td>
        <td><strong>${Evaluador.formatear(f.resultado, 6)}</strong></td>
        <td>${errStr}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;

    html += `<h3>Desarrollo Detallado Paso a Paso</h3>`;
    formulas.forEach((f) => {
      html += `
        <div class="tarjeta" style="margin-bottom:1rem; padding:1rem; border-left:4px solid var(--acento);">
          <h4 style="color:var(--primario); margin-bottom:0.4rem;">${f.nombre} [${f.orden}]</h4>
          <div class="caja-formula">${f.formula}</div>
          <ul style="padding-left:1.2rem; font-size:0.88rem; color:var(--texto);">
            ${f.pasos.map((p) => `<li style="margin:0.25rem 0;">${p}</li>`).join("")}
          </ul>
        </div>
      `;
    });

    bloquePasos.innerHTML = html;
  }

  function ejecutarIntegracion() {
    const esFunc = origenDatos.value === "funcion";
    let xs = [], ys = [], a, b, n, h;

    if (esFunc) {
      const expr = document.getElementById("fx-dif").value;
      const fnF = Evaluador.compilar1D(expr, "x");
      a = parseFloat(document.getElementById("lim-a").value);
      b = parseFloat(document.getElementById("lim-b").value);
      n = parseInt(document.getElementById("num-subintervalos").value, 10);
      if (isNaN(a) || isNaN(b) || a >= b) throw new Error("Límites a y b inválidos (debe ser a < b).");
      if (isNaN(n) || n < 1) throw new Error("Subintervalos n debe ser >= 1.");
      h = (b - a) / n;
      for (let i = 0; i <= n; i++) {
        const xi = a + i * h;
        xs.push(xi);
        ys.push(fnF(xi));
      }
    } else {
      const { nodos, h: paso } = parsearTablaNodos(document.getElementById("tabla-entrada").value);
      xs = nodos.map((p) => p.x);
      ys = nodos.map((p) => p.y);
      a = xs[0];
      b = xs[xs.length - 1];
      n = xs.length - 1;
      h = paso;
    }

    const metodoDeseado = document.getElementById("metodo-int").value;
    const resultados = [];

    // 1. Regla Compuesta del Trapecio (Cualquier n)
    if (metodoDeseado === "todas" || metodoDeseado === "trapecio") {
      let sumaInterna = 0;
      const expansion = [`y₀=${Evaluador.formatear(ys[0], 4)}`];
      for (let i = 1; i < n; i++) {
        sumaInterna += ys[i];
        expansion.push(`2·y_${i}(${Evaluador.formatear(ys[i], 4)})`);
      }
      expansion.push(`y_${n}=${Evaluador.formatear(ys[n], 4)}`);
      const totalSuma = ys[0] + 2 * sumaInterna + ys[n];
      const I_trap = (h / 2) * totalSuma;

      resultados.push({
        nombre: n === 1 ? "Regla del Trapecio Simple (n = 1)" : `Regla Compuesta del Trapecio (n = ${n})`,
        patron: "1 2 2 ... 2 1",
        formula: "I ≈ (h / 2) · [ f(x₀) + 2 ∑ f(xᵢ) + f(xₙ) ]",
        expansion: `I ≈ (${Evaluador.formatear(h, 4)} / 2) · [ ${expansion.join(" + ")} ] = (${Evaluador.formatear(h / 2, 4)}) · (${Evaluador.formatear(totalSuma, 5)}) = ${Evaluador.formatear(I_trap, 6)}`,
        resultado: I_trap,
        aplicable: true
      });
    }

    // 2. Regla Compuesta de 1/3 de Simpson (Requiere n par)
    if (metodoDeseado === "todas" || metodoDeseado === "simpson13") {
      if (n % 2 !== 0) {
        resultados.push({
          nombre: `Regla 1/3 de Simpson (n = ${n})`,
          aplicable: false,
          justificacion: `No es aplicable porque n = ${n} es impar. 1/3 de Simpson requiere una cantidad par de subintervalos.`
        });
      } else {
        let sumaImpar = 0;
        let sumaPar = 0;
        const expansion = [`y₀=${Evaluador.formatear(ys[0], 4)}`];
        for (let i = 1; i < n; i++) {
          if (i % 2 !== 0) {
            sumaImpar += ys[i];
            expansion.push(`4·y_${i}(${Evaluador.formatear(ys[i], 4)})`);
          } else {
            sumaPar += ys[i];
            expansion.push(`2·y_${i}(${Evaluador.formatear(ys[i], 4)})`);
          }
        }
        expansion.push(`y_${n}=${Evaluador.formatear(ys[n], 4)}`);
        const totalSuma = ys[0] + 4 * sumaImpar + 2 * sumaPar + ys[n];
        const I_s13 = (h / 3) * totalSuma;

        resultados.push({
          nombre: n === 2 ? "Regla de 1/3 de Simpson Simple (n = 2)" : `Regla Compuesta de 1/3 de Simpson (n = ${n})`,
          patron: "1 4 2 4 ... 4 1",
          formula: "I ≈ (h / 3) · [ f(x₀) + 4 ∑ f(impares) + 2 ∑ f(pares) + f(xₙ) ]",
          expansion: `I ≈ (${Evaluador.formatear(h, 4)} / 3) · [ ${expansion.join(" + ")} ] = (${Evaluador.formatear(h / 3, 4)}) · (${Evaluador.formatear(totalSuma, 5)}) = ${Evaluador.formatear(I_s13, 6)}`,
          resultado: I_s13,
          aplicable: true
        });
      }
    }

    // 3. Regla Compuesta de 3/8 de Simpson (Requiere n múltiplo de 3)
    if (metodoDeseado === "todas" || metodoDeseado === "simpson38") {
      if (n % 3 !== 0) {
        resultados.push({
          nombre: `Regla 3/8 de Simpson (n = ${n})`,
          aplicable: false,
          justificacion: `No es aplicable porque n = ${n} no es múltiplo de 3. 3/8 de Simpson requiere subintervalos múltiplos de 3.`
        });
      } else {
        let suma3 = 0;
        let suma2 = 0;
        const expansion = [`y₀=${Evaluador.formatear(ys[0], 4)}`];
        for (let i = 1; i < n; i++) {
          if (i % 3 === 0) {
            suma2 += ys[i];
            expansion.push(`2·y_${i}(${Evaluador.formatear(ys[i], 4)})`);
          } else {
            suma3 += ys[i];
            expansion.push(`3·y_${i}(${Evaluador.formatear(ys[i], 4)})`);
          }
        }
        expansion.push(`y_${n}=${Evaluador.formatear(ys[n], 4)}`);
        const totalSuma = ys[0] + 3 * suma3 + 2 * suma2 + ys[n];
        const I_s38 = ((3 * h) / 8) * totalSuma;

        resultados.push({
          nombre: n === 3 ? "Regla de 3/8 de Simpson Simple (n = 3)" : `Regla Compuesta de 3/8 de Simpson (n = ${n})`,
          patron: "1 3 3 2 3 3 2 ... 3 3 1",
          formula: "I ≈ (3h / 8) · [ f(x₀) + 3 ∑ f(no mult 3) + 2 ∑ f(mult 3) + f(xₙ) ]",
          expansion: `I ≈ (3·${Evaluador.formatear(h, 4)} / 8) · [ ${expansion.join(" + ")} ] = (${Evaluador.formatear((3 * h) / 8, 4)}) · (${Evaluador.formatear(totalSuma, 5)}) = ${Evaluador.formatear(I_s38, 6)}`,
          resultado: I_s38,
          aplicable: true
        });
      }
    }

    // 4. Regla de Boole (Simple n = 4)
    if ((metodoDeseado === "todas" || metodoDeseado === "boole") && n === 4) {
      const totalSuma = 7 * ys[0] + 32 * ys[1] + 12 * ys[2] + 32 * ys[3] + 7 * ys[4];
      const I_boole = ((2 * h) / 45) * totalSuma;
      resultados.push({
        nombre: "Regla de Boole Simple (n = 4)",
        patron: "7 32 12 32 7",
        formula: "I ≈ (2h / 45) · [ 7f(x₀) + 32f(x₁) + 12f(x₂) + 32f(x₃) + 7f(x₄) ]",
        expansion: `I ≈ (2·${Evaluador.formatear(h, 4)} / 45) · [ 7(${ys[0]}) + 32(${ys[1]}) + 12(${ys[2]}) + 32(${ys[3]}) + 7(${ys[4]}) ] = ${Evaluador.formatear(I_boole, 6)}`,
        resultado: I_boole,
        aplicable: true
      });
    }

    renderizarInt(resultados, a, b, n, h, xs, ys);
  }

  function renderizarInt(resultados, a, b, n, h, xs, ys) {
    resumenResultado.style.display = "block";
    let html = `
      <div class="alerta info">
        Integración en intervalo <strong>[${a}, ${b}]</strong> con <strong>n = ${n}</strong> subintervalos (<strong>h = ${Evaluador.formatear(h, 4)}</strong>).
      </div>
      <h3>Resumen de Reglas de Integración</h3>
      <div class="contenedor-tabla">
        <table class="tabla-datos">
          <thead>
            <tr><th>Método</th><th>Patrón de Coeficientes</th><th>Estado</th><th>Aproximación Integral ∫</th></tr>
          </thead>
          <tbody>
    `;

    resultados.forEach((r) => {
      html += `<tr>
        <td style="text-align:left; font-weight:600;">${r.nombre}</td>
        <td><code>${r.patron || "—"}</code></td>
        <td>${r.aplicable ? '<span style="color:var(--exito-texto); font-weight:bold;">Aplicable</span>' : '<span style="color:var(--error-texto);">No aplicable</span>'}</td>
        <td><strong>${r.aplicable ? Evaluador.formatear(r.resultado, 6) : "—"}</strong></td>
      </tr>`;
    });
    html += `</tbody></table></div>`;

    html += `<h3>Desarrollo Detallado con Coeficientes Expandidos</h3>`;
    resultados.forEach((r) => {
      if (r.aplicable) {
        html += `
          <div class="tarjeta" style="margin-bottom:1rem; padding:1.2rem; border-left:4px solid var(--primario);">
            <h4 style="color:var(--primario); margin-bottom:0.4rem;">${r.nombre}</h4>
            <div class="caja-formula">${r.formula}</div>
            <p style="font-size:0.88rem; color:var(--texto-suave); margin-bottom:0.4rem;"><strong>Fórmula Expandida:</strong></p>
            <div class="caja-formula" style="background:#fff; border-color:#ded6c9; color:#1f272a;">${r.expansion}</div>
          </div>
        `;
      } else {
        html += `
          <div class="alerta alerta" style="margin-bottom:1rem;">
            <strong>${r.nombre}</strong>: ${r.justificacion}
          </div>
        `;
      }
    });

    bloquePasos.innerHTML = html;
  }

  sincronizarVisibilidad();
})();

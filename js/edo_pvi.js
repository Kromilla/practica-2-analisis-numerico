(function () {
  const form = document.getElementById("form-edo");
  const btnEjemplo = document.getElementById("btn-ejemplo-edo");
  const contenedorAlerta = document.getElementById("contenedor-alerta");
  const resumenResultado = document.getElementById("resumen-resultado");
  const estadoInicial = document.getElementById("estado-inicial");
  const cajaResumenFinal = document.getElementById("caja-resumen-final");
  const tablaHead = document.querySelector("#tabla-edo thead");
  const tablaBody = document.querySelector("#tabla-edo tbody");
  const detalleFormulas = document.getElementById("detalle-formulas-edo");

  btnEjemplo.addEventListener("click", () => {
    document.getElementById("edo-f").value = "y - t^2 + 1";
    document.getElementById("edo-t0").value = "0.0";
    document.getElementById("edo-y0").value = "0.5";
    document.getElementById("edo-tf").value = "0.4";
    document.getElementById("edo-h").value = "0.2";
    document.getElementById("edo-exacta").value = "(t + 1)^2 - 0.5*exp(t)";
    document.getElementById("metodo-edo").value = "comparar";
    form.dispatchEvent(new Event("submit"));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    contenedorAlerta.innerHTML = "";
    resumenResultado.style.display = "none";
    estadoInicial.style.display = "none";

    try {
      const exprF = document.getElementById("edo-f").value;
      const fnF = Evaluador.compilar2D(exprF, "t", "y");

      const t0 = parseFloat(document.getElementById("edo-t0").value);
      const y0 = parseFloat(document.getElementById("edo-y0").value);
      const tf = parseFloat(document.getElementById("edo-tf").value);
      const h = parseFloat(document.getElementById("edo-h").value);

      if (isNaN(t0) || isNaN(y0) || isNaN(tf) || isNaN(h)) throw new Error("Complete todos los campos numéricos.");
      if (h <= 0) throw new Error("El tamaño de paso h debe ser mayor que cero.");
      if (tf <= t0) throw new Error("El tiempo final t_f debe ser mayor que t₀.");

      let fnExacta = null;
      const exprExacta = document.getElementById("edo-exacta").value.trim();
      if (exprExacta) {
        fnExacta = Evaluador.compilar1D(exprExacta, "t");
      }

      const metodo = document.getElementById("metodo-edo").value;

      resolverEDO(fnF, t0, y0, tf, h, fnExacta, metodo);
    } catch (err) {
      contenedorAlerta.innerHTML = `<div class="alerta error">${err.message}</div>`;
      estadoInicial.style.display = "block";
    }
  });

  function resolverEDO(f, t0, y0, tf, h, fExacta, metodo) {
    const n = Math.round((tf - t0) / h);
    const ts = [];
    for (let i = 0; i <= n; i++) {
      ts.push(t0 + i * h);
    }

    // 1. Euler
    const yEuler = [y0];
    for (let i = 0; i < n; i++) {
      const ti = ts[i];
      const yi = yEuler[i];
      const yNext = yi + h * f(ti, yi);
      yEuler.push(yNext);
    }

    // 2. Heun
    const yHeun = [y0];
    for (let i = 0; i < n; i++) {
      const ti = ts[i];
      const yi = yHeun[i];
      const k1 = f(ti, yi);
      const yPred = yi + h * k1;
      const k2 = f(ts[i + 1], yPred);
      const yNext = yi + (h / 2) * (k1 + k2);
      yHeun.push(yNext);
    }

    // 3. RK4
    const yRK4 = [y0];
    for (let i = 0; i < n; i++) {
      const ti = ts[i];
      const yi = yRK4[i];
      const k1 = f(ti, yi);
      const k2 = f(ti + h / 2, yi + (h / 2) * k1);
      const k3 = f(ti + h / 2, yi + (h / 2) * k2);
      const k4 = f(ti + h, yi + h * k3);
      const yNext = yi + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      yRK4.push(yNext);
    }

    // Valores exactos si hay función analítica
    const yExactos = fExacta ? ts.map((t) => fExacta(t)) : null;

    renderizarResultados({
      ts,
      yEuler,
      yHeun,
      yRK4,
      yExactos,
      t0,
      y0,
      tf,
      h,
      n,
      metodo
    });
  }

  function renderizarResultados(datos) {
    resumenResultado.style.display = "block";
    const ultimoIdx = datos.n;
    const tf = datos.tf;

    // Resumen final en tf
    let resumenHtml = `<strong>Solución en t = ${tf.toFixed(4)}:</strong><br>`;
    if (datos.yExactos) {
      const exactoFinal = datos.yExactos[ultimoIdx];
      const errEuler = Math.abs(exactoFinal - datos.yEuler[ultimoIdx]);
      const errHeun = Math.abs(exactoFinal - datos.yHeun[ultimoIdx]);
      const errRK4 = Math.abs(exactoFinal - datos.yRK4[ultimoIdx]);

      resumenHtml += `
        • Valor exacto: <strong>${Evaluador.formatear(exactoFinal, 7)}</strong><br>
        • Euler O(h): <strong>${Evaluador.formatear(datos.yEuler[ultimoIdx], 7)}</strong> (Error: ${Evaluador.formatear(errEuler, 6)} | Rel: ${(errEuler / Math.abs(exactoFinal) * 100).toFixed(3)}%)<br>
        • Heun O(h²): <strong>${Evaluador.formatear(datos.yHeun[ultimoIdx], 7)}</strong> (Error: ${Evaluador.formatear(errHeun, 6)} | Rel: ${(errHeun / Math.abs(exactoFinal) * 100).toFixed(4)}%)<br>
        • RK4 O(h⁴): <strong>${Evaluador.formatear(datos.yRK4[ultimoIdx], 7)}</strong> (Error: ${Evaluador.formatear(errRK4, 7)} | Rel: ${(errRK4 / Math.abs(exactoFinal) * 100).toFixed(6)}%)
      `;
    } else {
      resumenHtml += `
        • Euler: <strong>${Evaluador.formatear(datos.yEuler[ultimoIdx], 6)}</strong><br>
        • Heun: <strong>${Evaluador.formatear(datos.yHeun[ultimoIdx], 6)}</strong><br>
        • RK4: <strong>${Evaluador.formatear(datos.yRK4[ultimoIdx], 6)}</strong>
      `;
    }
    cajaResumenFinal.innerHTML = resumenHtml;

    // Tabla de Iteraciones
    let cols = ["i", "tᵢ", "Euler yᵢ", "Heun yᵢ", "RK4 yᵢ"];
    if (datos.yExactos) {
      cols.push("Valor Exacto", "Error Abs (RK4)", "Error Rel % (RK4)");
    }
    tablaHead.innerHTML = `<tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>`;

    tablaBody.innerHTML = "";
    for (let i = 0; i <= datos.n; i++) {
      const tr = document.createElement("tr");
      let filaHtml = `
        <td>${i}</td>
        <td>${datos.ts[i].toFixed(4)}</td>
        <td>${Evaluador.formatear(datos.yEuler[i], 6)}</td>
        <td>${Evaluador.formatear(datos.yHeun[i], 6)}</td>
        <td><strong>${Evaluador.formatear(datos.yRK4[i], 6)}</strong></td>
      `;
      if (datos.yExactos) {
        const exacto = datos.yExactos[i];
        const errAbsRK4 = Math.abs(exacto - datos.yRK4[i]);
        const errRelRK4 = Math.abs(exacto) > 1e-12 ? (errAbsRK4 / Math.abs(exacto)) * 100 : 0;
        filaHtml += `
          <td style="color:var(--primario); font-weight:600;">${Evaluador.formatear(exacto, 6)}</td>
          <td>${i === 0 ? "0" : Evaluador.formatear(errAbsRK4, 6)}</td>
          <td>${i === 0 ? "0%" : `${errRelRK4.toFixed(5)}%`}</td>
        `;
      }
      tr.innerHTML = filaHtml;
      tablaBody.appendChild(tr);
    }

    // Gráfica de trayectorias
    const series = [
      {
        puntos: datos.ts.map((t, idx) => ({ x: t, y: datos.yEuler[idx] })),
        color: "#c0392b",
        grosor: "2",
        nombre: "Euler"
      },
      {
        puntos: datos.ts.map((t, idx) => ({ x: t, y: datos.yHeun[idx] })),
        color: "#e67e22",
        grosor: "2.2",
        nombre: "Heun"
      },
      {
        puntos: datos.ts.map((t, idx) => ({ x: t, y: datos.yRK4[idx] })),
        color: "#0e4d4a",
        grosor: "2.8",
        nombre: "RK4"
      }
    ];

    if (datos.yExactos) {
      series.unshift({
        puntos: datos.ts.map((t, idx) => ({ x: t, y: datos.yExactos[idx] })),
        color: "#27ae60",
        grosor: "2",
        estilo: "punteado",
        nombre: "Exacta"
      });
    }

    Graficador.graficarCurvas("grafica-edo", {
      xMin: datos.t0,
      xMax: datos.tf,
      series,
      puntosDestacados: [
        { x: datos.tf, y: datos.yRK4[ultimoIdx], color: "#0e4d4a", radio: 6, etiqueta: `RK4: ${datos.yRK4[ultimoIdx].toFixed(4)}` }
      ]
    });

    // Fórmulas
    detalleFormulas.innerHTML = `
      <h3>Fórmulas Matemáticas Aplicadas (Unidad 3)</h3>
      <div class="tarjeta" style="margin-bottom:0.8rem; border-left:4px solid #c0392b;">
        <h4 style="color:#c0392b;">Método de Euler O(h)</h4>
        <div class="caja-formula">y_{i+1} = y_i + h · f(t_i, y_i)</div>
      </div>
      <div class="tarjeta" style="margin-bottom:0.8rem; border-left:4px solid #e67e22;">
        <h4 style="color:#e67e22;">Método de Heun / Euler Mejorado O(h²)</h4>
        <div class="caja-formula">
          Predictor:  ỹ_{i+1} = y_i + h · f(t_i, y_i)<br>
          Corrector:  y_{i+1} = y_i + (h / 2) · [ f(t_i, y_i) + f(t_{i+1}, ỹ_{i+1}) ]
        </div>
      </div>
      <div class="tarjeta" style="margin-bottom:0.8rem; border-left:4px solid #0e4d4a;">
        <h4 style="color:#0e4d4a;">Runge-Kutta de 4to Orden (RK4) O(h⁴)</h4>
        <div class="caja-formula">
          k₁ = f(t_i, y_i)<br>
          k₂ = f(t_i + h/2,  y_i + (h/2)·k₁)<br>
          k₃ = f(t_i + h/2,  y_i + (h/2)·k₂)<br>
          k₄ = f(t_i + h,    y_i + h·k₃)<br>
          y_{i+1} = y_i + (h / 6) · (k₁ + 2k₂ + 2k₃ + k₄)
        </div>
      </div>
    `;
  }
})();

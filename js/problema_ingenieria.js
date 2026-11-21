(function () {
  const form = document.getElementById("form-armadura");
  const btnReset = document.getElementById("btn-reset-beer");
  const contenedorAlerta = document.getElementById("contenedor-alerta");
  const cajaReacciones = document.getElementById("caja-reacciones");
  const tablaBody = document.querySelector("#tabla-fuerzas tbody");
  const canvasContainer = document.getElementById("canvas-armadura");

  btnReset.addEventListener("click", () => {
    document.getElementById("val-w").value = "3.0";
    document.getElementById("val-h").value = "6.75";
    document.getElementById("p-A").value = "1.5";
    document.getElementById("p-B").value = "3.0";
    document.getElementById("p-D").value = "3.0";
    document.getElementById("p-F").value = "3.0";
    document.getElementById("p-H").value = "3.0";
    document.getElementById("p-J").value = "3.0";
    document.getElementById("p-L").value = "1.5";
    form.dispatchEvent(new Event("submit"));
  });

  // Solver lineal para sistemas A x = b con eliminación gaussiana y pivoteo parcial
  function resolverSistema(A, b) {
    const n = A.length;
    // Copias profundas
    const M = A.map((fila) => fila.slice());
    const x = b.slice();

    for (let k = 0; k < n - 1; k++) {
      let maxVal = Math.abs(M[k][k]);
      let maxRow = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(M[i][k]) > maxVal) {
          maxVal = Math.abs(M[i][k]);
          maxRow = i;
        }
      }
      if (maxVal < 1e-12) throw new Error("La matriz de rigidez es singular o inestable.");

      // Intercambio
      if (maxRow !== k) {
        const tempRow = M[k];
        M[k] = M[maxRow];
        M[maxRow] = tempRow;
        const tempB = x[k];
        x[k] = x[maxRow];
        x[maxRow] = tempB;
      }

      for (let i = k + 1; i < n; i++) {
        const factor = M[i][k] / M[k][k];
        for (let j = k; j < n; j++) {
          M[i][j] -= factor * M[k][j];
        }
        x[i] -= factor * x[k];
      }
    }

    // Sustitución regresiva
    const sol = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let suma = x[i];
      for (let j = i + 1; j < n; j++) {
        suma -= M[i][j] * sol[j];
      }
      sol[i] = suma / M[i][i];
    }
    return sol;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    contenedorAlerta.innerHTML = "";

    try {
      const w = parseFloat(document.getElementById("val-w").value);
      const h = parseFloat(document.getElementById("val-h").value);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        throw new Error("El ancho y la altura deben ser valores numéricos positivos.");
      }

      const loads = {
        A: parseFloat(document.getElementById("p-A").value) || 0,
        B: parseFloat(document.getElementById("p-B").value) || 0,
        D: parseFloat(document.getElementById("p-D").value) || 0,
        F: parseFloat(document.getElementById("p-F").value) || 0,
        H: parseFloat(document.getElementById("p-H").value) || 0,
        J: parseFloat(document.getElementById("p-J").value) || 0,
        L: parseFloat(document.getElementById("p-L").value) || 0
      };

      calcularArmadura(w, h, loads);
    } catch (err) {
      contenedorAlerta.innerHTML = `<div class="alerta error">${err.message}</div>`;
    }
  });

  function calcularArmadura(w, h, loads) {
    // 12 Nodos con nombres correspondientes a los índices:
    // 0:A, 1:B, 2:C, 3:D, 4:E, 5:F, 6:G, 7:H, 8:I, 9:J, 10:K, 11:L
    const nodeCoords = [
      { name: "A", x: 0, y: 0 },
      { name: "B", x: w, y: h / 3 },
      { name: "C", x: w, y: 0 },
      { name: "D", x: 2 * w, y: (2 * h) / 3 },
      { name: "E", x: 2 * w, y: 0 },
      { name: "F", x: 3 * w, y: h },
      { name: "G", x: 3 * w, y: 0 },
      { name: "H", x: 4 * w, y: (2 * h) / 3 },
      { name: "I", x: 4 * w, y: 0 },
      { name: "J", x: 5 * w, y: h / 3 },
      { name: "K", x: 5 * w, y: 0 },
      { name: "L", x: 6 * w, y: 0 }
    ];

    // 21 Barras
    const members = [
      { u: 0, v: 1, name: "AB" },
      { u: 1, v: 3, name: "BD" },
      { u: 3, v: 5, name: "DF" },
      { u: 5, v: 7, name: "FH" },
      { u: 7, v: 9, name: "HJ" },
      { u: 9, v: 11, name: "JL" },
      { u: 0, v: 2, name: "AC" },
      { u: 2, v: 4, name: "CE" },
      { u: 4, v: 6, name: "EG" },
      { u: 6, v: 8, name: "GI" },
      { u: 8, v: 10, name: "IK" },
      { u: 10, v: 11, name: "KL" },
      { u: 1, v: 2, name: "BC" },
      { u: 3, v: 4, name: "DE" },
      { u: 5, v: 6, name: "FG" },
      { u: 7, v: 8, name: "HI" },
      { u: 9, v: 10, name: "JK" },
      { u: 2, v: 3, name: "CD" },
      { u: 4, v: 5, name: "EF" },
      { u: 5, v: 8, name: "FI" },
      { u: 7, v: 10, name: "HK" }
    ];

    const N = nodeCoords.length;
    const K = Array.from({ length: 2 * N }, () => new Array(2 * N).fill(0));
    const EA = 1.0;

    members.forEach((m) => {
      const p1 = nodeCoords[m.u];
      const p2 = nodeCoords[m.v];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const L = Math.hypot(dx, dy);
      m.length = L;
      const c = dx / L;
      const s = dy / L;

      const ke = [
        [c * c, c * s, -c * c, -c * s],
        [c * s, s * s, -c * s, -s * s],
        [-c * c, -c * s, c * c, c * s],
        [-c * s, -s * s, c * s, s * s]
      ];
      const coeff = EA / L;

      const dofs = [2 * m.u, 2 * m.u + 1, 2 * m.v, 2 * m.v + 1];
      for (let r = 0; r < 4; r++) {
        for (let col = 0; col < 4; col++) {
          K[dofs[r]][dofs[col]] += ke[r][col] * coeff;
        }
      }
    });

    // Vector de fuerzas F (cargas hacia abajo en y -> negativas)
    const F = new Array(2 * N).fill(0);
    F[2 * 0 + 1] = -loads.A;
    F[2 * 1 + 1] = -loads.B;
    F[2 * 3 + 1] = -loads.D;
    F[2 * 5 + 1] = -loads.F;
    F[2 * 7 + 1] = -loads.H;
    F[2 * 9 + 1] = -loads.J;
    F[2 * 11 + 1] = -loads.L;

    // Grados de libertad restringidos: Apoyo A (0: x, 1: y), Apoyo L (23: y)
    const constrainedDofs = new Set([0, 1, 23]);
    const freeDofs = [];
    for (let i = 0; i < 2 * N; i++) {
      if (!constrainedDofs.has(i)) freeDofs.push(i);
    }

    const nFree = freeDofs.length;
    const K_ff = Array.from({ length: nFree }, () => new Array(nFree).fill(0));
    const F_f = new Array(nFree).fill(0);

    for (let i = 0; i < nFree; i++) {
      F_f[i] = F[freeDofs[i]];
      for (let j = 0; j < nFree; j++) {
        K_ff[i][j] = K[freeDofs[i]][freeDofs[j]];
      }
    }

    // Resolver desplazamientos U_f
    const U_f = resolverSistema(K_ff, F_f);
    const U = new Array(2 * N).fill(0);
    for (let i = 0; i < nFree; i++) {
      U[freeDofs[i]] = U_f[i];
    }

    // Calcular fuerzas internas en cada barra
    members.forEach((m) => {
      const p1 = nodeCoords[m.u];
      const p2 = nodeCoords[m.v];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const L = m.length;
      const c = dx / L;
      const s = dy / L;

      const u1x = U[2 * m.u];
      const u1y = U[2 * m.u + 1];
      const u2x = U[2 * m.v];
      const u2y = U[2 * m.v + 1];

      const T = (EA / L) * (-c * u1x - s * u1y + c * u2x + s * u2y);
      m.force = T;
    });

    // Reacciones R = K * U - F
    const R = new Array(2 * N).fill(0);
    for (let i = 0; i < 2 * N; i++) {
      let suma = 0;
      for (let j = 0; j < 2 * N; j++) {
        suma += K[i][j] * U[j];
      }
      R[i] = suma - F[i];
    }

    const reaction_Ax = R[0];
    const reaction_Ay = R[1];
    const reaction_Ly = R[23];

    renderizarResultadosArmadura({
      w,
      h,
      loads,
      nodeCoords,
      members,
      reaction_Ax,
      reaction_Ay,
      reaction_Ly
    });
  }

  function renderizarResultadosArmadura(datos) {
    // Reacciones
    cajaReacciones.innerHTML = `
      <strong>Reacciones en Apoyos:</strong><br>
      • Apoyo fijo A: <strong>R_{Ax} = ${datos.reaction_Ax.toFixed(3)} kN</strong> | <strong>R_{Ay} = ${datos.reaction_Ay.toFixed(3)} kN ↑</strong><br>
      • Apoyo móvil L: <strong>R_{Ly} = ${datos.reaction_Ly.toFixed(3)} kN ↑</strong><br>
      • Comprobación de equilibrio vertical ΣF_y: ${(datos.reaction_Ay + datos.reaction_Ly).toFixed(3)} kN = ${(Object.values(datos.loads).reduce((a, b) => a + b, 0)).toFixed(3)} kN.
    `;

    // Tabla de fuerzas
    tablaBody.innerHTML = "";
    const miembrosDestacados = new Set(["CD", "DE", "DF"]);

    datos.members.forEach((m) => {
      const tr = document.createElement("tr");
      const esDestacado = miembrosDestacados.has(m.name);
      if (esDestacado) tr.style.backgroundColor = "#e8f3f2";

      let estado = "C";
      let estiloEstado = "color:#c0392b; font-weight:bold;";
      if (m.force > 1e-4) {
        estado = "T";
        estiloEstado = "color:#2980b9; font-weight:bold;";
      } else if (Math.abs(m.force) <= 1e-4) {
        estado = "Elemento Cero";
        estiloEstado = "color:#7f8c8d;";
      }

      tr.innerHTML = `
        <td style="text-align:left; font-weight:600;">${esDestacado ? "★ " : ""}${m.name}</td>
        <td>${m.length.toFixed(3)}</td>
        <td><strong>${Math.abs(m.force).toFixed(3)}</strong></td>
        <td><span style="${estiloEstado}">[${estado}]</span></td>
      `;
      tablaBody.appendChild(tr);
    });

    // Dibujo SVG de la armadura
    dibujarArmaduraSVG(datos);
  }

  function dibujarArmaduraSVG(datos) {
    canvasContainer.innerHTML = "";
    const svgAncho = 720;
    const svgAlto = 340;
    const margenX = 50;
    const margenY = 50;

    const maxX = 6 * datos.w;
    const maxY = datos.h;

    function toSvgX(x) {
      return margenX + (x / maxX) * (svgAncho - 2 * margenX);
    }

    function toSvgY(y) {
      return (svgAlto - margenY) - (y / maxY) * (svgAlto - 2 * margenY);
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${svgAncho} ${svgAlto}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.background = "#ffffff";
    svg.style.borderRadius = "8px";
    svg.style.border = "1px solid #ded6c9";

    // Dibujar miembros (barras)
    datos.members.forEach((m) => {
      const p1 = datos.nodeCoords[m.u];
      const p2 = datos.nodeCoords[m.v];
      const x1 = toSvgX(p1.x);
      const y1 = toSvgY(p1.y);
      const x2 = toSvgX(p2.x);
      const y2 = toSvgY(p2.y);

      let color = "#c0392b"; // Compresión
      if (m.force > 1e-4) color = "#2980b9"; // Tensión
      if (Math.abs(m.force) <= 1e-4) color = "#bdc3c7";

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", ["CD", "DE", "DF"].includes(m.name) ? "4.5" : "2.5");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);

      // Texto de etiqueta de la barra en el centro
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", mx);
      text.setAttribute("y", my - 4);
      text.setAttribute("font-size", "10");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#555");
      text.textContent = m.name;
      svg.appendChild(text);
    });

    // Dibujar nodos
    datos.nodeCoords.forEach((node) => {
      const nx = toSvgX(node.x);
      const ny = toSvgY(node.y);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", nx);
      circle.setAttribute("cy", ny);
      circle.setAttribute("r", "5.5");
      circle.setAttribute("fill", "#2c3e50");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", nx);
      label.setAttribute("y", node.y === 0 ? ny + 18 : ny - 10);
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "bold");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#1f272a");
      label.textContent = node.name;
      svg.appendChild(label);

      // Flecha de carga si tiene carga aplicada
      const carga = datos.loads[node.name];
      if (carga && carga > 0) {
        const flecha = document.createElementNS("http://www.w3.org/2000/svg", "line");
        flecha.setAttribute("x1", nx);
        flecha.setAttribute("y1", ny - 32);
        flecha.setAttribute("x2", nx);
        flecha.setAttribute("y2", ny - 8);
        flecha.setAttribute("stroke", "#e67e22");
        flecha.setAttribute("stroke-width", "2.5");
        flecha.setAttribute("marker-end", "url(#flecha-carga)");
        svg.appendChild(flecha);

        const txtCarga = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txtCarga.setAttribute("x", nx);
        txtCarga.setAttribute("y", ny - 36);
        txtCarga.setAttribute("font-size", "10");
        txtCarga.setAttribute("font-weight", "bold");
        txtCarga.setAttribute("fill", "#d35400");
        txtCarga.setAttribute("text-anchor", "middle");
        txtCarga.textContent = `${carga} kN`;
        svg.appendChild(txtCarga);
      }
    });

    canvasContainer.appendChild(svg);
  }

  // Inicializar cálculo con valores de Beer 6.53
  form.dispatchEvent(new Event("submit"));
})();

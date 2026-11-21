/**
 * Utilidad de gráficas en SVG liviana, responsiva y sin dependencias externas
 */
const Graficador = (function () {
  function crearSVG(contenedorId, ancho = 700, alto = 340) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return null;
    contenedor.innerHTML = "";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.borderRadius = "8px";
    svg.style.background = "#ffffff";
    svg.style.border = "1px solid #ded6c9";
    contenedor.appendChild(svg);
    return { svg, ancho, alto };
  }

  function graficarCurvas(contenedorId, opciones) {
    // opciones: { series: [{ fn, puntos, color, grosor, nombre, estilo }], xMin, xMax, puntosDestacados, etiquetas }
    const res = crearSVG(contenedorId);
    if (!res) return;
    const { svg, ancho, alto } = res;
    const margen = { izq: 55, der: 25, arr: 25, aba: 40 };

    let xMin = opciones.xMin ?? -5;
    let xMax = opciones.xMax ?? 5;
    if (xMax <= xMin) xMax = xMin + 1;

    // Muestreo para determinar yMin, yMax
    let yMin = Infinity;
    let yMax = -Infinity;
    const muestras = 200;
    const seriesProcesadas = [];

    (opciones.series || []).forEach((s) => {
      const pts = [];
      if (s.puntos) {
        s.puntos.forEach((p) => {
          if (isFinite(p.x) && isFinite(p.y)) {
            pts.push(p);
            yMin = Math.min(yMin, p.y);
            yMax = Math.max(yMax, p.y);
          }
        });
      } else if (s.fn) {
        const dx = (xMax - xMin) / muestras;
        for (let i = 0; i <= muestras; i++) {
          const x = xMin + i * dx;
          try {
            const y = s.fn(x);
            if (isFinite(y) && Math.abs(y) < 1e6) {
              pts.push({ x, y });
              yMin = Math.min(yMin, y);
              yMax = Math.max(yMax, y);
            }
          } catch (e) {}
        }
      }
      seriesProcesadas.push({ ...s, pts });
    });

    if (!isFinite(yMin) || !isFinite(yMax)) {
      yMin = -5;
      yMax = 5;
    }
    if (yMin === yMax) {
      yMin -= 1;
      yMax += 1;
    }
    const padY = (yMax - yMin) * 0.1 || 1;
    yMin -= padY;
    yMax += padY;

    function escalaX(x) {
      return margen.izq + ((x - xMin) / (xMax - xMin)) * (ancho - margen.izq - margen.der);
    }

    function escalaY(y) {
      return alto - margen.aba - ((y - yMin) / (yMax - yMin)) * (alto - margen.arr - margen.aba);
    }

    // Cuadrícula y Ejes
    const gEjes = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Eje X si está en rango
    if (yMin <= 0 && yMax >= 0) {
      const y0 = escalaY(0);
      const lineaX = document.createElementNS("http://www.w3.org/2000/svg", "line");
      lineaX.setAttribute("x1", margen.izq);
      lineaX.setAttribute("y1", y0);
      lineaX.setAttribute("x2", ancho - margen.der);
      lineaX.setAttribute("y2", y0);
      lineaX.setAttribute("stroke", "#b0a89a");
      lineaX.setAttribute("stroke-width", "1.5");
      gEjes.appendChild(lineaX);
    }

    // Eje Y si está en rango
    if (xMin <= 0 && xMax >= 0) {
      const x0 = escalaX(0);
      const lineaY = document.createElementNS("http://www.w3.org/2000/svg", "line");
      lineaY.setAttribute("x1", x0);
      lineaY.setAttribute("y1", margen.arr);
      lineaY.setAttribute("x2", x0);
      lineaY.setAttribute("y2", alto - margen.aba);
      lineaY.setAttribute("stroke", "#b0a89a");
      lineaY.setAttribute("stroke-width", "1.5");
      gEjes.appendChild(lineaY);
    }

    // Ticks X
    for (let i = 0; i <= 5; i++) {
      const valX = xMin + (i / 5) * (xMax - xMin);
      const px = escalaX(valX);
      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("x", px);
      texto.setAttribute("y", alto - margen.aba + 18);
      texto.setAttribute("text-anchor", "middle");
      texto.setAttribute("font-size", "11");
      texto.setAttribute("fill", "#666");
      texto.textContent = valX.toFixed(valX % 1 === 0 ? 0 : 2);
      gEjes.appendChild(texto);
    }

    // Ticks Y
    for (let i = 0; i <= 4; i++) {
      const valY = yMin + (i / 4) * (yMax - yMin);
      const py = escalaY(valY);
      const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texto.setAttribute("x", margen.izq - 8);
      texto.setAttribute("y", py + 4);
      texto.setAttribute("text-anchor", "end");
      texto.setAttribute("font-size", "11");
      texto.setAttribute("fill", "#666");
      texto.textContent = valY.toFixed(valY % 1 === 0 ? 0 : 1);
      gEjes.appendChild(texto);
    }
    svg.appendChild(gEjes);

    // Dibujar curvas
    seriesProcesadas.forEach((s) => {
      if (s.pts.length < 2) return;
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      const d = s.pts.map((p) => `${escalaX(p.x).toFixed(1)},${escalaY(p.y).toFixed(1)}`).join(" ");
      poly.setAttribute("points", d);
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", s.color || "#0e4d4a");
      poly.setAttribute("stroke-width", s.grosor || "2.2");
      if (s.estilo === "punteado") poly.setAttribute("stroke-dasharray", "4,4");
      svg.appendChild(poly);
    });

    // Puntos destacados
    (opciones.puntosDestacados || []).forEach((pt) => {
      const cx = escalaX(pt.x);
      const cy = escalaY(pt.y);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", pt.radio || "5");
      circle.setAttribute("fill", pt.color || "#c0392b");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "1.5");
      svg.appendChild(circle);

      if (pt.etiqueta) {
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", cx + 8);
        txt.setAttribute("y", cy - 6);
        txt.setAttribute("font-size", "11");
        txt.setAttribute("font-weight", "bold");
        txt.setAttribute("fill", pt.color || "#c0392b");
        txt.textContent = pt.etiqueta;
        svg.appendChild(txt);
      }
    });
  }

  return {
    graficarCurvas
  };
})();

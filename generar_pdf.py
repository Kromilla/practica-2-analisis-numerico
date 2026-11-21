#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del PDF oficial de entrega para la Práctica Computacional 2
Versión 2 - Sin caracteres Unicode especiales (compatibilidad Helvetica)
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, HRFlowable
)

VERDE_OSCURO = colors.HexColor("#0e4d4a")
VERDE_MEDIO  = colors.HexColor("#2a7b76")
VERDE_CLARO  = colors.HexColor("#eef8f2")
BORDE_VERDE  = colors.HexColor("#186638")
CREMA        = colors.HexColor("#faf8f5")
BORDE_CREMA  = colors.HexColor("#ded6c9")
GRIS_OSCURO  = colors.HexColor("#222222")
GRIS_MEDIO   = colors.HexColor("#555555")
GRIS_CLARO   = colors.HexColor("#666666")

W = 480  # ancho útil de tabla

def generar_pdf():
    pdf_path = r"c:\Users\WinterOS\OneDrive\Desktop\Proyecto analisis\practica 2\Entrega-Practica-Computacional-2.pdf"
    img_path = r"c:\Users\WinterOS\OneDrive\Desktop\Proyecto analisis\practica 2\img\problema_beer.png"

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=55,
        leftMargin=55,
        topMargin=48,
        bottomMargin=48,
        title="Práctica Computacional 2 - Análisis Numérico",
        author="Carlos Ibañez, Adriana Olivares, Yineth Avila"
    )

    def estilo(nombre, fuente='Helvetica', tam=10, alin=0, color=GRIS_OSCURO,
               ant=0, dep=0, ld=None):
        return ParagraphStyle(
            nombre,
            fontName=fuente,
            fontSize=tam,
            leading=ld or (tam * 1.4),
            alignment=alin,
            textColor=color,
            spaceBefore=ant,
            spaceAfter=dep
        )

    # --- estilos ---
    s_uni    = estilo('uni',  'Helvetica-Bold', 13, 1, VERDE_OSCURO)
    s_sub    = estilo('sub',  'Helvetica',      10, 1, GRIS_MEDIO)
    s_titulo = estilo('tit',  'Helvetica-Bold', 18, 1, VERDE_OSCURO)
    s_subt   = estilo('subt', 'Helvetica-Bold', 11, 1, VERDE_MEDIO)
    s_sec    = estilo('sec',  'Helvetica-Bold', 11, 0, VERDE_OSCURO, ant=10, dep=2)
    s_prog   = estilo('prog', 'Helvetica-Bold', 10, 0, VERDE_MEDIO,  ant=7, dep=1)
    s_txt    = estilo('txt',  'Helvetica',      9,  0, GRIS_OSCURO,  ld=13)
    s_cent   = estilo('cen',  'Helvetica-Bold', 10, 1, GRIS_OSCURO)
    s_enlace = estilo('enl',  'Helvetica-Bold', 11, 1, VERDE_OSCURO)
    s_pie    = estilo('pie',  'Helvetica',       8, 1, GRIS_CLARO)
    s_hdr_t  = estilo('hdrt', 'Helvetica-Bold',  9, 1, VERDE_OSCURO)
    s_ftr_t  = estilo('ftrt', 'Helvetica',       8, 1, GRIS_CLARO)

    historia = []

    # ══════════════════════════════════════════════
    # BANDA SUPERIOR DE COLOR (simulada con tabla)
    # ══════════════════════════════════════════════
    banda = Table([['']], colWidths=[W])
    banda.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), VERDE_OSCURO),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [VERDE_OSCURO]),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    historia.append(banda)
    historia.append(Spacer(1, 8))

    # ══════════════════════════════════════════════
    # ENCABEZADO INSTITUCIONAL
    # ══════════════════════════════════════════════
    historia.append(Paragraph("UNIVERSIDAD DEL MAGDALENA", s_uni))
    historia.append(Paragraph("FACULTAD DE INGENIERIA - PROGRAMA DE INGENIERIA DE SISTEMAS", s_sub))
    historia.append(Paragraph("ASIGNATURA: ANALISIS NUMERICO", s_sub))
    historia.append(Spacer(1, 14))

    historia.append(Paragraph("PRACTICA COMPUTACIONAL 2", s_titulo))
    historia.append(Paragraph("SUITE DE METODOS NUMERICOS &amp; PROBLEMA DE INGENIERIA", s_subt))
    historia.append(Spacer(1, 14))

    # ══════════════════════════════════════════════
    # TABLA DE INTEGRANTES
    # ══════════════════════════════════════════════
    filas_int = [
        [Paragraph("<b>INTEGRANTES DEL GRUPO DE TRABAJO</b>", s_hdr_t)],
        [Paragraph("Carlos Alfredo Ibanez Ortiz", s_cent)],
        [Paragraph("Adriana Carolina Olivares Vasquez", s_cent)],
        [Paragraph("Yineth Avila Villalobos", s_cent)],
        [Paragraph("<b>Docente:</b> Marlon Andres Hurtado Cantillo &nbsp;&nbsp;|&nbsp;&nbsp; <b>Fecha:</b> Noviembre de 2026", s_ftr_t)],
    ]
    t_int = Table(filas_int, colWidths=[W])
    t_int.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), CREMA),
        ('BACKGROUND',    (0,0), (-1,0),  VERDE_OSCURO),
        ('TEXTCOLOR',     (0,0), (-1,0),  colors.white),
        ('BOX',           (0,0), (-1,-1), 1, BORDE_CREMA),
        ('LINEBELOW',     (0,0), (-1,0),  2, VERDE_OSCURO),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    historia.append(t_int)
    historia.append(Spacer(1, 16))

    # ══════════════════════════════════════════════
    # 1. ENLACE VERCEL
    # ══════════════════════════════════════════════
    historia.append(Paragraph("1. ENLACE DE LA APLICACION WEB (VERCEL)", s_sec))
    historia.append(HRFlowable(width="100%", thickness=2, color=VERDE_OSCURO,
                                spaceBefore=2, spaceAfter=8))

    filas_url = [
        [Paragraph("<b>APLICACION WEB DESPLEGADA EN PRODUCCION</b>", estilo('lb', 'Helvetica-Bold', 9, 0, BORDE_VERDE))],
        [Paragraph(
            '<font size="12"><a href="https://practica-2-analisis-numerico.vercel.app">'
            '<b>https://practica-2-analisis-numerico.vercel.app</b></a></font>',
            s_enlace
        )],
        [Paragraph("Acceder desde cualquier dispositivo con conexion a internet.", s_pie)],
    ]
    t_url = Table(filas_url, colWidths=[W])
    t_url.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), VERDE_CLARO),
        ('BOX',           (0,0), (-1,-1), 1.5, BORDE_VERDE),
        ('LINEBELOW',     (0,0), (-1,0),  1, BORDE_VERDE),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('RIGHTPADDING',  (0,0), (-1,-1), 10),
    ]))
    historia.append(t_url)
    historia.append(Spacer(1, 16))

    # ══════════════════════════════════════════════
    # 2. DESCRIPCION DE LOS 5 PROGRAMAS
    # ══════════════════════════════════════════════
    historia.append(Paragraph("2. PROGRAMAS DESARROLLADOS EN LA SUITE", s_sec))
    historia.append(HRFlowable(width="100%", thickness=2, color=VERDE_OSCURO,
                                spaceBefore=2, spaceAfter=8))

    # -- tabla de 5 programas --
    s_num  = estilo('num', 'Helvetica-Bold', 14, 1, VERDE_OSCURO)
    s_pnom = estilo('pnom','Helvetica-Bold',  9, 0, VERDE_OSCURO)
    s_pdes = estilo('pdes','Helvetica',        8, 0, GRIS_OSCURO, ld=12)

    programas = [
        (
            "1",
            "Calculadora de Raices de Ecuaciones",
            "Aproximacion de raices para ecuaciones no lineales f(x) = 0 mediante los metodos de "
            "<b>Biseccion</b>, <b>Falsa Posicion</b> (Regula Falsi), <b>Secante</b>, "
            "<b>Newton-Raphson</b> y <b>Punto Fijo</b>. Incorpora validacion del Teorema de "
            "Bolzano, derivadas analiticas o automaticas, tabla completa de iteraciones con "
            "error absoluto y relativo (%), y grafica interactiva de convergencia."
        ),
        (
            "2",
            "Calculadora de Interpolacion Polinomial",
            "Construccion del polinomio interpolante exacto P(x) mediante el <b>Polinomio de "
            "Taylor</b> de orden n alrededor de x0, <b>Polinomio de Lagrange</b> (desglose de "
            "polinomios base Li(x)) y <b>Diferencias Divididas de Newton</b> con generacion de "
            "tabla triangular completa y evaluacion en punto x*."
        ),
        (
            "3",
            "Calculadora de Diferenciacion e Integracion Numerica",
            "Derivacion por diferencias finitas hacia <b>adelante O(h)</b>, hacia <b>atras O(h)</b>, "
            "<b>centrada O(h^2)</b> y <b>centrada de 5 puntos O(h^4)</b>. En integracion aplica "
            "las <b>Reglas de Newton-Cotes</b> simples y compuestas: <b>Trapecio</b>, "
            "<b>1/3 de Simpson</b> (n par), <b>3/8 de Simpson</b> (n multiplo de 3) y "
            "<b>Boole</b> (n = 4), con desglose detallado de formulas paso a paso."
        ),
        (
            "4",
            "Solucion Numerica de EDO para PVI",
            "Resolucion de problemas de valor inicial y'(t) = f(t, y) con y(t0) = y0 en un "
            "intervalo [t0, tf] con paso h. Ejecuta y compara simultaneamente el <b>Metodo de "
            "Euler O(h)</b>, <b>Metodo de Heun (Euler Mejorado) O(h^2)</b> y <b>Runge-Kutta "
            "de 4to Orden (RK4) O(h^4)</b>, calculando error relativo porcentual respecto a "
            "la solucion analitica exacta."
        ),
        (
            "5",
            "Problema de Ingenieria - Armadura Pratt (Beer &amp; Johnston 6.53)",
            "Modelado estructural parametrico del ejercicio 6.53 de estatica. Aplica el "
            "<b>Metodo de Rigidez Matricial 2D</b> (sistema de 21 ecuaciones lineales de "
            "equilibrio) para determinar reacciones en apoyos fijos y moviles, y las fuerzas "
            "axiales en los 21 elementos clasificandolos en Tension [T] o Compresion [C], "
            "resaltando las barras CD, DE y DF."
        ),
    ]

    filas_progs = []
    for num, nombre, desc in programas:
        fila = [
            Paragraph(num, s_num),
            [Paragraph(nombre, s_pnom), Spacer(1, 2), Paragraph(desc, s_pdes)]
        ]
        filas_progs.append(fila)

    t_progs = Table(filas_progs, colWidths=[32, W-32])
    estilo_filas = []
    for i in range(len(programas)):
        bg = CREMA if i % 2 == 0 else colors.white
        estilo_filas.append(('BACKGROUND', (0, i), (-1, i), bg))

    t_progs.setStyle(TableStyle([
        ('BOX',           (0,0), (-1,-1), 1, BORDE_CREMA),
        ('INNERGRID',     (0,0), (-1,-1), 0.5, BORDE_CREMA),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 7),
        ('RIGHTPADDING',  (0,0), (-1,-1), 7),
        # Columna izquierda (número) fondo verde
        ('BACKGROUND',    (0,0), (0,-1), VERDE_OSCURO),
        ('TEXTCOLOR',     (0,0), (0,-1), colors.white),
    ] + estilo_filas))
    historia.append(t_progs)
    historia.append(Spacer(1, 16))

    # ══════════════════════════════════════════════
    # 3. IMAGEN DEL PROBLEMA DE INGENIERIA
    # ══════════════════════════════════════════════
    historia.append(Paragraph("3. IMAGEN DEL PROBLEMA DE INGENIERIA A RESOLVER", s_sec))
    historia.append(HRFlowable(width="100%", thickness=2, color=VERDE_OSCURO,
                                spaceBefore=2, spaceAfter=8))

    historia.append(Paragraph(
        "Ejercicio 6.53 tomado del libro <i>Mecanica Vectorial para Ingenieros: Estatica</i> "
        "(Beer, Johnston, Mazurek):",
        s_txt
    ))
    historia.append(Spacer(1, 6))

    if os.path.exists(img_path):
        historia.append(Image(img_path, width=W, height=int(W * 0.5)))
    else:
        historia.append(Paragraph("[Imagen no encontrada: " + img_path + "]",
                                   estilo('err','Helvetica',8,1,colors.red)))

    historia.append(Spacer(1, 4))
    historia.append(Paragraph(
        "<i>Figura: Esquema geometrico y cargas nodales de la Armadura Pratt (Ejercicio 6.53).</i>",
        s_pie
    ))
    historia.append(Spacer(1, 16))

    # ══════════════════════════════════════════════
    # BANDA INFERIOR
    # ══════════════════════════════════════════════
    historia.append(HRFlowable(width="100%", thickness=1, color=BORDE_CREMA,
                                spaceBefore=4, spaceAfter=4))
    historia.append(Paragraph(
        "Practica Computacional 2 &nbsp;|&nbsp; Analisis Numerico &nbsp;|&nbsp; "
        "Universidad del Magdalena &nbsp;|&nbsp; Noviembre 2026",
        s_pie
    ))

    doc.build(historia)
    print("PDF generado con exito:")
    print(" ", pdf_path)

if __name__ == "__main__":
    generar_pdf()

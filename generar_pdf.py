#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del PDF oficial de entrega para la Práctica Computacional 2
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, HRFlowable
)

def generar_pdf():
    pdf_path = r"c:\Users\WinterOS\OneDrive\Desktop\Proyecto analisis\practica 2\Entrega-Practica-Computacional-2.pdf"
    img_path = r"c:\Users\WinterOS\OneDrive\Desktop\Proyecto analisis\practica 2\img\problema_beer.png"

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Estilos personalizados
    titulo_uni = ParagraphStyle(
        'TituloUni',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#0e4d4a")
    )
    subtitulo_uni = ParagraphStyle(
        'SubtituloUni',
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        alignment=1,
        textColor=colors.HexColor("#555555")
    )
    titulo_doc = ParagraphStyle(
        'TituloDoc',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=1,
        textColor=colors.HexColor("#0e4d4a")
    )
    subtitulo_doc = ParagraphStyle(
        'SubtituloDoc',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        alignment=1,
        textColor=colors.HexColor("#2a7b76")
    )
    encabezado_sec = ParagraphStyle(
        'EncabezadoSec',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0e4d4a"),
        spaceBefore=10,
        spaceAfter=4
    )
    nombre_prog = ParagraphStyle(
        'NombreProg',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#2a7b76"),
        spaceBefore=6,
        spaceAfter=2
    )
    texto_normal = ParagraphStyle(
        'TextoNormal',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#222222")
    )
    texto_integrante = ParagraphStyle(
        'TextoIntegrante',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        alignment=1,
        textColor=colors.HexColor("#1f272a")
    )
    caja_enlace = ParagraphStyle(
        'CajaEnlace',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        alignment=1,
        textColor=colors.HexColor("#0e4d4a")
    )

    historia = []

    # ==================== PORTADA / ENCABEZADO ====================
    historia.append(Paragraph("UNIVERSIDAD DEL MAGDALENA", titulo_uni))
    historia.append(Paragraph("FACULTAD DE INGENIERÍA · PROGRAMA DE INGENIERÍA DE SISTEMAS", subtitulo_uni))
    historia.append(Paragraph("ASIGNATURA: ANÁLISIS NUMÉRICO", subtitulo_uni))
    historia.append(Spacer(1, 15))

    historia.append(Paragraph("PRÁCTICA COMPUTACIONAL 2", titulo_doc))
    historia.append(Paragraph("SUITE DE MÉTODOS NUMÉRICOS & PROBLEMA DE INGENIERÍA", subtitulo_doc))
    historia.append(Spacer(1, 12))

    # Caja de Integrantes
    datos_integrantes = [
        [Paragraph("<b>INTEGRANTES DEL GRUPO DE TRABAJO</b>", ParagraphStyle('Hdr', fontName='Helvetica-Bold', fontSize=10, alignment=1, textColor=colors.HexColor("#0e4d4a")))],
        [Paragraph("Carlos Alfredo Ibañez Ortiz", texto_integrante)],
        [Paragraph("Adriana Carolina Olivares Vásquez", texto_integrante)],
        [Paragraph("Yineth Ávila Villalobos", texto_integrante)],
        [Paragraph("<b>Docente:</b> Marlon Andrés Hurtado Cantillo &nbsp;&nbsp;|&nbsp;&nbsp; <b>Fecha:</b> Noviembre de 2026", ParagraphStyle('Ftr', fontName='Helvetica', fontSize=8.5, alignment=1, textColor=colors.HexColor("#666666")))]
    ]
    tabla_int = Table(datos_integrantes, colWidths=[480])
    tabla_int.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#faf8f5")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#ded6c9")),
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor("#0e4d4a")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    historia.append(tabla_int)
    historia.append(Spacer(1, 12))

    # ==================== ENLACE A VERCEL ====================
    historia.append(Paragraph("1. ENLACE DE LA APLICACIÓN WEB (VERCEL)", encabezado_sec))
    historia.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0e4d4a"), spaceBefore=2, spaceAfter=8))

    datos_enlace = [
        [Paragraph("🌐 <b>APLICACIÓN WEB DESPLEGADA EN PRODUCCIÓN</b>", ParagraphStyle('Lbl', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor("#186638")))],
        [Paragraph('<font size="11"><a href="https://practica-2-analisis-numerico.vercel.app"><b>https://practica-2-analisis-numerico.vercel.app</b></a></font>', caja_enlace)]
    ]
    tabla_enlace = Table(datos_enlace, colWidths=[480])
    tabla_enlace.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eef8f2")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#186638")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    historia.append(tabla_enlace)
    historia.append(Spacer(1, 10))

    # ==================== DESCRIPCIÓN DE LAS 5 CALCULADORAS ====================
    historia.append(Paragraph("2. PROGRAMAS DESARROLLADOS EN LA SUITE", encabezado_sec))
    historia.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0e4d4a"), spaceBefore=2, spaceAfter=6))

    historia.append(Paragraph("Programa 1: Calculadora de Raíces de Ecuaciones", nombre_prog))
    historia.append(Paragraph(
        "Aproximación de raíces para ecuaciones no lineales <i>f(x) = 0</i> mediante los métodos de <b>Bisección</b>, <b>Falsa Posición</b> (Regula Falsi), <b>Secante</b>, <b>Newton-Raphson</b> y <b>Punto Fijo</b>. Incorpora validación del Teorema de Bolzano, derivadas analíticas o automáticas, tabla completa de iteraciones con error absoluto y relativo %, y gráfica interactiva de convergencia.",
        texto_normal
    ))

    historia.append(Paragraph("Programa 2: Calculadora de Interpolación Polinomial", nombre_prog))
    historia.append(Paragraph(
        "Construcción del polinomio interpolante exacto <i>P(x)</i> mediante el <b>Polinomio de Taylor</b> de orden <i>n</i> alrededor de <i>x₀</i>, <b>Polinomio de Lagrange</b> (desglose de polinomios base <i>Lᵢ(x)</i>) y <b>Diferencias Divididas de Newton</b> con generación de tabla triangular completa y evaluación en punto <i>x*</i>.",
        texto_normal
    ))

    historia.append(Paragraph("Programa 3: Calculadora de Diferenciación e Integración Numérica", nombre_prog))
    historia.append(Paragraph(
        "Implementa las fórmulas de la Unidad 3: derivación por diferencias finitas hacia <b>adelante</b> <i>O(h)</i>, hacia <b>atrás</b> <i>O(h)</i>, <b>centrada</b> <i>O(h²)</i> y <b>centrada de 5 puntos</b> <i>O(h⁴)</i>. En integración, aplica las <b>Reglas de Newton-Cotes</b> simples y compuestas: <b>Trapecio</b>, <b>1/3 de Simpson</b> (<i>n</i> par), <b>3/8 de Simpson</b> (<i>n</i> múltiplo de 3) y <b>Boole</b> (<i>n = 4</i>), con desglose detallado de fórmulas expandidas paso a paso.",
        texto_normal
    ))

    historia.append(Paragraph("Programa 4: Solución Numérica de EDO para PVI", nombre_prog))
    historia.append(Paragraph(
        "Resolución de problemas de valor inicial <i>y'(t) = f(t, y)</i> con <i>y(t₀) = y₀</i> en un intervalo <i>[t₀, t_f]</i> con paso <i>h</i>. Ejecuta y compara simultáneamente el <b>Método de Euler</b> <i>O(h)</i>, <b>Método de Heun (Euler Mejorado)</b> <i>O(h²)</i> y <b>Runge-Kutta de 4to Orden (RK4)</b> <i>O(h⁴)</i>, calculando error relativo porcentual respecto a la solución analítica exacta.",
        texto_normal
    ))

    historia.append(Paragraph("Programa 5: Problema de Ingeniería · Armadura Pratt (Beer & Johnston 6.53)", nombre_prog))
    historia.append(Paragraph(
        "Modelado estructural paramétrico del ejercicio 6.53 de estática. Aplica el <b>Método de Rigidez Matricial 2D</b> (sistema de 21 ecuaciones lineales de equilibrio) para determinar reacciones en apoyos fijos y móviles, y las fuerzas axiales en los 21 elementos clasificándolos en Tensión [T] o Compresión [C], resaltando las barras <i>CD</i>, <i>DE</i> y <i>DF</i>.",
        texto_normal
    ))
    historia.append(Spacer(1, 10))

    # ==================== IMAGEN DEL PROBLEMA DE INGENIERÍA ====================
    historia.append(Paragraph("3. IMAGEN DEL PROBLEMA DE INGENIERÍA A RESOLVER", encabezado_sec))
    historia.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0e4d4a"), spaceBefore=2, spaceAfter=8))

    historia.append(Paragraph("Ejercicio 6.53 tomado del libro <i>Mecánica Vectorial para Ingenieros: Estática</i> (Beer, Johnston, Mazurek):", texto_normal))
    historia.append(Spacer(1, 4))

    if os.path.exists(img_path):
        historia.append(Image(img_path, width=420, height=210))
    historia.append(Spacer(1, 4))
    historia.append(Paragraph("<font size='8' color='#666666'><i>Figura: Esquema geométrico y cargas nodales de la Armadura Pratt (Ejercicio 6.53).</i></font>", ParagraphStyle('Cap', alignment=1)))

    doc.build(historia)
    print("PDF generado con éxito en:", pdf_path)

if __name__ == "__main__":
    generar_pdf()

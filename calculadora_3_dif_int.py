#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universidad del Magdalena - Análisis Numérico
Docente: Marlon Andrés Hurtado Cantillo
Práctica Computacional 2 - Programa 3: Diferenciación e Integración Numérica
Integrantes: Carlos Alfredo Ibañez Ortiz, Adriana Carolina Olivares Vásquez, Yineth Ávila Villalobos
"""

import math
import tkinter as tk
from tkinter import ttk, messagebox

class DifIntGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Programa 3: Diferenciación e Integración · Unimagdalena")
        self.root.geometry("860x620")

        header = ttk.Frame(root, padding="10")
        header.pack(fill=tk.X)
        ttk.Label(header, text="Universidad del Magdalena · Análisis Numérico (Unidad 3)", font=("Segoe UI", 10, "bold"), foreground="#0e4d4a").pack()
        ttk.Label(header, text="Calculadora de Diferenciación e Integración Numérica", font=("Segoe UI", 13, "bold")).pack()
        ttk.Label(header, text="Carlos Ibañez · Adriana Olivares · Yineth Ávila", font=("Segoe UI", 9)).pack()

        main = ttk.Frame(root, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(main, text="Parámetros", padding="10")
        left.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        ttk.Label(left, text="Operación:").grid(row=0, column=0, sticky=tk.W, pady=3)
        self.combo_op = ttk.Combobox(left, values=["Integración (Newton-Cotes)", "Diferenciación Numérica"], state="readonly")
        self.combo_op.set("Integración (Newton-Cotes)")
        self.combo_op.grid(row=0, column=1, pady=3)

        ttk.Label(left, text="Puntos discretos (x, y):").grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=(8, 2))
        self.txt_pts = tk.Text(left, width=28, height=8, font=("Consolas", 10))
        # Ejemplo de la página 11 del PDF
        self.txt_pts.insert(tk.END, "0, 5\n1, 4\n2, 6\n3, -2\n4, 5\n5, 7\n6, 3")
        self.txt_pts.grid(row=2, column=0, columnspan=2, pady=2)

        ttk.Button(left, text="Calcular", command=self.calcular).grid(row=3, column=0, columnspan=2, pady=10)

        right = ttk.LabelFrame(main, text="Procedimiento y Fórmulas", padding="10")
        right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.txt_res = tk.Text(right, font=("Consolas", 10), wrap=tk.WORD)
        self.txt_res.pack(fill=tk.BOTH, expand=True)

    def calcular(self):
        self.txt_res.delete(1.0, tk.END)
        try:
            lineas = self.txt_pts.get(1.0, tk.END).strip().splitlines()
            pts = []
            for l in lineas:
                if not l.strip(): continue
                partes = l.replace(";", ",").split(",")
                pts.append((float(partes[0].strip()), float(partes[1].strip())))

            pts.sort(key=lambda p: p[0])
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            n = len(xs) - 1
            h = xs[1] - xs[0]

            self.txt_res.insert(tk.END, f"=== ANÁLISIS DE INTERVALOS ===\n")
            self.txt_res.insert(tk.END, f"Intervalo: [{xs[0]}, {xs[-1]}] | Subintervalos n = {n} | Paso h = {h}\n\n")

            # Trapecio
            suma_int = sum(ys[1:-1])
            I_trap = (h / 2.0) * (ys[0] + 2 * suma_int + ys[-1])
            self.txt_res.insert(tk.END, f"1. REGLA COMPUESTA DEL TRAPECIO:\n")
            self.txt_res.insert(tk.END, f"   Aproximación I ≈ {I_trap:.4f}\n\n")

            # Simpson 1/3
            self.txt_res.insert(tk.END, f"2. REGLA COMPUESTA 1/3 DE SIMPSON:\n")
            if n % 2 == 0:
                s_imp = sum(ys[i] for i in range(1, n, 2))
                s_par = sum(ys[i] for i in range(2, n, 2))
                I_s13 = (h / 3.0) * (ys[0] + 4 * s_imp + 2 * s_par + ys[-1])
                self.txt_res.insert(tk.END, f"   n = {n} es par -> Aplicable.\n")
                self.txt_res.insert(tk.END, f"   Aproximación I ≈ {I_s13:.4f}\n\n")
            else:
                self.txt_res.insert(tk.END, f"   No aplicable (n={n} es impar).\n\n")

            # Simpson 3/8
            self.txt_res.insert(tk.END, f"3. REGLA COMPUESTA 3/8 DE SIMPSON:\n")
            if n % 3 == 0:
                s_3k = sum(ys[i] for i in range(3, n, 3))
                s_resto = sum(ys[1:-1]) - s_3k
                I_s38 = (3 * h / 8.0) * (ys[0] + 3 * s_resto + 2 * s_3k + ys[-1])
                self.txt_res.insert(tk.END, f"   n = {n} es múltiplo de 3 -> Aplicable.\n")
                self.txt_res.insert(tk.END, f"   Aproximación I ≈ {I_s38:.4f}\n\n")
            else:
                self.txt_res.insert(tk.END, f"   No aplicable (n={n} no es múltiplo de 3).\n\n")

        except Exception as err:
            messagebox.showerror("Error", str(err))

if __name__ == "__main__":
    root = tk.Tk()
    app = DifIntGUI(root)
    root.mainloop()

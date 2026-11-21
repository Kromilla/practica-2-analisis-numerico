#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universidad del Magdalena - Análisis Numérico
Docente: Marlon Andrés Hurtado Cantillo
Práctica Computacional 2 - Programa 2: Calculadora de Interpolación Polinomial
Integrantes: Carlos Alfredo Ibañez Ortiz, Adriana Carolina Olivares Vásquez, Yineth Ávila Villalobos
"""

import math
import tkinter as tk
from tkinter import ttk, messagebox

class InterpolacionGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Programa 2: Interpolación Polinomial · Unimagdalena")
        self.root.geometry("860x600")

        header = ttk.Frame(root, padding="10")
        header.pack(fill=tk.X)
        ttk.Label(header, text="Universidad del Magdalena · Análisis Numérico", font=("Segoe UI", 10, "bold"), foreground="#0e4d4a").pack()
        ttk.Label(header, text="Calculadora de Interpolación Polinomial (Taylor, Lagrange, Newton)", font=("Segoe UI", 13, "bold")).pack()
        ttk.Label(header, text="Carlos Ibañez · Adriana Olivares · Yineth Ávila", font=("Segoe UI", 9)).pack()

        main = ttk.Frame(root, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(main, text="Datos de Entrada", padding="10")
        left.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        ttk.Label(left, text="Método:").grid(row=0, column=0, sticky=tk.W, pady=3)
        self.combo = ttk.Combobox(left, values=["Lagrange", "Diferencias Divididas de Newton"], state="readonly")
        self.combo.set("Diferencias Divididas de Newton")
        self.combo.grid(row=0, column=1, pady=3)

        ttk.Label(left, text="Puntos (x, y) [uno por fila]:").grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=(8, 2))
        self.txt_pts = tk.Text(left, width=28, height=8, font=("Consolas", 10))
        self.txt_pts.insert(tk.END, "1.0, 1.0\n2.0, 0.5\n4.0, 0.25\n5.0, 0.2")
        self.txt_pts.grid(row=2, column=0, columnspan=2, pady=2)

        ttk.Label(left, text="Evaluar en x*:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.entry_xeval = ttk.Entry(left, width=12)
        self.entry_xeval.insert(0, "3.0")
        self.entry_xeval.grid(row=3, column=1, sticky=tk.W, pady=5)

        ttk.Button(left, text="Calcular Polinomio", command=self.calcular).grid(row=4, column=0, columnspan=2, pady=10)

        right = ttk.LabelFrame(main, text="Resultado", padding="10")
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

            if len(pts) < 2:
                messagebox.showerror("Error", "Ingrese al menos 2 puntos.")
                return

            x_eval = float(self.entry_xeval.get())
            n = len(pts)

            # Newton
            tabla = [[0.0] * n for _ in range(n)]
            for i in range(n): tabla[i][0] = pts[i][1]
            for j in range(1, n):
                for i in range(n - j):
                    tabla[i][j] = (tabla[i + 1][j - 1] - tabla[i][j - 1]) / (pts[i + j][0] - pts[i][0])

            # Evaluar
            y_eval = tabla[0][0]
            mult = 1.0
            for j in range(1, n):
                mult *= (x_eval - pts[j - 1][0])
                y_eval += tabla[0][j] * mult

            self.txt_res.insert(tk.END, f"=== POLINOMIO INTERPOLANTE ===\n")
            self.txt_res.insert(tk.END, f"Valor estimado en x* = {x_eval}: P({x_eval}) = {y_eval:.6f}\n\n")

            self.txt_res.insert(tk.END, "=== TABLA DE DIFERENCIAS DIVIDIDAS ===\n")
            header = f"{'i':<3} {'xi':<8} {'f[xi]':<10} " + " ".join([f"Orden {k:<8}" for k in range(1, n)]) + "\n"
            self.txt_res.insert(tk.END, header)
            self.txt_res.insert(tk.END, "-" * len(header) + "\n")
            for i in range(n):
                fila = f"{i:<3} {pts[i][0]:<8.3f} "
                for j in range(n - i):
                    fila += f"{tabla[i][j]:<14.6f} "
                self.txt_res.insert(tk.END, fila + "\n")

        except Exception as err:
            messagebox.showerror("Error", str(err))

if __name__ == "__main__":
    root = tk.Tk()
    app = InterpolacionGUI(root)
    root.mainloop()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universidad del Magdalena - Análisis Numérico
Docente: Marlon Andrés Hurtado Cantillo
Práctica Computacional 2 - Programa 4: Solución Numérica de EDO para PVI
Integrantes: Carlos Alfredo Ibañez Ortiz, Adriana Carolina Olivares Vásquez, Yineth Ávila Villalobos
"""

import math
import tkinter as tk
from tkinter import ttk, messagebox

def f_eval(expr, t, y):
    allowed = {
        't': t, 'y': y, 'math': math,
        'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
        'exp': math.exp, 'ln': math.log, 'sqrt': math.sqrt,
        'pi': math.pi, 'e': math.e
    }
    return float(eval(expr.replace('^', '**'), {"__builtins__": None}, allowed))

class EdoPviGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Programa 4: EDO para PVI · Unimagdalena")
        self.root.geometry("880x600")

        header = ttk.Frame(root, padding="10")
        header.pack(fill=tk.X)
        ttk.Label(header, text="Universidad del Magdalena · Análisis Numérico (Unidad 3)", font=("Segoe UI", 10, "bold"), foreground="#0e4d4a").pack()
        ttk.Label(header, text="Calculadora de Solución Numérica de EDO para PVI (Euler, Heun, RK4)", font=("Segoe UI", 13, "bold")).pack()
        ttk.Label(header, text="Carlos Ibañez · Adriana Olivares · Yineth Ávila", font=("Segoe UI", 9)).pack()

        main = ttk.Frame(root, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(main, text="Parámetros del PVI", padding="10")
        left.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        ttk.Label(left, text="y' = f(t, y):").grid(row=0, column=0, sticky=tk.W, pady=3)
        self.entry_f = ttk.Entry(left, width=22)
        self.entry_f.insert(0, "y - t**2 + 1")
        self.entry_f.grid(row=0, column=1, pady=3)

        ttk.Label(left, text="t₀:").grid(row=1, column=0, sticky=tk.W, pady=3)
        self.entry_t0 = ttk.Entry(left, width=22)
        self.entry_t0.insert(0, "0.0")
        self.entry_t0.grid(row=1, column=1, pady=3)

        ttk.Label(left, text="y₀ = y(t₀):").grid(row=2, column=0, sticky=tk.W, pady=3)
        self.entry_y0 = ttk.Entry(left, width=22)
        self.entry_y0.insert(0, "0.5")
        self.entry_y0.grid(row=2, column=1, pady=3)

        ttk.Label(left, text="t_final:").grid(row=3, column=0, sticky=tk.W, pady=3)
        self.entry_tf = ttk.Entry(left, width=22)
        self.entry_tf.insert(0, "0.4")
        self.entry_tf.grid(row=3, column=1, pady=3)

        ttk.Label(left, text="Paso h:").grid(row=4, column=0, sticky=tk.W, pady=3)
        self.entry_h = ttk.Entry(left, width=22)
        self.entry_h.insert(0, "0.2")
        self.entry_h.grid(row=4, column=1, pady=3)

        ttk.Button(left, text="Resolver y Comparar", command=self.calcular).grid(row=5, column=0, columnspan=2, pady=12)

        right = ttk.LabelFrame(main, text="Tabla Comparativa", padding="10")
        right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        cols = ["i", "t_i", "Euler y_i", "Heun y_i", "RK4 y_i"]
        self.tree = ttk.Treeview(right, columns=cols, show="headings")
        for c in cols:
            self.tree.heading(c, text=c)
            self.tree.column(c, width=100, anchor=tk.CENTER)
        self.tree.pack(fill=tk.BOTH, expand=True)

    def calcular(self):
        for item in self.tree.get_children():
            self.tree.delete(item)

        try:
            expr = self.entry_f.get()
            t0 = float(self.entry_t0.get())
            y0 = float(self.entry_y0.get())
            tf = float(self.entry_tf.get())
            h = float(self.entry_h.get())

            n = int(round((tf - t0) / h))
            ts = [t0 + i * h for i in range(n + 1)]

            # Euler
            ye = [y0]
            for i in range(n):
                ye.append(ye[-1] + h * f_eval(expr, ts[i], ye[-1]))

            # Heun
            yh = [y0]
            for i in range(n):
                ti, yi = ts[i], yh[-1]
                ypred = yi + h * f_eval(expr, ti, yi)
                yh.append(yi + (h / 2.0) * (f_eval(expr, ti, yi) + f_eval(expr, ts[i + 1], ypred)))

            # RK4
            yrk = [y0]
            for i in range(n):
                ti, yi = ts[i], yrk[-1]
                k1 = f_eval(expr, ti, yi)
                k2 = f_eval(expr, ti + h / 2.0, yi + (h / 2.0) * k1)
                k3 = f_eval(expr, ti + h / 2.0, yi + (h / 2.0) * k2)
                k4 = f_eval(expr, ti + h, yi + h * k3)
                yrk.append(yi + (h / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4))

            for i in range(n + 1):
                self.tree.insert("", tk.END, values=(i, f"{ts[i]:.2f}", f"{ye[i]:.6f}", f"{yh[i]:.6f}", f"{yrk[i]:.7f}"))

        except Exception as err:
            messagebox.showerror("Error", str(err))

if __name__ == "__main__":
    root = tk.Tk()
    app = EdoPviGUI(root)
    root.mainloop()

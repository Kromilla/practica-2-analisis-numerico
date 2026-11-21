#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Universidad del Magdalena - Análisis Numérico
Docente: Marlon Andrés Hurtado Cantillo
Práctica Computacional 2 - Programa 1: Calculadora de Raíces
Integrantes: Carlos Alfredo Ibañez Ortiz, Adriana Carolina Olivares Vásquez, Yineth Ávila Villalobos
"""

import math
import tkinter as tk
from tkinter import ttk, messagebox

def safe_eval(expr, x):
    # Entorno seguro de evaluación
    allowed = {
        'x': x, 'math': math,
        'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
        'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
        'exp': math.exp, 'ln': math.log, 'log': math.log10,
        'sqrt': math.sqrt, 'abs': abs, 'pi': math.pi, 'e': math.e
    }
    expr_clean = expr.replace('^', '**')
    return float(eval(expr_clean, {"__builtins__": None}, allowed))

class CalculadoraRaicesGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Programa 1: Calculadora de Raíces · Unimagdalena")
        self.root.geometry("880x640")

        header = ttk.Frame(root, padding="10")
        header.pack(fill=tk.X)
        ttk.Label(header, text="Universidad del Magdalena · Análisis Numérico", font=("Segoe UI", 10, "bold"), foreground="#0e4d4a").pack()
        ttk.Label(header, text="Calculadora de Raíces de Ecuaciones", font=("Segoe UI", 14, "bold")).pack()
        ttk.Label(header, text="Carlos Ibañez · Adriana Olivares · Yineth Ávila", font=("Segoe UI", 9)).pack()

        main = ttk.Frame(root, padding="10")
        main.pack(fill=tk.BOTH, expand=True)

        left = ttk.LabelFrame(main, text="Parámetros", padding="10")
        left.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))

        ttk.Label(left, text="Método:").grid(row=0, column=0, sticky=tk.W, pady=3)
        self.combo_metodo = ttk.Combobox(left, values=["Bisección", "Falsa Posición", "Secante", "Newton-Raphson", "Punto Fijo"], state="readonly")
        self.combo_metodo.set("Bisección")
        self.combo_metodo.grid(row=0, column=1, pady=3)
        self.combo_metodo.bind("<<ComboboxSelected>>", self.actualizar_campos)

        ttk.Label(left, text="f(x):").grid(row=1, column=0, sticky=tk.W, pady=3)
        self.entry_fx = ttk.Entry(left, width=22)
        self.entry_fx.insert(0, "x^3 - 2*x - 5")
        self.entry_fx.grid(row=1, column=1, pady=3)

        self.lbl_gx = ttk.Label(left, text="g(x):")
        self.entry_gx = ttk.Entry(left, width=22)
        self.entry_gx.insert(0, "(2*x + 5)**(1/3)")

        self.lbl_p1 = ttk.Label(left, text="Extremo a:")
        self.entry_p1 = ttk.Entry(left, width=22)
        self.entry_p1.insert(0, "2.0")

        self.lbl_p2 = ttk.Label(left, text="Extremo b:")
        self.entry_p2 = ttk.Entry(left, width=22)
        self.entry_p2.insert(0, "3.0")

        self.lbl_p1.grid(row=3, column=0, sticky=tk.W, pady=3)
        self.entry_p1.grid(row=3, column=1, pady=3)
        self.lbl_p2.grid(row=4, column=0, sticky=tk.W, pady=3)
        self.entry_p2.grid(row=4, column=1, pady=3)

        ttk.Label(left, text="Tolerancia ε:").grid(row=5, column=0, sticky=tk.W, pady=3)
        self.entry_tol = ttk.Entry(left, width=22)
        self.entry_tol.insert(0, "0.0001")
        self.entry_tol.grid(row=5, column=1, pady=3)

        ttk.Label(left, text="Iteraciones máx:").grid(row=6, column=0, sticky=tk.W, pady=3)
        self.entry_max = ttk.Entry(left, width=22)
        self.entry_max.insert(0, "50")
        self.entry_max.grid(row=6, column=1, pady=3)

        btn_box = ttk.Frame(left)
        btn_box.grid(row=7, column=0, columnspan=2, pady=12)
        ttk.Button(btn_box, text="Calcular", command=self.calcular).pack(side=tk.LEFT, padx=4)
        ttk.Button(btn_box, text="Ejemplo", command=self.cargar_ejemplo).pack(side=tk.LEFT, padx=4)

        # Right
        right = ttk.LabelFrame(main, text="Resultados", padding="10")
        right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.lbl_resumen = ttk.Label(right, text="Seleccione método y presione Calcular.", font=("Segoe UI", 10, "bold"))
        self.lbl_resumen.pack(anchor=tk.W, pady=(0, 6))

        self.tree = ttk.Treeview(right, show="headings")
        self.tree.pack(fill=tk.BOTH, expand=True)

    def actualizar_campos(self, event=None):
        m = self.combo_metodo.get()
        if m in ["Bisección", "Falsa Posición"]:
            self.lbl_p1.config(text="Extremo a:")
            self.lbl_p2.config(text="Extremo b:")
            self.lbl_p2.grid()
            self.entry_p2.grid()
            self.lbl_gx.grid_remove()
            self.entry_gx.grid_remove()
        elif m == "Secante":
            self.lbl_p1.config(text="Punto x₀:")
            self.lbl_p2.config(text="Punto x₁:")
            self.lbl_p2.grid()
            self.entry_p2.grid()
            self.lbl_gx.grid_remove()
            self.entry_gx.grid_remove()
        elif m == "Newton-Raphson":
            self.lbl_p1.config(text="Punto x₀:")
            self.lbl_p2.grid_remove()
            self.entry_p2.grid_remove()
            self.lbl_gx.grid_remove()
            self.entry_gx.grid_remove()
        elif m == "Punto Fijo":
            self.lbl_p1.config(text="Punto x₀:")
            self.lbl_p2.grid_remove()
            self.entry_p2.grid_remove()
            self.lbl_gx.grid(row=2, column=0, sticky=tk.W, pady=3)
            self.entry_gx.grid(row=2, column=1, pady=3)

    def cargar_ejemplo(self):
        m = self.combo_metodo.get()
        self.entry_fx.delete(0, tk.END)
        self.entry_fx.insert(0, "x^3 - 2*x - 5")
        if m in ["Bisección", "Falsa Posición", "Secante"]:
            self.entry_p1.delete(0, tk.END); self.entry_p1.insert(0, "2.0")
            self.entry_p2.delete(0, tk.END); self.entry_p2.insert(0, "3.0")
        else:
            self.entry_p1.delete(0, tk.END); self.entry_p1.insert(0, "2.5")
        self.calcular()

    def calcular(self):
        for item in self.tree.get_children():
            self.tree.delete(item)

        m = self.combo_metodo.get()
        expr_f = self.entry_fx.get()
        tol = float(self.entry_tol.get())
        max_iter = int(self.entry_max.get())

        try:
            if m == "Bisección":
                a = float(self.entry_p1.get())
                b = float(self.entry_p2.get())
                self.config_tree(["i", "a", "b", "xr", "f(a)", "f(xr)", "Error Rel %"])
                fa, fb = safe_eval(expr_f, a), safe_eval(expr_f, b)
                if fa * fb > 0:
                    messagebox.showerror("Bolzano", "f(a) y f(b) deben tener distinto signo.")
                    return
                xr_ant = None
                for i in range(1, max_iter + 1):
                    xr = (a + b) / 2.0
                    fxr = safe_eval(expr_f, xr)
                    err = abs((xr - xr_ant) / xr) * 100 if xr_ant is not None else 0.0
                    self.tree.insert("", tk.END, values=(i, f"{a:.4f}", f"{b:.4f}", f"{xr:.6f}", f"{fa:.4f}", f"{fxr:.4f}", f"{err:.4f}%" if xr_ant else "—"))
                    if xr_ant is not None and (err < tol or abs(fxr) < 1e-12):
                        self.lbl_resumen.config(text=f"Convergencia: Raíz x ≈ {xr:.6f} en {i} iteraciones.")
                        return
                    if fa * fxr < 0: b, fb = xr, fxr
                    else: a, fa = xr, fxr
                    xr_ant = xr
            elif m == "Newton-Raphson":
                x = float(self.entry_p1.get())
                self.config_tree(["i", "x_i", "f(x_i)", "f'(x_i)", "Error Rel %"])
                x_ant = None
                h = 1e-5
                for i in range(max_iter + 1):
                    fx = safe_eval(expr_f, x)
                    dfx = (safe_eval(expr_f, x + h) - safe_eval(expr_f, x - h)) / (2 * h)
                    err = abs((x - x_ant) / x) * 100 if x_ant is not None else 0.0
                    self.tree.insert("", tk.END, values=(i, f"{x:.6f}", f"{fx:.4e}", f"{dfx:.4e}", f"{err:.4f}%" if x_ant else "—"))
                    if x_ant is not None and err < tol:
                        self.lbl_resumen.config(text=f"Convergencia: Raíz x ≈ {x:.6f} en {i} iteraciones.")
                        return
                    if abs(dfx) < 1e-14:
                        messagebox.showerror("Error", "Derivada cero.")
                        return
                    x_ant = x
                    x = x - fx / dfx
        except Exception as err:
            messagebox.showerror("Error de cálculo", str(err))

    def config_tree(self, cols):
        self.tree["columns"] = cols
        for c in cols:
            self.tree.heading(c, text=c)
            self.tree.column(c, width=100, anchor=tk.CENTER)

if __name__ == "__main__":
    root = tk.Tk()
    app = CalculadoraRaicesGUI(root)
    root.mainloop()

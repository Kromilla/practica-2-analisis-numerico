#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk, messagebox
import numpy as np

class PrattTrussSolver:
    def __init__(self, root):
        self.root = root
        self.root.title("Calculadora Completa de Armadura Pratt")
        self.root.geometry("1150x800")
        self.root.configure(bg="#f0f0f0")
        
        # Variables para los inputs
        self.vars = {
            'w': tk.StringVar(value="3.0"),
            'h': tk.StringVar(value="6.75"),
            'PA': tk.StringVar(value="1.5"),
            'PB': tk.StringVar(value="3.0"),
            'PD': tk.StringVar(value="3.0"),
            'PF': tk.StringVar(value="3.0"),
            'PH': tk.StringVar(value="3.0"),
            'PJ': tk.StringVar(value="3.0"),
            'PL': tk.StringVar(value="1.5")
        }
        
        self.create_widgets()
        self.root.update() 
        self.draw_truss(3.0, 6.75)

    def create_widgets(self):
        main_container = ttk.Frame(self.root, padding="10")
        main_container.pack(fill=tk.BOTH, expand=True)

        # ==========================================
        # PANEL IZQUIERDO (Controles y Resultados)
        # ==========================================
        left_panel = ttk.Frame(main_container)
        left_panel.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, padx=(0, 10))

        # Sección de Geometría
        geo_frame = ttk.LabelFrame(left_panel, text="1. Geometría (metros)", padding="10")
        geo_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(geo_frame, text="Ancho de panel (m):").grid(row=0, column=0, sticky=tk.W, pady=2)
        ttk.Entry(geo_frame, textvariable=self.vars['w'], width=10).grid(row=0, column=1, pady=2)
        
        ttk.Label(geo_frame, text="Altura total (m):").grid(row=0, column=2, sticky=tk.W, padx=(15,0), pady=2)
        ttk.Entry(geo_frame, textvariable=self.vars['h'], width=10).grid(row=0, column=3, pady=2)

        # Sección de Cargas
        load_frame = ttk.LabelFrame(left_panel, text="2. Cargas Verticales (kN)", padding="10")
        load_frame.pack(fill=tk.X, pady=(0, 10))

        nodes = ['A', 'B', 'D', 'F', 'H', 'J', 'L']
        for i, node in enumerate(nodes):
            row = i // 2
            col = (i % 2) * 2
            ttk.Label(load_frame, text=f"Carga en {node} (kN):").grid(row=row, column=col, sticky=tk.W, pady=2, padx=(0 if col==0 else 15, 0))
            ttk.Entry(load_frame, textvariable=self.vars[f'P{node}'], width=10).grid(row=row, column=col+1, pady=2)

        # Botón de Resolución
        btn_solve = ttk.Button(left_panel, text="Calcular Todas las Fuerzas", command=self.solve_truss)
        btn_solve.pack(pady=10, ipadx=20, ipady=5, fill=tk.X)

        # Sección de Resultados
        res_frame = ttk.LabelFrame(left_panel, text="3. Resultados Completos", padding="10")
        res_frame.pack(fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(res_frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.result_text = tk.Text(res_frame, height=20, width=50, font=("Courier", 10), 
                                   bg="#f8f9fa", state=tk.DISABLED, yscrollcommand=scrollbar.set)
        self.result_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.result_text.yview)

        # ==========================================
        # PANEL DERECHO (Esquema Gráfico)
        # ==========================================
        right_panel = ttk.Frame(main_container)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        canvas_frame = ttk.LabelFrame(right_panel, text="Vista Esquemática", padding="5")
        canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(canvas_frame, width=600, height=600, bg="white")
        self.canvas.pack(fill=tk.BOTH, expand=True)

    def draw_truss(self, w, h):
        self.canvas.delete("all")
        
        canvas_w = self.canvas.winfo_width()
        canvas_h = self.canvas.winfo_height()
        
        if canvas_w < 50: canvas_w = 600
        if canvas_h < 50: canvas_h = 600

        margin_x = 80
        margin_y = 80
        draw_w = canvas_w - 2 * margin_x
        draw_h = canvas_h - 2 * margin_y
        
        max_w = 6 * w
        scale_x = draw_w / max_w
        scale_y = draw_h / h
        scale = min(scale_x, scale_y)

        start_x = margin_x + (draw_w - (max_w * scale)) / 2
        start_y = canvas_h - margin_y - (draw_h - (h * scale)) / 2

        def get_pt(x, y):
            return (start_x + x * scale, start_y - y * scale)

        nodes = {
            'A': (0, 0), 'B': (w, h/3), 'C': (w, 0), 'D': (2*w, 2*h/3),
            'E': (2*w, 0), 'F': (3*w, h), 'G': (3*w, 0), 'H': (4*w, 2*h/3),
            'I': (4*w, 0), 'J': (5*w, h/3), 'K': (5*w, 0), 'L': (6*w, 0)
        }

        # Elementos dibujados (Incluye FI, descarta IJ)
        members = [
            ('A', 'B'), ('B', 'D'), ('D', 'F'), ('F', 'H'), ('H', 'J'), ('J', 'L'),
            ('A', 'C'), ('C', 'E'), ('E', 'G'), ('G', 'I'), ('I', 'K'), ('K', 'L'),
            ('B', 'C'), ('D', 'E'), ('F', 'G'), ('H', 'I'), ('J', 'K'),
            ('C', 'D'), ('E', 'F'), ('F', 'I'), ('H', 'K') 
        ]

        for n1, n2 in members:
            x1, y1 = get_pt(*nodes[n1])
            x2, y2 = get_pt(*nodes[n2])
            self.canvas.create_line(x1, y1, x2, y2, width=4, fill="#C19A6B", capstyle=tk.ROUND)

        node_offsets = {
            'A': (-15, 15), 'B': (-15, -5), 'C': (-15, 15), 'D': (-15, -5),
            'E': (-15, 15), 'F': (-15, -10), 'G': (-15, 15), 'H': (-15, -5),
            'I': (15, 15), 'J': (-15, -5), 'K': (15, 15), 'L': (15, 15)
        }

        for name, (x, y) in nodes.items():
            px, py = get_pt(x, y)
            self.canvas.create_oval(px-5, py-5, px+5, py+5, fill="#333333", outline="black")
            
            ox, oy = node_offsets.get(name, (0, -20))
            self.canvas.create_text(px + ox, py + oy, text=name, font=("Arial", 11, "bold"), fill="black")

        load_nodes = ['A', 'B', 'D', 'F', 'H', 'J', 'L']
        for name in load_nodes:
            px, py = get_pt(*nodes[name])
            self.canvas.create_line(px, py-45, px, py-15, arrow=tk.LAST, fill="#E63946", width=3)
            load_val = self.vars[f'P{name}'].get()
            self.canvas.create_text(px + 25, py-30, text=f"{load_val} kN", fill="#E63946", font=("Arial", 9, "bold"))

        ax, ay = get_pt(*nodes['A'])
        self.canvas.create_polygon(ax-15, ay+25, ax+15, ay+25, ax, ay, fill="#6B8E23", outline="black")
        self.canvas.create_line(ax-25, ay+25, ax+25, ay+25, width=3)
        
        lx, ly = get_pt(*nodes['L'])
        self.canvas.create_polygon(lx-15, ly+15, lx+15, ly+15, lx, ly, fill="white", outline="black")
        self.canvas.create_oval(lx-12, ly+15, lx-2, ly+25, outline="black")
        self.canvas.create_oval(lx+2, ly+15, lx+12, ly+25, outline="black")
        self.canvas.create_line(lx-25, ly+25, lx+25, ly+25, width=3)

    def solve_truss(self):
        try:
            w = float(self.vars['w'].get())
            h = float(self.vars['h'].get())
            loads = {k: float(self.vars[f'P{k}'].get()) for k in ['A', 'B', 'D', 'F', 'H', 'J', 'L']}
            
            if w <= 0 or h <= 0:
                raise ValueError("Las dimensiones deben ser mayores a cero.")
            
            self.draw_truss(w, h)

        except ValueError:
            messagebox.showerror("Error de entrada", "Por favor, ingrese valores numéricos válidos y mayores a cero.")
            return

        nodes_coords = [
            (0, 0), (w, h/3), (w, 0), (2*w, 2*h/3), (2*w, 0),
            (3*w, h), (3*w, 0), (4*w, 2*h/3), (4*w, 0), (5*w, h/3),
            (5*w, 0), (6*w, 0)
        ]

        # Elementos para el cálculo (Con FI, sin IJ)
        members = [
            (0, 1), (1, 3), (3, 5), (5, 7), (7, 9), (9, 11),
            (0, 2), (2, 4), (4, 6), (6, 8), (8, 10), (10, 11),
            (1, 2), (3, 4), (5, 6), (7, 8), (9, 10),
            (2, 3), (4, 5), (5, 8), (7, 10) 
        ]
        
        member_names = [
            "AB", "BD", "DF", "FH", "HJ", "JL",
            "AC", "CE", "EG", "GI", "IK", "KL",
            "BC", "DE", "FG", "HI", "JK",
            "CD", "EF", "FI", "HK"
        ]

        N = len(nodes_coords)
        K = np.zeros((2*N, 2*N))
        EA = 1.0

        for i, (n1, n2) in enumerate(members):
            x1, y1 = nodes_coords[n1]
            x2, y2 = nodes_coords[n2]
            L = np.hypot(x2 - x1, y2 - y1)
            c = (x2 - x1) / L
            s = (y2 - y1) / L

            k = np.array([
                [ c*c,  c*s, -c*c, -c*s],
                [ c*s,  s*s, -c*s, -s*s],
                [-c*c, -c*s,  c*c,  c*s],
                [-c*s, -s*s,  c*s,  s*s]
            ]) * (EA / L)

            dofs = [2*n1, 2*n1+1, 2*n2, 2*n2+1]
            for r in range(4):
                for col in range(4):
                    K[dofs[r], dofs[col]] += k[r, col]

        F = np.zeros(2*N)
        F[2*0+1] = -loads['A']
        F[2*1+1] = -loads['B']
        F[2*3+1] = -loads['D']
        F[2*5+1] = -loads['F']
        F[2*7+1] = -loads['H']
        F[2*9+1] = -loads['J']
        F[2*11+1] = -loads['L']

        constrained_dofs = [0, 1, 23]
        free_dofs = [i for i in range(2*N) if i not in constrained_dofs]

        K_ff = K[np.ix_(free_dofs, free_dofs)]
        F_f = F[free_dofs]
        
        # Estructura estable, resolvemos normalmente
        U_f = np.linalg.solve(K_ff, F_f)
        
        U = np.zeros(2*N)
        U[free_dofs] = U_f

        forces = {}
        for i, (n1, n2) in enumerate(members):
            x1, y1 = nodes_coords[n1]
            x2, y2 = nodes_coords[n2]
            L = np.hypot(x2 - x1, y2 - y1)
            c = (x2 - x1) / L
            s = (y2 - y1) / L

            u = np.array([U[2*n1], U[2*n1+1], U[2*n2], U[2*n2+1]])
            T = (EA / L) * np.dot([-c, -s, c, s], u)
            forces[member_names[i]] = T

        R = np.dot(K, U) - F
        reaction_Ax = R[0]
        reaction_Ay = R[1]
        reaction_Ly = R[23]

        self.result_text.config(state=tk.NORMAL)
        self.result_text.delete(1.0, tk.END)
        
        self.result_text.insert(tk.END, "=== REACCIONES EN APOYOS ===\n")
        self.result_text.insert(tk.END, f"Apoyo A (x): {reaction_Ax:>8.3f} kN\n")
        self.result_text.insert(tk.END, f"Apoyo A (y): {reaction_Ay:>8.3f} kN\n")
        self.result_text.insert(tk.END, f"Apoyo L (y): {reaction_Ly:>8.3f} kN\n\n")

        self.result_text.insert(tk.END, "=== FUERZAS INTERNAS ===\n")
        self.result_text.insert(tk.END, "(T = Tensión, C = Compresión)\n")
        self.result_text.insert(tk.END, "-" * 40 + "\n")
        
        for name in member_names:
            val = forces[name]
            estado = "T" if val > 0 else "C"
            if abs(val) < 1e-4: 
                estado = "-"
                val = 0.0
                
            # Resaltamos los elementos originalmente solicitados
            prefix = "* " if name in ["CD", "DE", "DF"] else "  "
            res_str = f"{prefix}{name}: {abs(val):>8.3f} kN  [{estado}]\n"
            self.result_text.insert(tk.END, res_str)
            
        self.result_text.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = PrattTrussSolver(root)
    root.mainloop()

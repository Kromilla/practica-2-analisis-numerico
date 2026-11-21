# Universidad del Magdalena
## Facultad de Ingeniería · Análisis Numérico
### Práctica Computacional 2: Métodos Numéricos

---

### Hoja de Presentación

- **Materia:** Análisis Numérico
- **Docente:** Marlon Andrés Hurtado Cantillo
- **Fecha:** Noviembre de 2026
- **Integrantes del Grupo de Trabajo:**
  1. **Carlos Alfredo Ibañez Ortiz**
  2. **Adriana Carolina Olivares Vásquez**
  3. **Yineth Ávila Villalobos**

---

## 1. Descripción General del Proyecto

En cumplimiento con los requerimientos de la **Práctica Computacional 2**, se desarrollaron **5 calculadoras completas e independientes**, acompañadas por un portal unificado con barra de navegación institucional:

1. **Programa 1 (`raices.html` / `calculadora_1_raices.py`):**
   - **Métodos implementados:** Bisección, Falsa Posición (Regula Falsi), Secante, Newton-Raphson y Punto Fijo.
   - **Características:** Validación de cambio de signo (Teorema de Bolzano), cálculo automático o manual de derivadas, tabla completa de iteraciones con columnas de error relativo y absoluto, y gráfica SVG de la función con la raíz señalizada.

2. **Programa 2 (`interpolacion.html` / `calculadora_2_interpolacion.py`):**
   - **Métodos implementados:** Polinomio de Taylor (en torno a $x_0$), Polinomio de Lagrange y Diferencias Divididas de Newton.
   - **Características:** Generación de la expresión simbólica $P(x)$, tabla triangular de diferencias divididas, evaluación en un punto objetivo $x^*$ y gráfica interactiva con los nodos de interpolación.

3. **Programa 3 (`diferenciacion_integracion.html` / `calculadora_3_dif_int.py`):**
   - **Basado en:** Documento guía *Unidad 3 Diferenciación e Integración Numérica*.
   - **Diferenciación:** Fórmulas de diferencias finitas hacia adelante $O(h)$, hacia atrás $O(h)$, centrada de 3 puntos $O(h^2)$ y centrada de 5 puntos $O(h^4)$.
   - **Integración:** Reglas cerradas de Newton-Cotes simples y compuestas: Regla del Trapecio, Regla 1/3 de Simpson ($n$ par), Regla 3/8 de Simpson ($n$ múltiplo de 3) y Regla de Boole ($n = 4$).
   - **Características:** Muestra la fórmula expandida con los coeficientes exactos solicitados por la cátedra (ej. `1 2 2 ... 2 1`, `1 4 2 4 ... 1` y `1 3 3 2 ... 1`).

4. **Programa 4 (`edo_pvi.html` / `calculadora_4_edo.py`):**
   - **Basado en:** Documento guía *Unidad 3 Solución Numérica de EDO*.
   - **Métodos implementados:** Método de Euler $O(h)$, Método de Heun / Euler Mejorado $O(h^2)$ y Runge-Kutta de 4to Orden (RK4) $O(h^4)$.
   - **Características:** Comparación simultánea de los tres métodos contra la solución analítica exacta, cálculo del error absoluto y error relativo porcentual en cada paso $t_i$, y gráfica de las trayectorias superpuestas.

5. **Programa 5 (`problema_ingenieria.html` / `Armadura Pratt Ejercicio 6.53 Beer.py`):**
   - **Basado en:** Problema 6.53 del libro *Mecánica Vectorial para Ingenieros: Estática* (Beer & Johnston).
   - **Métodos implementados:** Método matricial de rigidez directa en 2D (sistema lineal de 21 ecuaciones de equilibrio).
   - **Características:** Permite parametrizar el ancho del panel $w$, la altura total $h$ y las cargas verticales en los nodos $A, B, D, F, H, J, L$. Calcula reacciones en apoyos fijos y móviles, y fuerzas axiales en todas las barras clasificadas en Tensión $[T]$ o Compresión $[C]$, resaltando los miembros solicitados en el libro ($CD, DE, DF$). Incluye dibujo SVG interactivo.

---

## 2. Enlaces y Ejecución

- **Aplicación Web Local:** `http://localhost:8081`
- **Páginas HTML independientes:**
  - `index.html` (Portal principal)
  - `raices.html` (Programa 1)
  - `interpolacion.html` (Programa 2)
  - `diferenciacion_integracion.html` (Programa 3)
  - `edo_pvi.html` (Programa 4)
  - `problema_ingenieria.html` (Programa 5)
- **Scripts de Python (.py) incluidos:**
  - `calculadora_1_raices.py`
  - `calculadora_2_interpolacion.py`
  - `calculadora_3_dif_int.py`
  - `calculadora_4_edo.py`
  - `Armadura Pratt Ejercicio 6.53 Beer.py`

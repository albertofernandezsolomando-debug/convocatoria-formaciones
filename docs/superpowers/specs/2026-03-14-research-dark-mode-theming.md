# Dark Mode, Theming y Accesibilidad de Color (2024-2026)

> Research profundo sobre implementacion de dark mode, sistemas de theming y accesibilidad de color en aplicaciones web modernas.
> Fecha: 2026-03-14

---

## Indice

1. [Fundamentos de Dark Mode](#1-fundamentos-de-dark-mode)
2. [Deteccion de preferencia del sistema](#2-deteccion-de-preferencia-del-sistema)
3. [Arquitectura de color tokens](#3-arquitectura-de-color-tokens)
4. [Espacio de color OKLCH](#4-espacio-de-color-oklch)
5. [CSS light-dark() y color-scheme](#5-css-light-dark-y-color-scheme)
6. [Implementaciones en frameworks y design systems](#6-implementaciones-en-frameworks-y-design-systems)
7. [Como lo hacen los SaaS top](#7-como-lo-hacen-los-saas-top)
8. [Contraste y WCAG](#8-contraste-y-wcag)
9. [Errores comunes y antipatrones](#9-errores-comunes-y-antipatrones)
10. [Dark mode en data visualization](#10-dark-mode-en-data-visualization)
11. [Dark mode en formularios e inputs](#11-dark-mode-en-formularios-e-inputs)
12. [Dark mode en tablas](#12-dark-mode-en-tablas)
13. [Transiciones animadas entre temas](#13-transiciones-animadas-entre-temas)
14. [High contrast y forced colors](#14-high-contrast-y-forced-colors)
15. [Reduccion de fatiga visual](#15-reduccion-de-fatiga-visual)
16. [Dark mode y print](#16-dark-mode-y-print)
17. [Estrategias de testing](#17-estrategias-de-testing)
18. [Guia de implementacion consolidada](#18-guia-de-implementacion-consolidada)
19. [Fuentes](#19-fuentes)

---

## 1. Fundamentos de Dark Mode

### Que es y por que importa

Dark mode ya no es opcional: es un baseline de UX. Desde 2024, la mayoria de sistemas operativos (iOS, Android, macOS, Windows) incluyen dark mode nativo, y los usuarios esperan que las aplicaciones web lo respeten.

### Tres estrategias de implementacion

#### a) Media query automatica (respeta preferencia del sistema)

```css
/* Se activa automaticamente segun el SO del usuario */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a2e;
    --text: #e0e0e0;
  }
}
```

**Quien lo usa:** Comportamiento por defecto de Tailwind CSS, navegadores nativos.
**Por que funciona:** Zero JavaScript, rendimiento optimo, respeta la eleccion del usuario.
**Limitacion:** No permite toggle manual.

#### b) Clase o data-attribute (toggle manual)

```css
:root {
  --bg: #ffffff;
  --text: #111111;
}

.dark {
  --bg: #1a1a2e;
  --text: #e0e0e0;
}
/* O con data-attribute: */
[data-theme="dark"] {
  --bg: #1a1a2e;
  --text: #e0e0e0;
}
```

**Quien lo usa:** shadcn/ui, GitHub, Linear, Notion.
**Por que funciona:** Control total, permite temas multiples, persistencia en localStorage.

#### c) Hibrido (sistema + override manual)

```javascript
// Colocar inline en <head> para evitar FOUC
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
     window.matchMedia("(prefers-color-scheme: dark)").matches)
);

// Usuario elige light
localStorage.theme = "light";

// Usuario elige dark
localStorage.theme = "dark";

// Usuario elige "seguir al sistema"
localStorage.removeItem("theme");
```

**Quien lo usa:** Tailwind CSS (recomendado), Vercel, la mayoria de apps modernas.
**Por que funciona:** Combina lo mejor de ambos mundos: respeta el sistema por defecto, permite override, persiste la eleccion.

### Prevencion del FOUC (Flash of Unstyled Content)

El FOUC ocurre porque durante SSR (Server-Side Rendering), el servidor no tiene acceso a `localStorage` ni a `window.matchMedia`, asi que renderiza con el tema por defecto. Al hidratar, JavaScript aplica el tema correcto y se produce un flash visible.

**Solucion critica:** El script de deteccion de tema debe ir **inline en el `<head>`**, antes de cualquier CSS o contenido renderizado:

```html
<head>
  <script>
    // Ejecutar ANTES de que el navegador pinte
    (function() {
      const theme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
</head>
```

### Meta tag theme-color

Para que la barra del navegador (Chrome mobile, Safari) coincida con el tema:

```html
<!-- Para sistema automatico -->
<meta name="theme-color" content="#ffffff"
      media="(prefers-color-scheme: light)">
<meta name="theme-color" content="oklch(.13 .028 261.692)"
      media="(prefers-color-scheme: dark)">
```

---

## 2. Deteccion de preferencia del sistema

### prefers-color-scheme

```css
@media (prefers-color-scheme: dark) {
  /* Estilos dark */
}

@media (prefers-color-scheme: light) {
  /* Estilos light */
}
```

### Deteccion en JavaScript con listener reactivo

```javascript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Valor actual
console.log(mediaQuery.matches); // true si dark

// Escuchar cambios en tiempo real
mediaQuery.addEventListener('change', (e) => {
  if (e.matches) {
    // Usuario cambio a dark mode en su sistema
    applyDarkTheme();
  } else {
    applyLightTheme();
  }
});
```

### Patron completo: 3 estados (light / dark / system)

```javascript
function getEffectiveTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  // "system" o sin preferencia guardada
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark' : 'light';
}

function applyTheme(theme) {
  const effective = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(effective);
  document.documentElement.setAttribute('data-theme', effective);
}
```

---

## 3. Arquitectura de color tokens

### Modelo de tres capas

La arquitectura moderna de tokens de color usa tres niveles de abstraccion. Este modelo es usado por GitHub Primer, Salesforce Lightning, IBM Carbon, y practicamente todos los design systems maduros de 2025-2026.

#### Capa 1: Tokens primitivos (raw values)

```css
:root {
  /* Primitivos: valores crudos, sin contexto semantico */
  --blue-50: oklch(0.97 0.01 250);
  --blue-100: oklch(0.93 0.03 250);
  --blue-500: oklch(0.55 0.15 250);
  --blue-900: oklch(0.25 0.08 250);

  --gray-50: oklch(0.98 0 0);
  --gray-100: oklch(0.93 0 0);
  --gray-800: oklch(0.27 0 0);
  --gray-900: oklch(0.20 0 0);
}
```

**Proposito:** Reducir las infinitas posibilidades a una paleta finita (~50-200 valores). No se usan directamente en componentes. Son los "atomos" del sistema.

#### Capa 2: Tokens semanticos (funcionales)

```css
:root {
  /* Semanticos: describen INTENCION, no apariencia */
  --color-bg-default: var(--gray-50);
  --color-bg-surface: var(--white);
  --color-bg-subtle: var(--gray-100);
  --color-bg-emphasis: var(--blue-500);

  --color-text-default: var(--gray-900);
  --color-text-muted: var(--gray-600);
  --color-text-on-emphasis: var(--white);

  --color-border-default: var(--gray-200);
  --color-border-emphasis: var(--gray-400);

  --color-danger-bg: var(--red-100);
  --color-danger-text: var(--red-700);
  --color-danger-border: var(--red-300);
}

.dark {
  --color-bg-default: var(--gray-900);
  --color-bg-surface: var(--gray-800);
  --color-bg-subtle: var(--gray-800);
  --color-bg-emphasis: var(--blue-400);

  --color-text-default: var(--gray-100);
  --color-text-muted: var(--gray-400);
  --color-text-on-emphasis: var(--gray-900);

  --color-border-default: var(--gray-700);
  --color-border-emphasis: var(--gray-500);
}
```

**Proposito:** Los componentes referencian estos tokens. Al cambiar de tema, solo cambia el mapeo semantico -> primitivo. Los componentes no necesitan saber nada sobre temas.

#### Capa 3: Tokens de componente/patron

```css
:root {
  --button-primary-bg: var(--color-bg-emphasis);
  --button-primary-text: var(--color-text-on-emphasis);
  --button-primary-border: transparent;

  --card-bg: var(--color-bg-surface);
  --card-border: var(--color-border-default);
  --card-shadow: 0 1px 3px oklch(0 0 0 / 0.1);
}

.dark {
  --card-shadow: 0 1px 3px oklch(0 0 0 / 0.4);
}
```

**Proposito:** Valores muy especificos o unicos. Uso limitado; la mayoria de componentes deberian funcionar solo con tokens semanticos.

### Por que funciona este modelo

1. **Mantenibilidad:** Cambiar un color de marca requiere editar un solo primitivo.
2. **Temas multiples:** Cada tema redefine solo la capa semantica.
3. **Consistencia:** Los componentes nunca usan valores hardcodeados.
4. **Accesibilidad:** Puedes crear temas de alto contraste redefiniendo la capa semantica.
5. **Figma <-> Code:** Los tokens se mapean 1:1 con Figma Variables.

---

## 4. Espacio de color OKLCH

### Por que OKLCH reemplaza a HSL en 2025-2026

OKLCH (Oklab Lightness, Chroma, Hue) es el espacio de color recomendado para design systems modernos. shadcn/ui, Tailwind CSS v4, y multiples design systems han migrado de HSL a OKLCH.

#### Estructura

```
oklch(L C H / alpha)
  L = Lightness (0 = negro, 1 = blanco)
  C = Chroma (0 = gris, ~0.4 = maximo)
  H = Hue (0-360 grados)
```

#### Ventajas sobre HSL

| Aspecto | HSL | OKLCH |
|---|---|---|
| Uniformidad perceptual | No. Amarillo L=50% parece mas brillante que azul L=50% | Si. L=0.5 se percibe igual en todos los hues |
| Modificacion de colores | Cambiar L puede causar shifts de hue inesperados | Cambiar L es predecible, sin shifts de hue |
| Accesibilidad | Calcular contraste WCAG desde HSL es impreciso | L correlaciona directamente con luminancia percibida |
| Gamut | Limitado a sRGB | Soporta Display P3 y gamuts amplios |
| Hover states | Aumentar L desatura el color | Aumentar L preserva la saturacion |

#### Ejemplo practico: paleta para dark mode

```css
:root {
  /* OKLCH hace trivial generar escalas consistentes */
  --primary-50:  oklch(0.97 0.02 250);
  --primary-100: oklch(0.93 0.04 250);
  --primary-200: oklch(0.87 0.08 250);
  --primary-300: oklch(0.78 0.12 250);
  --primary-400: oklch(0.68 0.16 250);
  --primary-500: oklch(0.55 0.19 250);  /* Base */
  --primary-600: oklch(0.48 0.17 250);
  --primary-700: oklch(0.40 0.14 250);
  --primary-800: oklch(0.32 0.10 250);
  --primary-900: oklch(0.25 0.07 250);
}
```

Al ser perceptualmente uniforme, cada step se percibe como un cambio consistente de luminosidad, algo imposible de lograr con HSL.

#### Soporte de navegadores

`oklch()` es Baseline desde agosto-septiembre 2025: disponible en todos los navegadores modernos (Chrome, Firefox, Safari, Edge).

---

## 5. CSS light-dark() y color-scheme

### La funcion light-dark()

Nueva en CSS (Baseline mayo 2024), `light-dark()` permite definir un valor para light y otro para dark en una sola declaracion:

```css
:root {
  color-scheme: light dark; /* OBLIGATORIO para activar light-dark() */
}

body {
  background-color: light-dark(#ffffff, #1a1a2e);
  color: light-dark(#111111, #e0e0e0);
}

.card {
  border: 1px solid light-dark(
    oklch(0.85 0 0),    /* light */
    oklch(0.30 0 0)     /* dark */
  );
  box-shadow: 0 2px 8px light-dark(
    oklch(0 0 0 / 0.08),
    oklch(0 0 0 / 0.3)
  );
}
```

### color-scheme

La propiedad `color-scheme` indica al navegador que esquemas de color soporta el elemento:

```css
:root {
  color-scheme: light dark;
}
```

Esto activa automaticamente:
- Colores nativos del navegador (scrollbars, form controls) se adaptan al tema.
- La funcion `light-dark()` funciona.
- El navegador aplica su propio dark mode a elementos nativos.

### Diferencia critica: light-dark() vs prefers-color-scheme

`light-dark()` se vincula a `color-scheme`, **no** directamente a la preferencia del usuario. Si defines `color-scheme: dark` en un elemento, `light-dark()` usara el segundo valor independientemente de la preferencia del sistema. Esto permite override manual:

```css
/* Override manual: forzar dark en un contenedor */
.always-dark {
  color-scheme: dark;
  background: light-dark(white, #1a1a2e); /* Usara #1a1a2e */
}
```

### Limitacion actual

`light-dark()` **solo acepta colores**. No sirve para cambiar padding, font-size u otros valores no-color. Para esos casos, seguir usando media queries o custom properties.

---

## 6. Implementaciones en frameworks y design systems

### 6.1 Tailwind CSS (v4)

**Patron:** Variante `dark:` con clase o media query.

```css
/* app.css - Tailwind v4 */
@import "tailwindcss";

/* Estrategia por clase (toggle manual) */
@custom-variant dark (&:where(.dark, .dark *));

/* O por data-attribute */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h2 class="text-gray-800 dark:text-gray-200">Titulo</h2>
  <p class="text-gray-600 dark:text-gray-400">Descripcion</p>
</div>
```

**Ventaja:** Cada propiedad se mapea explicitamente. No hay "magia" oculta.
**Desventaja:** Duplicacion de clases. En proyectos grandes, se prefiere CSS variables.

### 6.2 shadcn/ui + Tailwind v4

**Patron:** CSS variables con OKLCH en `globals.css`, theme provider con `next-themes`.

```css
/* globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0.006 286.029);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0.001 286.029);
  --secondary-foreground: oklch(0.205 0.006 286.029);
  --muted: oklch(0.97 0.001 286.029);
  --muted-foreground: oklch(0.556 0.01 286.029);
  --accent: oklch(0.97 0.001 286.029);
  --accent-foreground: oklch(0.205 0.006 286.029);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0.006 286.029);
  --secondary: oklch(0.269 0.006 286.029);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0.006 286.029);
  --muted-foreground: oklch(0.711 0.01 286.029);
  --accent: oklch(0.269 0.006 286.029);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --border: oklch(0.269 0.006 286.029);
  --input: oklch(0.269 0.006 286.029);
  --ring: oklch(0.439 0.01 286.029);
}

/* Mapeo a Tailwind v4 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... */
}
```

**Convencion de naming:** `--background` para fondos, `--foreground` para texto. El sufijo `-foreground` indica el color de texto sobre ese fondo (ej: `--primary` es el fondo del boton, `--primary-foreground` es su texto).

**Provider (Next.js):**

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 6.3 Radix UI / Radix Colors

**Patron:** Escala de 12 steps por color, con variantes light/dark automaticas.

Cada escala de Radix Colors tiene 12 steps disenados para usos especificos:

| Step | Uso | Ejemplo |
|------|-----|---------|
| 1 | Fondo de la aplicacion | `--gray-1` |
| 2 | Fondo sutil de componente | `--gray-2` |
| 3 | Fondo hover de componente | `--gray-3` |
| 4 | Fondo pressed/selected | `--gray-4` |
| 5 | Fondo activo/selected | `--gray-5` |
| 6 | Bordes sutiles | `--gray-6` |
| 7 | Bordes de UI, separadores | `--gray-7` |
| 8 | Bordes con mas contraste, focus rings | `--gray-8` |
| 9 | Fondos solidos (badge, button) | `--blue-9` (maxima chroma) |
| 10 | Hover sobre fondos solidos | `--blue-10` |
| 11 | Texto de bajo contraste | `--gray-11` |
| 12 | Texto de alto contraste | `--gray-12` |

**Mecanismo clave:** Las escalas se **invierten automaticamente** en dark mode. `--gray-1` es casi blanco en light y casi negro en dark. El mismo token produce el resultado correcto en ambos temas sin overrides manuales.

```css
/* Light mode: steps escalas automaticas */
.light, .light-theme, :root {
  --gray-1: oklch(0.99 0 0);
  --gray-12: oklch(0.13 0 0);
}

/* Dark mode: se invierten */
.dark, .dark-theme {
  --gray-1: oklch(0.11 0 0);
  --gray-12: oklch(0.93 0 0);
}
```

**Ventaja sobre Tailwind:** Un solo nombre de clase (`bg-gray-3`) funciona correctamente en ambos temas. No necesitas `dark:bg-gray-800`.

Cada color incluye variantes alpha (semi-transparentes) que visualmente coinciden con la version opaca sobre el fondo de la pagina.

### 6.4 Material Design 3 (M3)

**Patron:** Color roles + tonal palettes + dynamic color.

#### 5 key colors -> tonal palettes

Cada esquema de color M3 se basa en 5 colores clave: **Primary, Secondary, Tertiary, Neutral, Neutral Variant**. De cada uno se genera una tonal palette de 13 tonos.

#### Color roles (los "numeros" del paint-by-number)

Los componentes no referencian colores directamente, sino **roles**:

| Role | Light | Dark |
|------|-------|------|
| `primary` | Tono 40 | Tono 80 |
| `onPrimary` | Tono 100 | Tono 20 |
| `primaryContainer` | Tono 90 | Tono 30 |
| `onPrimaryContainer` | Tono 10 | Tono 90 |
| `surface` | Tono 98 | Tono 6 |
| `onSurface` | Tono 10 | Tono 90 |
| `surfaceContainer` | Tono 94 | Tono 12 |
| `surfaceContainerHigh` | Tono 92 | Tono 17 |
| `outline` | Tono 50 | Tono 60 |

#### Elevacion tonal (no sombras)

En dark mode, M3 abandona las sombras para expresar elevacion. En su lugar, las superficies mas elevadas reciben un **tinte tonal** del color primario, haciendose ligeramente mas claras:

- Surface (base): tono 6
- Surface + elevation 1: tono 12
- Surface + elevation 2: tono 17
- Surface + elevation 3: tono 22

**Por que funciona:** Las sombras son practicamente invisibles en fondos oscuros. El tinte tonal comunica jerarquia visual sin depender de sombras.

### 6.5 GitHub Primer

**Patron:** 3 niveles de tokens + 9 temas + soporte CVD.

#### Tres niveles de tokens

1. **Base color tokens:** Mapean a valores raw. No respetan modos de color. Solo para referencia interna.
2. **Functional color tokens:** Representan patrones globales (text, borders, shadows, backgrounds). Son los mas usados. Respetan modos de color.
3. **Component/pattern tokens:** Valores especificos o unicos. Uso limitado. Respetan modos de color.

#### 9 temas

Primer soporta 9 temas organizados en dos modos:

- **Light:** Default, High Contrast, Protanopia & Deuteranopia, Tritanopia
- **Dark:** Default, Dimmed, High Contrast, Protanopia & Deuteranopia, Tritanopia

#### Escalas neutras invertidas

Las escalas de grises de Primer (0-13) tienen dos versiones (light y dark) que estan **invertidas**, de modo que ambos temas pueden compartir muchos functional tokens sin overrides custom.

#### Temas para daltonismo (CVD)

Los temas Protanopia & Deuteranopia y Tritanopia cambian verdes, rojos y naranjas a colores alternativos que proporcionan contraste correcto para personas con deficiencia de vision del color.

### 6.6 Apple HIG (Human Interface Guidelines)

**Patron:** Colores dinamicos del sistema + adaptacion automatica.

Principios clave:
- Usar **colores semanticos del sistema** (`label`, `secondaryLabel`, `separator`, `systemBackground`) que se adaptan automaticamente entre light y dark.
- En dark mode, usar colores **menos saturados** para evitar vibracion visual sobre fondos oscuros.
- Los colores del sistema incluyen variantes con **vibrancy** para superficies translucidas.
- Mantener contraste minimo 4.5:1 (AA) en ambos modos.
- No invertir simplemente los colores: disenar la paleta dark independientemente.

---

## 7. Como lo hacen los SaaS top

### Linear

- **Color space:** Usa LCH (no HSL) para generar temas custom, porque LCH es perceptualmente uniforme.
- **Contraste:** En su rediseno 2024-2025, aumentaron el contraste global: texto e iconos neutros mas oscuros en light mode, mas claros en dark mode.
- **Chrome reduction:** Limitaron cuanto "chrome" (su azul de marca) influye en los calculos del sistema de color, logrando una apariencia mas neutra.
- **Temas custom:** Incluyen un generador de temas personalizados basado en LCH.

### Notion

- Soporta light, dark y "system" mode.
- Usa CSS variables con override por clase.
- Enfoque conservador: fondos de gris oscuro suave, no negro puro.

### Figma

- **Reto principal:** Diferenciar en codigo entre superficies que cambian con el tema (side panels) vs superficies que siempre son oscuras (toolbars, menus).
- **Solucion:** Inyectar CSS custom variables en la web app que cambian dinamicamente al togglear temas.
- **Filosofia:** Dark mode no es un esfuerzo unico de un equipo. La solucion tecnica debe ser facil de entender e implementar para cualquier ingeniero.

### GitHub

- 9 temas incluyendo variantes para daltonismo.
- Tokens funcionales como capa principal de abstraccion.
- Escalas neutras invertidas para compartir tokens entre temas.
- Mejoras de contraste continuas (actualizacion notable en 2023).

### Vercel

- Estetica minimalista: negro puro `oklch(0 0 0)` y blanco puro `oklch(1 0 0)`.
- Confian en que esa paleta minimal sostenga toda la interfaz.
- Design system Geist con theme switcher integrado.

### Slack

- **Sistema de variables semanticas:** 4 niveles de foreground por contraste:
  - `@sk_foreground_min` (minimo contraste)
  - `@sk_foreground_low`
  - `@sk_foreground_high`
  - `@sk_foreground_max` (maximo contraste)
- **Patron `_always`:** Variables con sufijo `_always` para colores que no cambian con el tema:
  - `@sk_black_always`, `@sk_white_always`
- **CSS variables como RGB components:** Las variables almacenan solo los componentes RGB (`232, 232, 232`), permitiendo componer con alpha en LESS en tiempo de ejecucion.
- **Valores dark mode concretos:**
  - `--sk_foreground_max_solid: 171, 171, 173`
  - `--sk_foreground_high_solid: 129, 131, 133`
  - `--sk_foreground_low_solid: 53, 55, 59`
  - `--sk_foreground_min_solid: 34, 37, 41`
- **Migracion:** Script de find-and-replace en Node que recorria cada archivo LESS y reemplazaba variables viejas por las nuevas basandose en inferencias (si era `color` o `background-color`).
- **Cobertura:** Slack Kit (su design system) cubria ~90% de los componentes automaticamente. Solo las apps auxiliares necesitaban ~4 lineas de codigo adicionales.

---

## 8. Contraste y WCAG

### Requisitos de contraste

| Nivel | Texto normal | Texto grande* | Componentes UI |
|-------|-------------|---------------|----------------|
| **AA** (minimo) | 4.5:1 | 3:1 | 3:1 |
| **AAA** (mejorado) | 7:1 | 4.5:1 | - |

*Texto grande: >= 18pt (24px) o >= 14pt (18.66px) bold.

### Valores de referencia

| Combinacion | Ratio | Cumple |
|---|---|---|
| Negro `#000` sobre blanco `#FFF` | 21:1 | AAA |
| `#767676` sobre blanco `#FFF` | 4.54:1 | AA |
| `#595959` sobre blanco `#FFF` | 7.0:1 | AAA |
| Blanco `#FFF` sobre `#1a1a2e` | ~15:1 | AAA |
| `#e0e0e0` sobre `#1a1a2e` | ~11:1 | AAA |
| `#a0a0a0` sobre `#1a1a2e` | ~5.5:1 | AA |

### Contraste en dark mode: consideraciones especificas

1. **No invertir automaticamente:** La misma relacion de contraste aplica en dark mode, pero los colores deben ser distintos (no simplemente invertidos).
2. **Colores saturados:** Un azul de marca que en light mode tiene buen contraste puede fallar en dark mode sobre fondos oscuros. Verificar cada combinacion.
3. **Grises intermedios:** Los colores de texto muted (`--muted-foreground`) son los que mas riesgo tienen de fallar contraste en dark mode. Verificar especialmente.
4. **Componentes UI (3:1):** Bordes de inputs, iconos, y focus rings deben cumplir 3:1 contra su fondo inmediato.
5. **OKLCH y contraste:** Al ser perceptualmente uniforme, OKLCH facilita predecir si un par de colores cumplira contraste. La componente L (lightness) correlaciona directamente con luminancia percibida.

### Herramientas de verificacion

- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Contrast App (macOS):** https://usecontrast.com/
- **axe DevTools:** Extension de navegador para audit automatico.
- **Figma plugins:** Stark, Contrast, A11y.

---

## 9. Errores comunes y antipatrones

### 9.1 Fondo negro puro (#000000)

**Problema:** El contraste maximo (21:1) entre `#000` y `#FFF` causa **halation** -- un efecto de brillo/glow alrededor del texto que reduce la claridad de las letterforms. Es especialmente problematico para usuarios con astigmatismo (~50% de la poblacion).

**Solucion:**
```css
.dark {
  --bg: oklch(0.15 0.01 260);  /* Gris oscuro con sutil tinte */
  /* NO usar: --bg: #000000; */
}
```

**Valores recomendados para fondo oscuro:**
- `#121212` (Material Design)
- `#1a1a2e` (gris con tinte azul)
- `#1E1E1E` (VS Code)
- `oklch(0.15 0.01 260)` (gris oscuro con chroma minima)

**Excepcion:** Vercel usa negro puro intencionalmente como decision estetica. Funciona cuando hay muy poco texto y el contraste visual es parte de la marca.

### 9.2 Colores saturados sobre fondo oscuro

**Problema:** Los colores saturados "vibran" visualmente contra fondos oscuros, causando fatiga visual y reduciendo legibilidad. Un azul de marca que se ve equilibrado en light mode puede parecer neon en dark mode.

**Solucion:** Reducir saturacion (chroma en OKLCH) un 20-30% para dark mode:

```css
:root {
  --accent: oklch(0.55 0.20 250);  /* Light: saturacion completa */
}
.dark {
  --accent: oklch(0.70 0.14 250);  /* Dark: mas claro, menos saturado */
}
```

### 9.3 Sombras en dark mode

**Problema:** `box-shadow` con valores tipicos de light mode es practicamente invisible sobre fondos oscuros. Duplicar la opacidad no es suficiente y puede verse sucio.

**Solucion M3:** Usar **elevacion tonal** en lugar de sombras:

```css
.dark {
  /* En lugar de box-shadow, usar fondo ligeramente mas claro */
  --card-bg: oklch(0.20 0.01 260);     /* elevation 1 */
  --card-bg-raised: oklch(0.24 0.015 260);  /* elevation 2 */
  --card-bg-overlay: oklch(0.28 0.02 260);  /* elevation 3 */
}
```

Si necesitas sombras en dark mode, aumentar opacidad significativamente:

```css
:root {
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.1);
}
.dark {
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.4);
  /* O usar borde sutil como alternativa */
  --shadow-md: 0 0 0 1px oklch(1 0 0 / 0.05), 0 4px 6px oklch(0 0 0 / 0.3);
}
```

### 9.4 Texto blanco puro (#FFFFFF)

**Problema:** Similar al fondo negro puro. Blanco puro sobre gris oscuro produce demasiado brillo, especialmente en textos largos.

**Solucion:**
```css
.dark {
  --text-primary: oklch(0.93 0 0);    /* NO #FFFFFF */
  --text-secondary: oklch(0.75 0 0);  /* Texto muted */
}
```

### 9.5 Simplemente invertir los colores

**Problema:** Invertir la paleta light no funciona porque:
- Los significados semanticos se pierden (rojo peligro se convierte en cyan).
- Las jerarquias visuales no se mapean 1:1.
- Los colores de marca cambian completamente.

**Solucion:** Disenar la paleta dark como un set independiente que comparte tokens semanticos pero usa valores primitivos distintos.

### 9.6 No testear imagenes y media

**Problema:** Logos con fondo transparente (PNG) pensados para fondo blanco desaparecen en dark mode. Screenshots con fondo blanco crean flashazos.

**Solucion:**
```css
/* Imagenes con fondo blanco: borde sutil en dark mode */
.dark img {
  border-radius: 8px;
  border: 1px solid oklch(1 0 0 / 0.1);
}

/* Logos: usar filter o tener versiones para ambos temas */
.dark .logo-light {
  display: none;
}
.dark .logo-dark {
  display: block;
}

/* O invertir con filtro */
.dark .logo-auto {
  filter: invert(1) hue-rotate(180deg);
}
```

---

## 10. Dark mode en data visualization

### Principios generales

1. **No invertir simplemente los colores del chart.** Crear una paleta dark dedicada.
2. **Reducir saturacion de los colores de datos** un 20-30% respecto a light mode.
3. **Aumentar grosor de strokes.** Las lineas finas se pierden en fondos oscuros.
4. **Gridlines mas visibles** pero sutiles (usar alpha baja, no gris solido).
5. **Labels con contraste suficiente.** Minimo 4.5:1 contra el fondo del chart.

### Paleta de colores para charts en dark mode

```css
.dark {
  /* Fondo del chart */
  --chart-bg: oklch(0.17 0.005 260);

  /* Gridlines */
  --chart-grid: oklch(1 0 0 / 0.08);

  /* Axis text */
  --chart-axis-text: oklch(0.65 0 0);

  /* Colores de datos: desaturados respecto a light mode */
  --chart-blue: oklch(0.68 0.14 250);
  --chart-green: oklch(0.72 0.12 150);
  --chart-orange: oklch(0.75 0.13 60);
  --chart-red: oklch(0.65 0.16 25);
  --chart-purple: oklch(0.65 0.14 300);

  /* Strokes mas gruesos */
  --chart-stroke-width: 2.5px;  /* vs 1.5px en light */
}
```

### Badges y etiquetas de color

```css
/* Badge en dark mode: fondo semi-transparente, texto mas brillante */
.dark .badge-success {
  background: oklch(0.45 0.12 150 / 0.2);
  color: oklch(0.78 0.12 150);
  border: 1px solid oklch(0.45 0.12 150 / 0.3);
}

.dark .badge-danger {
  background: oklch(0.50 0.15 25 / 0.2);
  color: oklch(0.75 0.15 25);
  border: 1px solid oklch(0.50 0.15 25 / 0.3);
}
```

### Accesibilidad en charts

- **No depender solo del color.** Anadir patrones, marcadores, o labels directos.
- **Tooltip con fondo contrastante:** En dark mode, usar fondo mas claro que el chart.
- **Leyenda legible:** Minimo 4.5:1 contraste para texto de leyenda.
- **Hover states:** Aumentar luminosidad del punto/barra al 120% en hover, no saturacion.

---

## 11. Dark mode en formularios e inputs

### Bordes y fondos de inputs

```css
:root {
  --input-bg: oklch(1 0 0);
  --input-border: oklch(0.82 0 0);
  --input-border-hover: oklch(0.65 0 0);
  --input-border-focus: oklch(0.55 0.15 250);
  --input-text: oklch(0.15 0 0);
  --input-placeholder: oklch(0.55 0 0);
}

.dark {
  --input-bg: oklch(0.18 0.005 260);
  --input-border: oklch(0.32 0.005 260);
  --input-border-hover: oklch(0.45 0.005 260);
  --input-border-focus: oklch(0.65 0.14 250);
  --input-text: oklch(0.93 0 0);
  --input-placeholder: oklch(0.50 0 0);
}

input, textarea, select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
  transition: border-color 0.15s ease;
}

input:hover {
  border-color: var(--input-border-hover);
}

input:focus-visible {
  border-color: var(--input-border-focus);
  outline: 2px solid var(--input-border-focus);
  outline-offset: 1px;
}

input::placeholder {
  color: var(--input-placeholder);
  opacity: 1; /* Normalizar entre navegadores */
}
```

### Focus rings

**Principio:** El focus ring debe tener al menos **3:1 de contraste** contra el fondo inmediato (WCAG 2.1, SC 1.4.11).

**Tecnica del doble outline:** Garantiza visibilidad en cualquier fondo:

```css
input:focus-visible {
  outline: 2px solid var(--input-border-focus);
  outline-offset: 2px;
  /* Shadow interior para contraste contra fondos que coincidan con el outline */
  box-shadow:
    0 0 0 1px var(--input-bg),
    0 0 0 3px var(--input-border-focus);
}
```

### Placeholder text

- Usar `::placeholder` con color **explicito** y `opacity: 1`.
- El placeholder debe tener al menos 3:1 de contraste contra el fondo del input (es un componente UI, no texto normal).
- Incluir vendor prefixes para navegadores legacy:

```css
input::placeholder { color: var(--input-placeholder); opacity: 1; }
input::-webkit-input-placeholder { color: var(--input-placeholder); }
input::-moz-placeholder { color: var(--input-placeholder); opacity: 1; }
```

### Validacion y estados de error

```css
:root {
  --input-error-border: oklch(0.60 0.20 25);
  --input-error-bg: oklch(0.97 0.02 25);
  --input-error-text: oklch(0.45 0.18 25);
}

.dark {
  --input-error-border: oklch(0.65 0.18 25);
  --input-error-bg: oklch(0.20 0.04 25);
  --input-error-text: oklch(0.80 0.14 25);
}
```

---

## 12. Dark mode en tablas

### Alternating rows (zebra striping)

```css
:root {
  --table-bg: oklch(1 0 0);
  --table-bg-alt: oklch(0.97 0 0);
  --table-hover: oklch(0.95 0.02 250);
  --table-selected: oklch(0.92 0.04 250);
  --table-border: oklch(0.90 0 0);
  --table-header-bg: oklch(0.97 0 0);
  --table-text: oklch(0.15 0 0);
  --table-text-muted: oklch(0.45 0 0);
}

.dark {
  --table-bg: oklch(0.17 0.005 260);
  --table-bg-alt: oklch(0.15 0.005 260);
  --table-hover: oklch(0.22 0.01 250);
  --table-selected: oklch(0.24 0.03 250);
  --table-border: oklch(0.25 0.005 260);
  --table-header-bg: oklch(0.15 0.005 260);
  --table-text: oklch(0.90 0 0);
  --table-text-muted: oklch(0.60 0 0);
}

table {
  border-collapse: collapse;
  width: 100%;
}

thead th {
  background: var(--table-header-bg);
  color: var(--table-text);
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid var(--table-border);
}

tbody tr {
  background: var(--table-bg);
  transition: background-color 0.15s ease;
}

tbody tr:nth-child(even) {
  background: var(--table-bg-alt);
}

tbody tr:hover {
  background: var(--table-hover);
}

tbody tr[aria-selected="true"],
tbody tr.selected {
  background: var(--table-selected);
}

tbody td {
  padding: 10px 16px;
  color: var(--table-text);
  border-bottom: 1px solid var(--table-border);
}
```

**Con Tailwind:**

```html
<tr class="bg-white even:bg-gray-50 hover:bg-blue-50
           dark:bg-gray-900 dark:even:bg-gray-900/50
           dark:hover:bg-blue-950/30
           transition-colors duration-150">
```

### Consideraciones especificas en dark mode

1. **Diferencia sutil entre filas:** En dark mode, la diferencia entre filas pares e impares debe ser minima (delta L de 0.02 en OKLCH). Demasiada diferencia crea un efecto de "rayas de cebra" molesto.
2. **Bordes mas sutiles:** Usar borders con opacidad baja en lugar de colores solidos.
3. **Selection state:** Usar un tinte del color primario con opacidad baja, no un gris diferente.
4. **Header sticky:** Si el header de la tabla es sticky, darle un fondo solido (no transparente) para que cubra las filas al scrollear.

---

## 13. Transiciones animadas entre temas

### 13.1 CSS Transitions simples

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

**Problema:** Aplicar transition a `*` es costoso en rendimiento y puede causar transiciones no deseadas en elementos que no deberian animarse.

### 13.2 CSS @property (metodo moderno recomendado)

Con `@property`, declaras la transicion a nivel de variable y todo lo que use esa variable se anima automaticamente:

```css
@property --bg-color {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(1 0 0);
}

@property --text-color {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(0.15 0 0);
}

:root {
  --bg-color: oklch(1 0 0);
  --text-color: oklch(0.15 0 0);
  transition: --bg-color 0.3s ease, --text-color 0.3s ease;
}

.dark {
  --bg-color: oklch(0.15 0.01 260);
  --text-color: oklch(0.93 0 0);
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}
```

**Ventaja:** La transicion se define una sola vez a nivel de variable. No hay que perseguir cada elemento. El browser interpola los colores correctamente porque conoce el tipo (`<color>`).

**Soporte:** Chrome, Edge (completo). Firefox y Safari con soporte creciente.

### 13.3 View Transitions API (efecto premium)

La View Transitions API permite animaciones de tipo "circular reveal" como las de Telegram:

```javascript
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');

  // Verificar soporte
  if (!document.startViewTransition) {
    document.documentElement.classList.toggle('dark');
    return;
  }

  const transition = document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });

  // Obtener posicion del boton toggle
  const btn = document.querySelector('#theme-toggle');
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Calcular radio maximo (distancia a la esquina mas lejana)
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
}
```

```css
/* Desactivar animacion fade por defecto */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* Respetar preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

**Soporte:** Baseline desde octubre 2025 (Chrome, Edge, Firefox, Safari).

### 13.4 Deshabilitar transicion (opcion pragmatica)

shadcn/ui y next-themes incluyen `disableTransitionOnChange` como opcion por defecto. Rationale: las transiciones de color pueden verse inconsistentes si no todos los elementos transicionan a la misma velocidad. Un cambio instantaneo es mas predecible.

```tsx
<ThemeProvider disableTransitionOnChange>
  {children}
</ThemeProvider>
```

Internamente, esto anade temporalmente:

```css
*, *::before, *::after {
  transition-duration: 0s !important;
}
```

---

## 14. High contrast y forced colors

### prefers-contrast

```css
/* Usuario solicita mas contraste (macOS/iOS Accessibility) */
@media (prefers-contrast: more) {
  :root {
    --text-muted: oklch(0.30 0 0);    /* Mas oscuro que el default */
    --border: oklch(0.40 0 0);         /* Bordes mas visibles */
  }
  .dark {
    --text-muted: oklch(0.80 0 0);
    --border: oklch(0.60 0 0);
  }
}

/* Usuario solicita menos contraste */
@media (prefers-contrast: less) {
  :root {
    --text-primary: oklch(0.25 0 0);
    --bg: oklch(0.96 0 0);
  }
}
```

### forced-colors (Windows High Contrast Mode)

Cuando `forced-colors: active`, el navegador reemplaza TODOS los colores con la paleta del usuario. Solo se pueden usar **system color keywords**:

```css
@media (forced-colors: active) {
  .button {
    /* Usar system colors, no custom values */
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }

  .button:hover {
    border-color: Highlight;
    color: Highlight;
  }

  .button:focus-visible {
    outline: 2px solid Highlight;
  }

  /* Iconos SVG: forzar color del sistema */
  svg {
    fill: ButtonText;
  }

  /* Evitar que se pierdan bordes importantes */
  .card {
    border: 1px solid CanvasText;
  }
}
```

**System color keywords disponibles:**
- `Canvas` / `CanvasText` - Fondo y texto del documento
- `ButtonFace` / `ButtonText` - Fondo y texto de botones
- `Highlight` / `HighlightText` - Seleccion y texto seleccionado
- `LinkText` - Color de enlaces
- `GrayText` - Texto deshabilitado
- `Field` / `FieldText` - Fondo y texto de inputs

### forced-color-adjust

```css
/* Evitar que el navegador sobreescriba colores en elementos decorativos */
.brand-banner {
  forced-color-adjust: none;
}

/* Pero asegurar que el texto sigue siendo legible */
.brand-banner .text {
  forced-color-adjust: auto;
}
```

### Relacion con dark mode

En Chromium, si el fondo forzado tiene luminosidad < 0.33, automaticamente matchea `prefers-color-scheme: dark`. Esto significa que tus estilos dark mode se aplican dentro de Windows High Contrast dark themes.

### Soporte

- **Chromium + Firefox:** Soportan `forced-colors: active`.
- **Safari:** No lo soporta. Apple usa su propio mecanismo (Increased Contrast Mode via `prefers-contrast: more`).

---

## 15. Reduccion de fatiga visual

### Investigacion cientifica relevante

- Estudios muestran que la fatiga visual es causada mas por **ergonomia de pantalla** (distancia, brillo ambiental, tamano de texto) que por el modo de color.
- Sin embargo, el modo de color **si afecta** la comodidad subjetiva, especialmente en ambientes oscuros.
- Investigacion de 2024-2025 indica que dark mode es preferible en **ambientes con poca luz**, mientras que light mode es mas legible en **ambientes bien iluminados**.

### Recomendaciones especificas de colores

#### Fondos

```css
.dark {
  /* RECOMENDADO: gris oscuro con tinte sutil, no negro puro */
  --bg-primary: oklch(0.15 0.01 260);     /* Gris azulado oscuro */
  --bg-surface: oklch(0.18 0.008 260);    /* Superficie elevada */
  --bg-surface-raised: oklch(0.22 0.01 260); /* Mas elevada */
}
```

#### Texto

```css
.dark {
  /* RECOMENDADO: no usar blanco puro */
  --text-primary: oklch(0.90 0 0);       /* ~#E3E3E3 */
  --text-secondary: oklch(0.72 0 0);     /* Texto secundario */
  --text-tertiary: oklch(0.55 0 0);      /* Texto terciario, etiquetas */
}
```

#### Pares recomendados (background / text)

| Fondo | Texto | Ratio aprox. | Recomendacion |
|-------|-------|-------------|---------------|
| `oklch(0.15 0 0)` | `oklch(0.90 0 0)` | ~12:1 | Excelente para body text |
| `oklch(0.15 0 0)` | `oklch(0.72 0 0)` | ~6.5:1 | Bueno para texto secundario |
| `oklch(0.15 0 0)` | `oklch(0.55 0 0)` | ~3.5:1 | Aceptable solo para texto grande o labels |
| `oklch(0.20 0 0)` | `oklch(0.88 0 0)` | ~9:1 | Ideal para superficies elevadas |
| `oklch(0.12 0 0)` | `oklch(0.93 0 0)` | ~15:1 | Demasiado contraste, puede causar halation |

#### Principios clave

1. **Contraste optimo: 8:1 a 12:1** para body text en dark mode. Ni demasiado bajo (ilegible) ni demasiado alto (halation).
2. **Tinte sutil en el fondo:** Un tinte azulado o violeta sutil (chroma 0.005-0.02 en OKLCH) es mas agradable que gris puro neutro.
3. **Tipografia:** Aumentar ligeramente el `font-weight` en dark mode (ej: 400 -> 420 con variable fonts) porque el texto claro sobre oscuro parece mas delgado.
4. **Interlineado:** Considerar aumentar `line-height` ligeramente en dark mode para mayor legibilidad.
5. **Colores de acento:** Usar colores mas claros y menos saturados que en light mode.

---

## 16. Dark mode y print

### Por que siempre imprimir en light mode

- Imprimir un fondo oscuro consume mucha tinta.
- Los navegadores intentan convertir dark a light antes de imprimir, pero la conversion automatica puede fallar.
- Los bloques de codigo con syntax highlighting dark quedan ilegibles si el browser elimina el fondo.

### Implementacion

#### Con media queries

```css
/* Envolver dark mode en @media not print */
@media not print {
  .dark {
    --bg: oklch(0.15 0.01 260);
    --text: oklch(0.90 0 0);
    /* ... todos los dark mode tokens ... */
  }
}

/* Print siempre usa light mode */
@media print {
  :root, .dark {
    --bg: white;
    --text: black;
    --border: #ccc;

    color-scheme: light;
  }

  /* Eliminar fondos innecesarios */
  * {
    background: transparent !important;
    box-shadow: none !important;
  }

  /* Mantener fondos en badges/tags si son informativos */
  .badge, .tag, .status {
    background: initial !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

#### Con Tailwind CSS (plugin custom)

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    plugin(function({ addVariant }) {
      // Dark mode solo aplica fuera de print
      addVariant('dark', '@media not print { :is(:where(.dark) &) }');
    })
  ]
};
```

#### Tailwind v4

```css
/* app.css */
@import "tailwindcss";
@custom-variant dark (@media not print { &:where(.dark, .dark *) });
```

---

## 17. Estrategias de testing

### 17.1 Visual regression testing

**Herramientas principales (2025-2026):**

| Herramienta | Enfoque | Dark mode | Ideal para |
|---|---|---|---|
| **Chromatic** | Storybook components | Snapshots por story con parametros dark | Design systems, componentes |
| **Percy** | Pages completas | Snapshots multiples por test | E2E, paginas completas |
| **Lost Pixel** | Open source | Configurable | Equipos con presupuesto limitado |
| **Argos** | CI-native | Multiples viewports | Proyectos open source |

**Percy Visual Review Agent** (lanzado 2025): Usa IA para analizar diffs visuales, reduciendo el tiempo de review 3x y filtrando 40% de cambios que son ruido de rendering.

#### Configuracion con Storybook + Chromatic

```typescript
// .storybook/preview.ts
export const parameters = {
  // Capturar ambos temas automaticamente
  chromatic: {
    modes: {
      light: { theme: 'light' },
      dark: { theme: 'dark' },
    },
  },
};

// En una story individual
export const DarkMode = {
  parameters: {
    chromatic: { theme: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
```

### 17.2 Contrast checking automatizado

```javascript
// Con axe-core en tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('dark mode tiene contraste suficiente', async () => {
  document.documentElement.classList.add('dark');
  const results = await axe(document.body, {
    rules: {
      'color-contrast': { enabled: true }
    }
  });
  expect(results).toHaveNoViolations();
});
```

```bash
# CLI con pa11y
pa11y --standard WCAG2AA "http://localhost:3000?theme=dark"

# Lighthouse audit
lighthouse "http://localhost:3000" --emulated-form-factor=none \
  --only-categories=accessibility
```

### 17.3 Testing manual esencial

Checklist para cada tema:

- [ ] Texto body legible (verificar con contrast checker)
- [ ] Texto muted/secondary legible
- [ ] Focus rings visibles en todos los elementos interactivos
- [ ] Borders de inputs visibles
- [ ] Estados hover distinguibles
- [ ] Badges/tags legibles
- [ ] Imagenes con fondo transparente se ven bien
- [ ] Charts y graficos legibles
- [ ] Sombras funcionan (o se reemplazan por elevacion tonal)
- [ ] Print preview sale en light mode
- [ ] No hay flash al cargar la pagina
- [ ] Toggle funciona correctamente (light -> dark -> system)
- [ ] Scrollbars se adaptan al tema
- [ ] Form controls nativos (select, checkbox, radio) se adaptan

### 17.4 DevTools para testing

```javascript
// Chrome DevTools: emular prefers-color-scheme
// Rendering panel > Emulate CSS media feature prefers-color-scheme

// Chrome DevTools: emular forced-colors
// Rendering panel > Emulate CSS media feature forced-colors

// Verificar contraste en Elements panel
// Inspeccionar elemento > Color picker > muestra ratio de contraste
```

---

## 18. Guia de implementacion consolidada

### Paso 1: Definir arquitectura de tokens

```css
/* 1. Primitivos (raw values) */
:root {
  --white: oklch(1 0 0);
  --black: oklch(0 0 0);
  --gray-50: oklch(0.98 0 0);
  --gray-100: oklch(0.93 0 0);
  --gray-200: oklch(0.87 0 0);
  --gray-300: oklch(0.78 0 0);
  --gray-400: oklch(0.65 0 0);
  --gray-500: oklch(0.55 0 0);
  --gray-600: oklch(0.45 0 0);
  --gray-700: oklch(0.35 0 0);
  --gray-800: oklch(0.25 0 0);
  --gray-900: oklch(0.17 0 0);
  --gray-950: oklch(0.12 0 0);

  --blue-400: oklch(0.68 0.14 250);
  --blue-500: oklch(0.55 0.19 250);
  --blue-600: oklch(0.48 0.17 250);

  --red-400: oklch(0.68 0.16 25);
  --red-500: oklch(0.57 0.22 25);
  --red-600: oklch(0.50 0.20 25);
}

/* 2. Semanticos — Light mode (default) */
:root {
  /* Backgrounds */
  --bg-default: var(--white);
  --bg-surface: var(--gray-50);
  --bg-subtle: var(--gray-100);
  --bg-emphasis: var(--blue-500);
  --bg-danger: oklch(0.97 0.02 25);

  /* Text */
  --text-default: var(--gray-900);
  --text-muted: var(--gray-500);
  --text-on-emphasis: var(--white);
  --text-danger: var(--red-600);

  /* Borders */
  --border-default: var(--gray-200);
  --border-emphasis: var(--gray-400);
  --border-focus: var(--blue-500);
  --border-danger: oklch(0.70 0.15 25);

  /* Shadows */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.07);
  --shadow-lg: 0 10px 15px oklch(0 0 0 / 0.1);

  /* Interactive */
  --interactive-hover: var(--gray-100);
  --interactive-active: var(--gray-200);

  color-scheme: light;
}

/* 3. Semanticos — Dark mode */
.dark {
  --bg-default: oklch(0.15 0.01 260);
  --bg-surface: oklch(0.18 0.008 260);
  --bg-subtle: oklch(0.22 0.01 260);
  --bg-emphasis: var(--blue-400);
  --bg-danger: oklch(0.20 0.04 25);

  --text-default: oklch(0.90 0 0);
  --text-muted: oklch(0.65 0 0);
  --text-on-emphasis: oklch(0.15 0 0);
  --text-danger: var(--red-400);

  --border-default: oklch(0.28 0.005 260);
  --border-emphasis: oklch(0.40 0.005 260);
  --border-focus: var(--blue-400);
  --border-danger: oklch(0.55 0.14 25);

  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.2);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px oklch(0 0 0 / 0.4);

  --interactive-hover: oklch(0.22 0.01 260);
  --interactive-active: oklch(0.26 0.015 260);

  color-scheme: dark;
}
```

### Paso 2: Deteccion y persistencia de tema

```html
<!-- En <head>, inline, antes de cualquier CSS -->
<script>
  (function() {
    var t = localStorage.getItem('theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && d)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Paso 3: Toggle con soporte para 3 estados

```typescript
type Theme = 'light' | 'dark' | 'system';

function setTheme(theme: Theme) {
  if (theme === 'system') {
    localStorage.removeItem('theme');
  } else {
    localStorage.setItem('theme', theme);
  }
  applyTheme();
}

function applyTheme() {
  const stored = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored === 'dark' || (!stored && systemDark);

  document.documentElement.classList.toggle('dark', isDark);

  // Actualizar meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? 'oklch(0.15 0.01 260)' : '#ffffff');
  }
}

// Escuchar cambios del sistema
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', applyTheme);
```

### Paso 4: Print override

```css
@media print {
  :root, .dark {
    --bg-default: white;
    --text-default: black;
    --border-default: #ddd;
    color-scheme: light;
  }
}
```

### Paso 5: High contrast support

```css
@media (prefers-contrast: more) {
  :root {
    --text-muted: var(--gray-700);
    --border-default: var(--gray-500);
  }
  .dark {
    --text-muted: oklch(0.80 0 0);
    --border-default: oklch(0.50 0 0);
  }
}

@media (forced-colors: active) {
  * {
    forced-color-adjust: auto;
  }
  .decorative-element {
    forced-color-adjust: none;
  }
}
```

### Paso 6: Testing

```bash
# 1. Automated contrast check
npx pa11y --standard WCAG2AA http://localhost:3000

# 2. Visual regression (Chromatic)
npx chromatic --project-token=xxx

# 3. Manual: Chrome DevTools > Rendering > Emulate prefers-color-scheme
```

---

## 19. Fuentes

### Dark mode general
- [Dark Mode with CSS: A Comprehensive Guide (2026)](https://618media.com/en/blog/dark-mode-with-css-a-comprehensive-guide/)
- [The ultimate guide to coding dark mode layouts in 2025](https://devieffe.substack.com/p/the-ultimate-guide-to-coding-dark-mode-layouts-in-2025)
- [Dark Mode CSS Complete Guide](https://design.dev/guides/dark-mode-css/)
- [CSS-Tricks: A Complete Guide to Dark Mode on the Web](https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/)

### CSS light-dark() y color-scheme
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)
- [web.dev: CSS color-scheme-dependent colors with light-dark()](https://web.dev/articles/light-dark)
- [CSS-Tricks: Come to the light-dark() Side](https://css-tricks.com/come-to-the-light-dark-side/)
- [Stefan Judis: light-dark() isn't always the same as prefers-color-scheme](https://www.stefanjudis.com/today-i-learned/light-dark-isnt-the-same-as-prefers-color-scheme/)

### OKLCH
- [OKLCH in CSS: why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [OKLCH: The Modern CSS Color Space (2025)](https://medium.com/@alexdev82/oklch-the-modern-css-color-space-you-should-be-using-in-2025-52dd1a4aa9d0)
- [The Ultimate OKLCH Guide](https://oklch.org/posts/ultimate-oklch-guide)

### Design tokens
- [Design Tokens & Theming: Scalable UI Systems 2025](https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025)
- [Design Tokens in Practice: From Figma Variables to Production Code](https://www.designsystemscollective.com/design-tokens-in-practice-from-figma-variables-to-production-code-fd40aeccd6f5)
- [Penpot: The developer's guide to design tokens and CSS variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/)

### Frameworks y design systems
- [Tailwind CSS: Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui: Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui: Dark Mode](https://ui.shadcn.com/docs/dark-mode)
- [Radix Colors: Understanding the Scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [Radix Colors: Aliasing](https://www.radix-ui.com/colors/docs/overview/aliasing)
- [Material Design 3: Color Roles](https://m3.material.io/styles/color/roles)
- [M3: Choosing a Color Scheme](https://m3.material.io/styles/color/choosing-a-scheme)

### GitHub Primer
- [Primer: UI Color System Overview](https://primer.style/foundations/color/overview/)
- [GitHub Blog: Unlocking inclusive design with Primer's color system](https://github.blog/engineering/user-experience/unlocking-inclusive-design-how-primers-color-system-is-making-github-com-more-inclusive/)
- [GitHub Blog: Accelerating theme creation with color tooling](https://github.blog/news-insights/product-news/accelerating-github-theme-creation-with-color-tooling/)

### Apps SaaS
- [Linear: How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Slack Engineering: Building Dark Mode on Desktop](https://slack.engineering/building-dark-mode-on-desktop/)
- [Figma Blog: Illuminating dark mode](https://www.figma.com/blog/illuminating-dark-mode/)

### Animaciones y transiciones
- [View Transitions API theme toggle (Akash Hamirwasia)](https://akashhamirwasia.com/blog/full-page-theme-toggle-animation-with-view-transitions-api/)
- [Jon Shamir: Smooth color mode transitions with @property](https://jonshamir.com/writing/color-mode)
- [DEV.to: Building a Smooth Dark/Light Mode Switch](https://dev.to/web_dev-usman/building-a-smooth-darklight-mode-switch-with-modern-css-features-3jlc)

### Accesibilidad y contraste
- [WebAIM: Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
- [W3C: Understanding SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Primer: Color considerations](https://primer.style/accessibility/design-guidance/color-considerations/)

### High contrast y forced colors
- [Smashing Magazine: Windows High Contrast Mode, Forced Colors and CSS Custom Properties](https://www.smashingmagazine.com/2022/03/windows-high-contrast-colors-mode-css-custom-properties/)
- [Smashing Magazine: The Guide To Windows High Contrast Mode](https://www.smashingmagazine.com/2022/06/guide-windows-high-contrast-mode/)
- [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)

### Data visualization
- [CleanChart: Dark Mode Charts Best Practices (2026)](https://www.cleanchart.app/blog/dark-mode-charts)
- [Implementing Dark Mode for Data Visualizations](https://ananyadeka.medium.com/implementing-dark-mode-for-data-visualizations-design-considerations-66cd1ff2ab67)

### Testing
- [Percy vs Chromatic comparison](https://medium.com/@crissyjoshua/percy-vs-chromatic-which-visual-regression-testing-tool-to-use-6cdce77238dc)
- [Visual Regression Testing: SaaS vs DIY tools](https://sparkbox.com/foundry/visual_regression_testing_with_backstopjs_applitools_webdriverio_wraith_percy_chromatic)
- [Visual Testing Tools Comparison 2025](https://vizzly.dev/visual-testing-tools-comparison/)

### next-themes
- [GitHub: pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)
- [Not A Number: Fixing Dark Mode Flickering (FOUC)](https://notanumber.in/blog/fixing-react-dark-mode-flickering)
- [Next.js Dark Mode Implementation Guide (2025)](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/)

### Fatiga visual
- [PMC: Immediate Effects of Light Mode and Dark Mode on Visual Fatigue](https://pmc.ncbi.nlm.nih.gov/articles/PMC12027292/)
- [PMC: Effect of Ambient Illumination and Text Color on Visual Fatigue](https://pmc.ncbi.nlm.nih.gov/articles/PMC11175232/)
- [ACM: Eye Tracking Study on Dark and Light Themes (2025)](https://dl.acm.org/doi/10.1145/3715669.3725879)

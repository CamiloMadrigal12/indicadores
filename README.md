# Tablero PDM 2026 · avance por secretaría

Tablero web estático (HTML, CSS y JavaScript, sin dependencias ni servidor) con el avance 2026 del Plan de Desarrollo, a la fecha del tercer trimestre, por secretaría y por indicador.

## Qué muestra

- **Todas las secretarías**: cumplimiento promedio de la alcaldía, cuántos indicadores van en verde, amarillo y rojo, y una tabla con las secretarías ordenadas de menor a mayor cumplimiento.
- **Una secretaría**: se elige en el selector o con un clic en la tabla. Muestra sus cifras, sus indicadores ordenados del más rezagado al más avanzado (con filtro por color) y los no programados (NP).
- **Un indicador**: al hacer clic en una fila se ve su tipo, meta 2026, cierre 2026, cumplimiento y cómo se calculó.

Semáforo: verde 80% o más, amarillo 60% a 79%, rojo menos de 60%. El promedio cuenta como 100% los indicadores que superan la meta.

Cada secretaría tiene su propio enlace, por ejemplo `https://tu-sitio/#secretaria-de-salud`.

## Estructura

```
index.html                    página
assets/styles.css             estilos (modo claro y oscuro automáticos)
assets/app.js                 lógica del tablero
data/indicadores_2026.csv     datos fuente (exportados del cierre del cuatrienio v4)
data/indicadores_2026.js      los mismos datos en el formato que lee la página
herramientas/csv_a_js.py      regenera el .js a partir del .csv
```

## Verlo en tu computador

Abre `index.html` con doble clic. Funciona sin internet.

## Publicarlo

### GitHub Pages
1. Crea un repositorio nuevo en GitHub y sube el contenido de esta carpeta (que `index.html` quede en la raíz).
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarda.
3. En uno o dos minutos queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Ten en cuenta que en una cuenta gratuita el repositorio debe ser público para usar Pages, y cualquiera con el enlace podrá ver el tablero.

### Vercel
1. Entra a vercel.com → **Add New → Project** e importa el repositorio de GitHub (o arrastra esta carpeta en **vercel.com/new**).
2. Framework Preset: **Other**. No hace falta comando de build ni carpeta de salida.
3. **Deploy**. Vercel te da una dirección `https://….vercel.app`.

### Netlify (alternativa)
Arrastra esta carpeta en app.netlify.com/drop.

## Actualizar los datos

1. Reemplaza `data/indicadores_2026.csv` con la nueva exportación (mismas columnas).
2. Ejecuta `python herramientas/csv_a_js.py` para regenerar `data/indicadores_2026.js`.
3. Sube los cambios. GitHub Pages y Vercel publican la nueva versión solos.

Columnas que usa el tablero: `secretaria, codigo, indicador, unidad, tipo, meta_2026, cierre_2026, cumplimiento_2026, estado, calculo`. `estado` es `verde`, `amarillo`, `rojo` o `NP`; los porcentajes van como fracción (0.75 = 75%).

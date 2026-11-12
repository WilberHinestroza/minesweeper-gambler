# Mina Fortuna

Buscaminas + apuestas + construcción de motor estilo Balatro.

El diseño del juego está en [DESIGN.md](DESIGN.md).

## Estado

Fase 3 jugable: buscaminas de casino con comodines, tienda, jefes y
persistencia local.

- Tablero con **primer clic seguro**, despeje automático y banderas.
- **3 vidas** y **8 movimientos** al empezar, que suben hasta 13 en rondas
  avanzadas.
- Puntuación **chips × mult** con racha por clics seguros consecutivos.
- **12 comodines** con efectos sobre puntuación, protección de minas y dinero.
- Elige **1 comodín inicial gratis** entre 3 opciones.
- Entre rondas: tienda con 3 ofertas, re-tirar y vender comodines.
- Mazo de hasta **5 comodines**.
- Cobra al superar el objetivo: base + movimientos sobrantes + banderas
  acertadas + bonus de comodines.
- **Chording**: pulsa un número con sus banderas puestas para abrir las
  casillas de alrededor (cuesta 1 movimiento).
- **Rondas jefe** cada 3 rondas: El Recaudador recorta la recompensa y La Mina
  Madre añade un 30% de minas.
- **Persistencia local**: continúa la run al recargar y guarda tus récords.
- **Sonido sintetizado** con opción de silenciar.

Controles:

- **PC**: clic izquierdo para cavar, clic derecho para poner bandera.
- **Móvil**: tocar para cavar, mantener pulsada una casilla para poner bandera.
  También hay un botón para cambiar entre modo cavar y modo bandera.
- Pulsa un número revelado para hacer chording cuando sus banderas coincidan.

Pendiente para siguientes fases: más jefes, consumibles, reto diario y
progresión meta.

## Desarrollo

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

Genera la carpeta `build/` lista para producción.

## Despliegue en GitHub Pages

El sitio se publica automáticamente en:

https://wilberhinestroza.github.io/minesweeper-gambler/

Cada push a `master` (o `main`) ejecuta el workflow
`.github/workflows/deploy.yml`, que compila el proyecto y lo publica en GitHub
Pages.

Requisito (una sola vez): en el repositorio, ir a **Settings → Pages** y
seleccionar **Source: GitHub Actions**.

El `homepage` de `package.json` debe coincidir con la URL del sitio para que los
assets se resuelvan con el prefijo `/minesweeper-gambler/`.

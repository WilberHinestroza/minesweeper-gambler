# Mina Fortuna

Buscaminas + apuestas + construcción de motor estilo Balatro.

El diseño del juego está en [DESIGN.md](DESIGN.md).

## Estado

Fase 1 jugable: tablero con primer clic seguro, despeje automático, banderas,
vidas, clics, puntuación, objetivo y fin de run.

Controles:

- **PC**: clic izquierdo para cavar, clic derecho para poner bandera.
- **Móvil**: tocar para cavar, mantener pulsada una casilla para poner bandera.
  También hay un botón para cambiar entre modo cavar y modo bandera.

Pendiente: comodines y tienda (fase 2).

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

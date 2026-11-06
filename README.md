# Mina Fortuna

Buscaminas + apuestas + construcción de motor estilo Balatro.

El diseño del juego está en [DESIGN.md](DESIGN.md).

## Estado

Prototipo en desarrollo. Actualmente el repositorio contiene el esqueleto de
Create React App y la configuración de despliegue.

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

https://wilberhinestrosa.github.io/minesweeper-gambler/

Cada push a `master` (o `main`) ejecuta el workflow
`.github/workflows/deploy.yml`, que compila el proyecto y lo publica en GitHub
Pages.

Requisito (una sola vez): en el repositorio, ir a **Settings → Pages** y
seleccionar **Source: GitHub Actions**.

El `homepage` de `package.json` debe coincidir con la URL del sitio para que los
assets se resuelvan con el prefijo `/minesweeper-gambler/`.

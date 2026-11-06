# MINA FORTUNA — Documento de diseño (v0.1)

> Buscaminas + apuestas + construcción de motor estilo Balatro.
> Alcance actual: **prototipo funcional**, sin arte ni sonido. UI mínima, toda la
> energía en que el loop sea divertido y legible.

---

## 1. Pitch

Cada ronda es un campo de minas que funciona como **mesa de casino**. Abres
casillas para generar **puntos** (chips × mult) y alcanzar un **objetivo** antes
de quedarte sin clics. Pisar una mina cuesta una vida. Entre rondas compras
**comodines** que alteran cómo puntúan las casillas, creando sinergias que se
acumulan durante la partida.

La tensión central: **abrir casillas es apostar**. Cada clic puede dar un combo
enorme o explotar. Y como el dinero se gana terminando la ronda con clics
sobrantes, el jugador siempre quiere *una casilla más*.

---

## 2. Pilares

1. **Deducción con premio.** Los números no solo informan: puntúan. Deducir
   dónde hay un cero (y por tanto un despeje grande) es la jugada maestra.
2. **Riesgo medible.** El jugador puede calcular probabilidades, pero nunca tiene
   certeza total. La apuesta es informada, no ciega.
3. **Motor que crece.** Los comodines convierten reglas simples en combinaciones
   cada vez más rotas. Perder una run debe doler y dar ganas de repetir.
4. **Rondas cortas.** 1–3 minutos por ronda. Decisiones rápidas, feedback
   inmediato.

---

## 3. Loop de juego

```
Menú
 └─> RONDA (campo de minas + objetivo)
       ├─ clic izquierdo: revelar (cuesta 1 clic)
       ├─ clic derecho: abanderar (gratis)
       ├─ objetivo alcanzado -> botón COBRAR
       │     └─ recompensa en $ + TIENDA
       │           └─ comprar comodines -> siguiente ronda (más difícil)
       └─ minas agotadas (vidas 0) o clics agotados sin objetivo -> FIN DE RUN
```

Una run completa debería durar entre 15 y 30 minutos (8–12 rondas).

---

## 4. Reglas de la ronda

### 4.1 Recursos

| Recurso | Inicio | Se gasta en | Se recupera |
|---|---|---|---|
| **Vidas (♥)** | 3 | Pisar una mina (−1) | Comodines / eventos |
| **Clics** | 8 por ronda (hasta 13) | Revelar una casilla (−1) | No se recuperan dentro de la ronda |
| **Dinero ($)** | 0 | Tienda, rerolls | Recompensa de ronda, comodines |
| **Comodines** | 1 gratis entre 3 | — | Tienda (máx. 5 espacios) |

- **Bandera**: gratis, máximo igual al número de minas del tablero.
- **Vidas a 0** → fin de run inmediato.
- **Clics a 0 sin alcanzar el objetivo** → fin de run.
- **Objetivo alcanzado** → aparece **COBRAR**. Se puede cobrar en cualquier
  momento a partir de ahí.

### 4.2 Tablero

- Tamaño y minas por ronda (ver tabla de balance).
- **Primer clic siempre seguro**: las minas se colocan *después* del primer clic,
  excluyendo el área 3×3 alrededor de la casilla elegida.
- Despeje automático clásico: una casilla con 0 revela en cascada sus vecinas y
  los números del borde.
- Las banderas bloquean el clic izquierdo sobre esa casilla.
- Sin *chording* en v0.1 (clic sobre número con banderas correctas). Se evalúa
  para v0.2.

### 4.3 Pisar una mina

- El clic **no puntúa**.
- Pierdes **1 vida**.
- La mina queda visible.
- La racha segura se reinicia.
- Ciertos comodines pueden anular la pérdida de vida (una vez).

---

## 5. Puntuación

Cada clic revela una o más casillas y produce una puntuación:

```
chips = Σ por casilla revelada (5 + 5 × número)
mult  = 1 + 0.5 × racha + bonos de comodines
puntos_clic = chips × mult
```

- Casilla sin número (0) = 5 chips (y provoca el despeje).
- Casilla con número `n` = `5 + 5n` chips. Un 3 vale 20 chips.
- **Racha**: +0.5 mult por cada clic seguro consecutivo (máx. +2.5). Se reinicia
  al pisar una mina o al empezar una ronda nueva.
- Los comodines suman mult **antes** de los multiplicadores `×Mult`
  (mismo orden que Balatro: aditivo primero, multiplicativo después).

Los puntos de la ronda se **acumulan**. El objetivo es un total, no un mínimo por
clic.

### 5.1 Ejemplo

Clic en un 0 que despeja 15 casillas, de las cuales 5 son números (suma 10):

```
chips = 15×5 + 5×10 = 125
mult  = 1 + 0.5×2 (racha) = 2
puntos = 250
```

### 5.2 Recompensa al cobrar

```
$ = 3 + clics_restantes + banderas_correctas (máx. +3) + intereses
```

- Cobrar pronto (gastando pocos clics) paga más: incentivo directo a la
  eficiencia y a arriesgar para encontrar despejes grandes.
- Las banderas incorrectas no penalizan en v0.1 (los comodines pueden cambiarlo).

---

## 6. Comodines

Sistema de **hooks** para que añadir efectos sea barato. Un comodín declara qué
eventos escucha y qué modifica:

```
onClickScore   -> modifica chips / mult de un clic
onMineHit      -> puede anular o castigar la explosión
onRoundStart   -> prepara el tablero
onRoundEnd     -> bonificaciones al cobrar
onFlag         -> reacciona a banderas
```

### 6.1 Set inicial (12)

| Comodín | Efecto | Precio |
|---|---|---|
| **Racha** | +0.25 mult extra por clic seguro consecutivo | $4 |
| **Bomba de humo** | +2 mult por cada bandera acertada (máx. +8) | $4 |
| **Contador** | +0.5 mult por cada casilla con número revelada en el clic (máx. +4) | $5 |
| **Rayo** | El primer despeje de 0 de cada ronda duplica los chips | $6 |
| **Seguro** | Ignora la primera mina de la run | $7 |
| **Casco** | Ignora la primera mina de cada ronda | $6 |
| **Detector** | Marca 1 mina aleatoria al colocar el tablero | $5 |
| **Codicia** | +$1 por cada 100 puntos de la ronda (máx. +$5) | $5 |
| **Duplicador** | ×1.5 mult si el clic revela 5+ casillas | $6 |
| **Suertudo** | 10% de probabilidad de que una mina sea de fogueo | $7 |
| **Interés** | +$1 por cada $5 al terminar la ronda (máx. +$3) | $4 |
| **Borde** | +8 chips por cada casilla del borde del tablero revelada | $3 |

### 6.2 Reglas de tienda

- 3 comodines aleatorios por visita, sin repetir los que ya tienes.
- Reroll: $2 (sube $1 por cada reroll de la misma tienda).
- Vender un comodín: mitad de su precio (redondeado hacia abajo).
- Máximo 5 comodines equipados.
- El pool de comodines se desbloquea por completo desde el inicio en el prototipo.

---

## 7. Balance inicial

Objetivo y tablero por ronda. La curva inicial se ajustó simulando partidas:
los objetivos tempranos son alcanzables con cualquier comodín inicial, y a
partir de la ronda 9 el objetivo crece ×1.6 por ronda.

| Ronda | Tablero | Minas | Objetivo | Movimientos |
|---|---|---|---|---|
| 1 | 8×8 | 10 | 500 | 8 |
| 2 | 8×8 | 12 | 750 | 8 |
| 3 | 9×9 | 15 | 1.050 | 9 |
| 4 | 9×9 | 18 | 1.450 | 9 |
| 5 | 10×10 | 22 | 2.000 | 10 |
| 6 | 10×10 | 26 | 2.700 | 10 |
| 7 | 12×12 | 34 | 3.700 | 11 |
| 8 | 12×12 | 40 | 5.000 | 11 |
| 9+ | +2 columnas/filas cada 2 rondas | +15% | ×1.6 | +1 cada 2 rondas (máx. 13) |

Los números son una hipótesis de partida; se ajustan jugando. La métrica clave:
**¿cuántos movimientos sobran en una ronda típica?** Si sobran 3 o más, el
objetivo es demasiado bajo. Si nunca se alcanza, es demasiado alto.

### 7.1 Vidas

3 vidas es el valor inicial. Si las explosiones se sienten demasiado castigadas,
subir a 4 antes de tocar la puntuación.

---

## 8. Pantallas (v0.2)

1. **Menú**: título, reglas resumidas, botón JUGAR.
2. **Elección inicial**: 3 comodines gratis; el jugador elige 1.
3. **Ronda**:
   - Barra superior: ronda, dinero, vidas, movimientos y racha actual.
   - Objetivo con barra de progreso.
   - Bandeja de comodines con tooltip de efecto.
   - Tablero central y feedback por clic con las bonificaciones activadas.
   - Botón **COBRAR** cuando el objetivo está cumplido.
4. **Tienda**: recompensa desglosada, 3 ofertas, reroll, mazo con opción de
   vender, y botón SIGUIENTE RONDA.
5. **Fin de run**: ronda alcanzada, puntos totales, dinero, botón VOLVER A
   JUGAR.

Todo con HTML/CSS simple (grid para el tablero). Las animaciones se limitan a
transiciones de color/feedback y respetan `prefers-reduced-motion`.

---

## 9. Arquitectura técnica propuesta

CRA + React 19, JavaScript puro, sin dependencias extra. Estado global con
`useReducer`.

```
src/
  game/
    rng.js        // PRNG con semilla (mulberry32) -> runs reproducibles y tests
    board.js      // crear tablero, colocar minas, revelar, despeje, banderas
    scoring.js    // cálculo base de chips/mult/puntos por clic
    jokers.js     // definiciones, efectos de puntuación, dinero y protección
    shop.js       // generación de ofertas y precios de venta
    run.js        // reducer y máquina de estados de la run
    balance.js    // tablas de rondas, precios, constantes
  components/
    MenuScreen.js
    StarterScreen.js
    RoundScreen.js
    Board.js
    Cell.js
    Hud.js
    JokerCard.js
    JokerBar.js
    ShopScreen.js
    RunOverScreen.js
  App.js
  App.css
  index.css
  game/__tests__/
    board.test.js
    scoring.test.js
    jokers.test.js
    shop.test.js
    run.test.js
```

### 9.1 Estado de la run

```js
{
  phase: 'menu' | 'starter' | 'round' | 'shop' | 'runOver',
  seed: 123456,
  round: 1,
  money: 0,
  hearts: 3,
  totalScore: 0,
  jokers: [],          // ids de comodines equipados (máx. 5)
  starterOffers: [],   // 3 ids durante la elección inicial
  shop: { offers: [], rerollCost: 2, rerolls: 0 } | null,
  config: { rows, cols, mines, target },
  board: { cells, rows, cols, mines, minesPlaced, explodedIndex },
  target: 500,
  score: 0,
  clicksLeft: 8,
  streak: 0,
  lastResult: { type: 'safe' | 'mine' | 'dud', chips, mult, points, triggers },
  seguroUsed: false,
  cascoUsed: false,
  rayoUsed: false,
  detectorUsed: false,
}
```

### 9.2 Reglas de implementación

- Toda la lógica de juego en `src/game/` debe ser **pura** y testeable sin React.
- Nada de `Math.random()` dentro de la lógica: usar el RNG con semilla.
- Los efectos se aplican en orden fijo: bonos aditivos de mult, bonos de chips y
  después los multiplicadores `×Mult`.
- Cada clic devuelve una lista de `triggers` (`[{id, name, symbol, label}]`)
  para pintar el feedback ("+3 mult", "chips ×2") sin acoplar UI y lógica.

---

## 10. Roadmap

### Fase 1 — Núcleo jugable (sin comodines)
- [x] Generación de tablero con primer clic seguro.
- [x] Revelar + despeje automático + banderas.
- [x] Vidas, movimientos, puntuación y objetivo.
- [x] Cobrar / fin de run.
- [x] Pantallas de menú, ronda y fin de run.
- [x] Tests de tablero y puntuación.

### Fase 2 — Motor de comodines y tienda
- [x] Sistema de efectos (puntuación, dinero y protección).
- [x] Los 12 comodines iniciales.
- [x] Elección de comodín inicial.
- [x] Tienda, reroll, vender, límite de espacios.
- [x] Feedback de puntuación por clic.
- [x] Tests de comodines y tienda.

### Fase 3 — Pulido de prototipo
- [ ] Persistencia local (récord, run en curso).
- [x] Ajuste inicial de balance con simulaciones.
- [ ] Sonido y animaciones mínimas.
- [x] Soporte táctil (long press para bandera).
- [ ] Chording.

### Fase 4 — Profundidad (post-prototipo)
- [ ] Rondas jefe cada 3 rondas (modificadores: sin despeje, minas ocultas,
      impuestos, campo minado extra).
- [ ] Consumibles (una vez por ronda).
- [ ] Semilla diaria / reto compartido.
- [ ] Progresión meta (desbloquear comodines).

---

## 11. Decisiones abiertas

- **Nombre**: "Mina Fortuna" es provisional. Alternativas: "All-In Mines",
  "Jackpot Mines", "Campo de Suerte".
- **Idioma**: UI en español. Se puede externalizar a un diccionario si se quiere
  inglés después.
- **Tono**: ¿casino elegante o mina industrial con humor? Afecta nombres y copy.
- **¿Vidas o escudos?** Las vidas son simples; los escudos por ronda permiten
  diseñar comodines más interesantes. Empezar con vidas y revisar en Fase 2.
- **¿La puntuación debe reiniciarse entre rondas?** En v0.1 sí (cada ronda es un
  objetivo independiente). Una variante es un total acumulado de run.
- **Contenido sensible**: es dinero ficticio, sin compras reales ni cripto. La
  estética de casino es temática, no una promesa de ganancias.

---

## 12. Criterio de éxito del prototipo

El prototipo está bien si, después de 10 runs de prueba:

1. Se entiende en menos de 1 minuto qué hacer.
2. Existe al menos una decisión interesante por ronda (arriesgar un clic extra
   vs. cobrar, qué comodín comprar).
3. Se quiere pulsar "volver a jugar" al perder.
4. El jugador puede explicar por qué ganó o perdió una ronda.

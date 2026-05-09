# Knight Survivor - Work Plan

## TL;DR

> **Quick Summary**: Juego survival arcade medieval auto-shooter en 2D. El jugador (caballero) se mueve con WASD y dispara automáticamente en 360° con dagas. Enemigos medievales (esqueletos, murciélagos, ogros) spawnean infinitamente. Sistema de XP con monedas, upgrades por nivel, y ranking global via Supabase.
> 
> **Deliverables**:
> - Juego web funcional deployado en Vercel
> - Pantalla de inicio con input de username + botón Play
> - Gameplay completo: movimiento, disparo omnidireccional, enemigos, XP, upgrades
> - HUD con timer de supervivencia prominente arriba
> - Pantalla Game Over con score y ranking
> - Supabase integration para leaderboard global
> 
> **Estimated Effort**: Medium (3h agentic development)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Wave 1 scaffolding → Wave 2 core gameplay → Wave 3 UI/integration → Wave 4 deploy

---

## Context

### Original Request
Juego survival arcade infinito tipo Vampire Survivors pero más simple. Auto-shooter omnidireccional (dispara en 360°, no apunta). Upgrades por nivel. Ranking con Supabase.

### Interview Summary
**Key Discussions**:
- **Engine**: Phaser 3 seleccionado sobre PixiJS/ThreeJS/Pygame (game engine completo, más rápido para MVP)
- **Gráficos**: Sprites generados con canvas (no assets externos), estilo MEDIEVAL
- **Deploy**: Vercel (export estático)
- **Controles**: Solo desktop (WASD/flechas), sin táctil por ahora
- **Sonido**: Sí, básico medieval (golpes, monedas, pasos)
- **Upgrades**: 7 tipos (Damage+, Attack Speed+, Max HP+, HP Regen, Multi-shot, Piercing, Orbitals)
- **Disparo**: Omnidireccional 360°, empieza con 4-6 proyectiles, no apunta al enemigo
- **UI**: Username + Play button en inicio, timer prominente arriba

**Research Findings**:
- Phaser 3 Arcade Physics es perfecto para este tipo de juego (colisiones AABB, overlap detection)
- Phaser.Scene permite separar Boot → Menu → Game → GameOver limpiamente
- Supabase JS client es ~20KB gzipped, API REST simple para leaderboard
- Vite static export genera archivos listos para Vercel
- Web Audio API + Phaser.Sound para SFX sin archivos de audio externos (generar tones programáticamente)

### Metis Review
**Identified Gaps** (addressed):
- Game balance parameters → Defaults aplicados en plan (ver TODOs)
- Spawn system → Definido: exponencial, max 60 enemigos, spawn distance 400px del jugador
- Score formula → `kills * 10 + time_seconds * 2 + level * 50`
- Upgrade choices → 3 random de las disponibles por level up
- Cap de upgrades → No hay cap, stackean infinitamente (como Vampire Survivors)
- Mobile support → Explicitamente EXCLUIDO de este MVP

---

## Work Objectives

### Core Objective
Crear un juego survival arcade medieval funcional y deployado donde el jugador sobrevive el mayor tiempo posible mientras enemigos spawnean infinitamente, consiguiendo upgrades cada nivel.

### Concrete Deliverables
- `index.html` - Entry point
- `src/main.ts` - Bootstrap Phaser + Vite
- `src/scenes/BootScene.ts` - Genera sprites en canvas, carga audio
- `src/scenes/MenuScene.ts` - Pantalla inicio (username input + Play)
- `src/scenes/GameScene.ts` - Gameplay principal
- `src/scenes/GameOverScene.ts` - Score final + ranking + retry
- `src/entities/Player.ts` - Jugador caballero
- `src/entities/Enemy.ts` - Enemigos medievales (4 tipos)
- `src/entities/Projectile.ts` - Dagas/flechas
- `src/entities/Orbital.ts` - Bolitas girando
- `src/systems/UpgradeSystem.ts` - Lógica de upgrades
- `src/systems/SpawnSystem.ts` - Spawning de enemigos
- `src/systems/AudioSystem.ts` - SFX medieval
- `src/ui/HUD.ts` - Timer, HP, nivel, kills
- `src/ui/UpgradeMenu.ts` - Menú de selección de upgrades
- `src/api/supabase.ts` - Cliente Supabase para ranking
- `vite.config.ts` - Config Vite
- `package.json` - Dependencias
- `.env.example` - Variables de entorno Supabase

### Definition of Done
- [ ] Juego se puede abrir en navegador, ingresar username, clickear Play
- [ ] Jugador se mueve con WASD, dispara automáticamente en 360°
- [ ] Enemigos spawnean desde bordes y se mueven hacia jugador
- [ ] Al matar enemigos sueltan monedas de XP
- [ ] Al subir de nivel aparece menú de 3 upgrades
- [ ] Timer muestra tiempo de supervivencia en tiempo real
- [ ] Al morir, se muestra score y se guarda en Supabase
- [ ] Se puede ver ranking global
- [ ] Deployado en Vercel accesible públicamente

### Must Have
- Pantalla de inicio con username + botón Play
- Timer de supervivencia visible y prominente
- Sistema de disparo omnidireccional (360°)
- 4 tipos de enemigos con diferentes stats
- 7 upgrades funcionales
- Sistema de XP y leveling
- Guardado de scores en Supabase
- Ranking global visible
- Estilo visual medieval coherente

### Must NOT Have (Guardrails)
- NO controles táctiles (fuera de scope)
- NO animaciones complejas (solo sprites estáticos o rotación básica)
- NO múltiples escenarios/mapas (un solo arena)
- NO múltiples personajes seleccionables
- NO menú de opciones/settings
- NO sonido ambiente/música de fondo (solo SFX básicos)
- NO partículas complejas (solo flashes básicos en hit)
- NO guardado local de progreso (solo ranking online)
- NO sistema de logros/achievements
- NO wave announcements o bosses

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield)
- **Automated tests**: None (para 3h MVP, QA manual del agente)
- **Framework**: Ninguno
- **Agent-Executed QA**: SÍ - obligatorio para todas las tareas

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright - Navegar, interactuar, assert DOM, screenshot
- **Game Logic**: Bash (node REPL o browser console) - Verificar cálculos
- **API/Backend**: Bash (curl) - Probar endpoints Supabase

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Scaffolding + Foundation - Start Immediately):
├── T1: Proyecto Vite + Phaser 3 setup
├── T2: Generador de sprites medievales (canvas)
├── T3: Sistema de audio medieval (Web Audio)
├── T4: Estructura de escenas (Boot → Menu → Game → GameOver)
└── T5: Supabase client + tabla de rankings

Wave 2 (Core Gameplay - MAX PARALLEL, depends on Wave 1):
├── T6: Jugador caballero (movimiento, HP, sprite)
├── T7: Sistema de disparo omnidireccional (360°)
├── T8: Enemigos medievales (4 tipos + IA + spawn)
├── T9: Sistema de XP (monedas + leveling)
├── T10: Sistema de upgrades (7 tipos + UI selección)
├── T11: Orbitals (bolitas girando)
└── T12: Cámara y mundo (bounds + follow)

Wave 3 (Integration + UI - depends on Wave 2):
├── T13: Game loop completo (waves, dificultad progresiva)
├── T14: Pantalla Menu (username input + Play button)
├── T15: HUD (timer prominente arriba + HP + nivel + kills)
├── T16: Pantalla Game Over (score + ranking + retry)
└── T17: Integración Supabase (guardar/ver rankings)

Wave 4 (Polish + Deploy - depends on Wave 3):
├── T18: Balance tuning (stats, spawn rates, XP curve)
├── T19: Configuración deploy Vercel
└── T20: Build y deploy final

Wave FINAL (After ALL tasks - 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T2-T5 → T6-T12 → T13-T17 → T18-T20 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | - | T2-T5 |
| T2 | T1 | T6-T12 |
| T3 | T1 | T6-T12 |
| T4 | T1 | T6-T12 |
| T5 | T1 | T17 |
| T6 | T2, T3, T4 | T13 |
| T7 | T2, T4 | T10, T13 |
| T8 | T2, T4 | T9, T13 |
| T9 | T2, T4, T8 | T10, T13 |
| T10 | T2, T4, T7, T9 | T13 |
| T11 | T2, T4 | T13 |
| T12 | T2, T4 | T13 |
| T13 | T6-T12 | T15, T18 |
| T14 | T4 | T13 |
| T15 | T13 | T16, T18 |
| T16 | T13, T15 | T17, T18 |
| T17 | T5, T16 | T18, T20 |
| T18 | T13-T17 | T20 |
| T19 | - | T20 |
| T20 | T17-T19 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks → `quick`
- **Wave 2**: 7 tasks → mix de `quick` y `deep`
- **Wave 3**: 5 tasks → mix
- **Wave 4**: 3 tasks → `quick`
- **FINAL**: 4 tasks → `oracle`, `unspecified-high`, `unspecified-high`, `deep`

---

## TODOs

- [x] **T1. Proyecto Vite + Phaser 3 Setup**

  **What to do**:
  - Crear estructura de carpetas: `src/scenes/`, `src/entities/`, `src/systems/`, `src/ui/`, `src/api/`
  - Inicializar proyecto con Vite: `npm create vite@latest knight-survivor -- --template vanilla-ts`
  - Instalar dependencias: `phaser`, `@supabase/supabase-js`
  - Instalar devDependencies: `typescript`, `vite`
  - Crear `index.html` con canvas container
  - Crear `src/main.ts` que bootstrap Phaser con config básica (800x600, Arcade Physics, fondo #2a1f1d color tierra oscura)
  - Crear `vite.config.ts` con config para static export
  - Crear `tsconfig.json` estándar
  - Crear `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

  **Must NOT do**:
  - NO agregar plugins de Vite innecesarios
  - NO modificar estructura de carpetas del template innecesariamente

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Setup estándar, no requiere skills especiales

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T2, T3, T4, T5
  - **Blocked By**: None

  **References**:
  - Vite vanilla-ts template docs
  - Phaser 3 Getting Started: https://phaser.io/tutorials/getting-started-phaser3

  **Acceptance Criteria**:
  - [ ] `npm install` completa sin errores
  - [ ] `npm run dev` levanta servidor en localhost:5173
  - [ ] Canvas de Phaser se renderiza (fondo visible)
  - [ ] No hay errores en consola del navegador

  **QA Scenarios**:
  ```
  Scenario: Proyecto levanta correctamente
    Tool: Bash
    Steps:
      1. cd knight-survivor && npm install
      2. npm run dev &
      3. sleep 3
      4. curl -s http://localhost:5173 | head -20
    Expected Result: HTML contiene canvas, no errores 404
    Evidence: .sisyphus/evidence/t1-project-runs.png
  ```

  **Commit**: YES
  - Message: `chore: Vite + Phaser 3 project setup`
  - Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.ts`

- [x] **T2. Generador de Sprites Medievales (Canvas)**

  **What to do**:
  - Crear `src/scenes/BootScene.ts` que extienda Phaser.Scene
  - Generar sprites programáticamente usando Phaser.Graphics:
    - **Player (caballero)**: Rectángulo con "yelmo" (rectángulo más chico arriba), colores `#4a6fa5` (azul acero) y `#c9b037` (dorado yelmo)
    - **Enemy Basic (esqueleto)**: Rectángulo blanco hueso `#e8e0d5` con "cráneo" (rectángulo más chico arriba)
    - **Enemy Fast (murciélago)**: Forma de ala/triángulo, color `#8b4513` (marrón)
    - **Enemy Tank (ogro)**: Rectángulo grande verde oscuro `#2d5016`
    - **Enemy Shooter (arquero esqueleto)**: Igual a básico pero con arco (línea curva) `#e8e0d5`
    - **Projectile (daga)**: Triángulo pequeño gris `#a0a0a0` con punta afilada
    - **XP Coin (moneda)**: Círculo dorado `#ffd700` con borde `#b8860b`
    - **Orbital (escudo/bola)**: Círculo azul claro `#87ceeb` con brillo
  - Guardar cada sprite como texture en Phaser: `scene.add.graphics().generateTexture('player', 32, 32)`
  - Generar también texturas para UI: botón de madera (rectángulo marrón `#8b4513` con borde `#654321`)
  - Sprite size: Player/Enemies 32x32, Projectile 16x16, Coin 16x16, Orbital 20x20

  **Must NOT do**:
  - NO usar archivos de imagen externos
  - NO hacer sprites complejos (máximo 3 formas por sprite)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Canvas drawing básico, no requiere skills

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T3, T4, T5)
  - **Parallel Group**: Wave 1
  - **Blocks**: T6-T12
  - **Blocked By**: T1

  **References**:
  - Phaser 3 Graphics: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
  - Phaser generateTexture: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html#generateTexture

  **Acceptance Criteria**:
  - [ ] BootScene carga y genera todas las texturas sin errores
  - [ ] Al menos 8 texturas generadas (player, 4 enemies, projectile, coin, orbital)
  - [ ] Cada sprite es visible y reconocible en el juego

  **QA Scenarios**:
  ```
  Scenario: Sprites se generan correctamente
    Tool: Playwright
    Steps:
      1. Abrir http://localhost:5173
      2. Esperar a que BootScene complete
      3. Screenshot del canvas
    Expected Result: Canvas muestra fondo, no errores de textura faltante en consola
    Evidence: .sisyphus/evidence/t2-sprites-generated.png
  ```

  **Commit**: YES
  - Message: `feat: generate medieval sprites with canvas`
  - Files: `src/scenes/BootScene.ts`

- [x] **T3. Sistema de Audio Medieval (Web Audio)**

  **What to do**:
  - Crear `src/systems/AudioSystem.ts`
  - Usar Web Audio API (no archivos externos) para generar SFX:
    - **Shoot**: Oscilador cuadrado, frecuencia 800Hz → 400Hz, duración 0.1s (sonido de "swoosh" de daga)
    - **Hit**: Ruido blanco filtrado lowpass, duración 0.15s (golpe de espada)
    - **Coin**: Oscilador senoidal, frecuencia 1200Hz → 1800Hz, duración 0.2s (moneda medieval)
    - **LevelUp**: Oscilador diente de sierra, arpegio ascendente (400→600→800Hz), duración 0.5s
    - **GameOver**: Oscilador senoidal descendente (400→100Hz), duración 1s
  - Crear clase AudioSystem con métodos: `playShoot()`, `playHit()`, `playCoin()`, `playLevelUp()`, `playGameOver()`
  - Respetar AudioContext policy: solo iniciar después de interacción del usuario (click en Play)

  **Must NOT do**:
  - NO usar archivos de audio externos (mp3, wav, etc.)
  - NO iniciar AudioContext antes de interacción del usuario

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Web Audio API básico

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T2, T4, T5)
  - **Parallel Group**: Wave 1
  - **Blocks**: T6-T12
  - **Blocked By**: T1

  **References**:
  - Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
  - Phaser.Sound: https://photonstorm.github.io/phaser3-docs/Phaser.Sound.WebAudioSoundManager.html

  **Acceptance Criteria**:
  - [ ] AudioSystem se instancia sin errores
  - [ ] Cada método reproduce sonido distintivo
  - [ ] AudioContext inicia solo después de click en Play
  - [ ] No hay errores de AudioContext en consola

  **QA Scenarios**:
  ```
  Scenario: Sonidos funcionan tras interacción
    Tool: Playwright
    Steps:
      1. Abrir http://localhost:5173
      2. Click en Play
      3. Verificar en console.log que AudioContext se inició
    Expected Result: No hay error "AudioContext was not allowed to start"
    Evidence: .sisyphus/evidence/t3-audio-working.png
  ```

  **Commit**: YES
  - Message: `feat: Web Audio SFX system with medieval sounds`
  - Files: `src/systems/AudioSystem.ts`

- [x] **T4. Estructura de Escenas (Boot → Menu → Game → GameOver)**

  **What to do**:
  - Crear 4 escenas en `src/scenes/`:
    - **BootScene**: Genera sprites, precarga, luego transiciona a MenuScene
    - **MenuScene**: Pantalla de inicio con:
      - Fondo color `#2a1f1d` (tierra oscura)
      - Título "Knight Survivor" en texto grande blanco (Phaser.Text)
      - Input de username (HTML overlay o Phaser DOM Element)
      - Botón "Play" (sprite de madera con texto)
      - Al click Play: validar username no vacío → guardar en registry → iniciar GameScene
    - **GameScene**: Gameplay principal (vacío por ahora, placeholder)
    - **GameOverScene**: Muestra "Game Over", score, botón "Retry" (vuelve a GameScene) y "Menu" (vuelve a MenuScene)
  - Configurar en `main.ts`: `scene: [BootScene, MenuScene, GameScene, GameOverScene]`
  - Usar `this.scene.start('SceneName')` para transiciones

  **Must NOT do**:
  - NO hacer menúes complejos con múltiples opciones
  - NO agregar settings/options

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Phaser scenes básico

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T2, T3, T5)
  - **Parallel Group**: Wave 1
  - **Blocks**: T6-T16
  - **Blocked By**: T1

  **References**:
  - Phaser Scene Manager: https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.ScenePlugin.html
  - Phaser DOM Element: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.DOMElement.html

  **Acceptance Criteria**:
  - [ ] BootScene → MenuScene transiciona automáticamente
  - [ ] MenuScene muestra título, input, y botón Play
  - [ ] Click en Play valida username y transiciona a GameScene
  - [ ] GameScene placeholder se muestra (fondo + texto "Game Running")
  - [ ] GameOverScene placeholder accesible (agregar shortcut temporal para test)

  **QA Scenarios**:
  ```
  Scenario: Navegación entre escenas funciona
    Tool: Playwright
    Steps:
      1. Abrir http://localhost:5173
      2. Esperar BootScene (1s)
      3. Screenshot MenuScene
      4. Llenar input con "TestPlayer"
      5. Click botón Play
      6. Screenshot GameScene
    Expected Result: Menu muestra input + botón. Tras Play, aparece GameScene.
    Evidence: .sisyphus/evidence/t4-scene-navigation.png

  Scenario: Username vacío no permite jugar
    Tool: Playwright
    Steps:
      1. Click Play sin llenar username
    Expected Result: No transiciona, muestra alert/mensaje "Enter username"
    Evidence: .sisyphus/evidence/t4-empty-username.png
  ```

  **Commit**: YES
  - Message: `feat: scene structure - Boot, Menu, Game, GameOver`
  - Files: `src/scenes/BootScene.ts`, `src/scenes/MenuScene.ts`, `src/scenes/GameScene.ts`, `src/scenes/GameOverScene.ts`

- [x] **T5. Supabase Client + Tabla de Rankings**

  **What to do**:
  - Crear `src/api/supabase.ts`:
    - Inicializar cliente Supabase con `createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)`
    - Exportar instancia supabase
  - Crear tipos en `src/types/ranking.ts`:
    ```typescript
    interface Ranking {
      id?: number;
      name: string;
      time_survived: number;
      level: number;
      kills: number;
      score: number;
      created_at?: string;
    }
    ```
  - Crear funciones:
    - `saveRanking(data: Omit<Ranking, 'id' | 'created_at'>): Promise<void>`
    - `getTopRankings(limit: number = 10): Promise<Ranking[]>`
  - Configurar tabla en Supabase (manualmente o via dashboard):
    - Tabla: `rankings`
    - Columns: `id (int8, PK)`, `name (text)`, `time_survived (int8)`, `level (int8)`, `kil$s (int8)`, `score (int8)`, `created_at (timestamptz)`
    - RLS: Deshabilitado para MVP (o policy pública)

  **Must NOT do**:
  - NO implementar autenticación de usuarios (solo username libre)
  - NO validar duplicados de nombre

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Supabase JS client es simple

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T2, T3, T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T17
  - **Blocked By**: T1

  **References**:
  - Supabase JS Client: https://supabase.com/docs/reference/javascript/introduction
  - Supabase Insert: https://supabase.com/docs/reference/javascript/insert
  - Supabase Select: https://supabase.com/docs/reference/javascript/select

  **Acceptance Criteria**:
  - [ ] Cliente Supabase se inicializa sin errores
  - [ ] `saveRanking()` inserta datos correctamente
  - [ ] `getTopRankings()` retorna array ordenado por score descendente
  - [ ] Tabla existe en Supabase con schema correcto

  **QA Scenarios**:
  ```
  Scenario: Guardar y leer rankings funciona
    Tool: Bash (curl)
    Steps:
      1. curl -X POST "$SUPABASE_URL/rest/v1/rankings" \
         -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
         -d '{"name":"Test","time_survived":60,"level":5,"kills":20,"score":500}'
      2. curl "$SUPABASE_URL/rest/v1/rankings?select=*&order=score.desc&limit=5" \
         -H "apikey: $ANON_KEY"
    Expected Result: POST retorna 201, GET incluye el registro insertado
    Evidence: .sisyphus/evidence/t5-supabase-api.txt
  ```

  **Commit**: YES
  - Message: `feat: Supabase client and ranking API`
  - Files: `src/api/supabase.ts`, `src/types/ranking.ts`

- [x] **T6. Jugador Caballero (Movimiento, HP, Sprite)**

  **What to do**:
  - Crear `src/entities/Player.ts` extendiendo Phaser.Physics.Arcade.Sprite
  - Stats iniciales (tuneables):
    - HP: 100, Max HP: 100
    - Speed: 200 px/s
    - Position: center de la pantalla (400, 300)
  - Movimiento: WASD o flechas (Phaser.Input.Keyboard)
  - Sprite: usar textura 'player' generada en BootScene
  - Visual HP: barra de vida verde arriba del sprite (Phaser.Graphics rectangle)
  - Métodos: `takeDamage(amount: number)`, `heal(amount: number)`, `update()`
  - Al takeDamage: parpadear sprite (alpha 0.5 por 100ms), reproducir sonido hit
  - Al HP <= 0: emitir evento 'player-death'
  - Bounds: clamp position dentro del mundo (0,0 a 1600,1200)

  **Must NOT do**:
  - NO agregar dash, roll, o mecánicas de movimiento complejas
  - NO animaciones de caminar (solo sprite estático + movimiento)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Phaser sprite + input básico

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T7, T8, T9, T10, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T3, T4

  **References**:
  - Phaser Arcade Sprite: https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.Sprite.html
  - Phaser Keyboard Input: https://photonstorm.github.io/phaser3-docs/Phaser.Input.Keyboard.html

  **Acceptance Criteria**:
  - [ ] Jugador aparece en centro de pantalla
  - [ ] WASD mueve al jugador en 4 direcciones
  - [ ] Barra de HP visible arriba del sprite
  - [ ] Al recibir daño, HP baja y sprite parpadea
  - [ ] Al llegar a 0 HP, emite evento 'player-death'
  - [ ] No puede salir de los bounds del mundo

  **QA Scenarios**:
  ```
  Scenario: Movimiento y HP funcionan
    Tool: Playwright
    Steps:
      1. Abrir juego, Play, llegar a GameScene
      2. Presionar W durante 1s, screenshot
      3. Presionar D durante 1s, screenshot
      4. Trigger daño (agregar método debug `takeDamage(20)` en window)
      5. Verificar barra de HP disminuyó
    Expected Result: Jugador se mueve, HP bar responde al daño
    Evidence: .sisyphus/evidence/t6-player-movement.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T7. Sistema de Disparo Omnidireccional (360°)**

  **What to do**:
  - Crear `src/entities/Projectile.ts` extendiendo Phaser.Physics.Arcade.Sprite
  - Crear `src/systems/ShootingSystem.ts`
  - Lógica de disparo:
    - Timer que dispara cada `cooldown` ms (inicial: 1000ms)
    - Al disparar: crear N proyectiles distribuidos en círculo (360°)
    - N inicial: 4 proyectiles (0°, 90°, 180°, 270°)
    - Cada upgrade de Multi-shot agrega +1 proyectil (distribuidos equitativamente)
    - Ejemplo con 5 proyectiles: 72° entre cada uno
    - Ejemplo con 6 proyectiles: 60° entre cada uno
  - Proyectil stats:
    - Speed: 400 px/s
    - Lifetime: 2000ms (se destruye después)
    - Damage: 25 (base)
    - Sprite: 'projectile' (daga)
    - Rotation: apunta en dirección de movimiento
  - Piercing: si tiene upgrade de Piercing, el proyectil NO se destruye al colisionar (usa overlap en vez de collide)
  - Colisiones: overlap con enemigos → daño → destruir proyectil (a menos que tenga piercing)
  - Audio: reproducir `playShoot()` en cada disparo

  **Must NOT do**:
  - NO apuntar al enemigo más cercano (omnidireccional puro)
  - NO limitar a solo 8 direcciones (distribución equitativa en círculo)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - Reason: Lógica matemática de distribución angular + colisiones

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T8, T9, T10, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10, T13
  - **Blocked By**: T2, T4

  **References**:
  - Phaser Arcade Physics overlap: https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#overlap
  - Phaser TimerEvent: https://photonstorm.github.io/phaser3-docs/Phaser.Time.TimerEvent.html

  **Acceptance Criteria**:
  - [ ] Proyectiles spawnean cada 1s inicialmente
  - [ ] 4 proyectiles iniciales en 0°, 90°, 180°, 270°
  - [ ] Proyectiles se mueven en línea recta a 400px/s
  - [ ] Se destruyen después de 2s o al salir del mundo
  - [ ] Colisionan con enemigos y hacen daño
  - [ ] Con piercing, atraviesan enemigos
  - [ ] Cooldown se reduce con upgrade Attack Speed

  **QA Scenarios**:
  ```
  Scenario: Disparo omnidireccional base
    Tool: Playwright
    Steps:
      1. Abrir juego, Play
      2. No mover jugador, esperar 3s
      3. Screenshot
    Expected Result: 4 proyectiles visibles moviéndose en cruz desde el jugador
    Evidence: .sisyphus/evidence/t7-shooting-base.png

  Scenario: Multi-shot agrega proyectiles
    Tool: Playwright + Browser Console
    Steps:
      1. En console: `window.player.upgrades.multiShot = 2`
      2. Esperar siguiente disparo
      3. Screenshot
    Expected Result: 6 proyectiles visibles (distribuidos en círculo)
    Evidence: .sisyphus/evidence/t7-multishot.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T8. Enemigos Medievales (4 Tipos + IA + Spawn)**

  **What to do**:
  - Crear `src/entities/Enemy.ts` extendiendo Phaser.Physics.Arcade.Sprite
  - Crear `src/systems/SpawnSystem.ts`
  - 4 tipos de enemigos:
    | Tipo | Sprite | HP | Speed | Damage | XP Drop | Color |
    |------|--------|-----|-------|--------|---------|-------|
    | Basic (Skeleton) | 'enemy-basic' | 50 | 100 | 10 | 10 | blanco hueso |
    | Fast (Bat) | 'enemy-fast' | 25 | 180 | 5 | 15 | marrón |
    | Tank (Ogre) | 'enemy-tank' | 150 | 60 | 20 | 25 | verde oscuro |
    | Shooter (Archer) | 'enemy-shooter' | 40 | 80 | 15 | 20 | blanco hueso + arco |
  - IA: todos los tipos usan `moveToObject(this, player, speed)` (se mueven directo al jugador)
  - SpawnSystem:
    - Spawnea enemigos cada `spawnInterval` ms (inicial: 2000ms)
    - Posición: borde del mundo (elegir borde random: top, bottom, left, right)
    - Distancia del jugador: mínimo 400px (para evitar spawn encima)
    - Composición inicial: 100% Basic
    - Cada 30s: agregar chance de Fast (20%), luego Tank (10%), luego Shooter (15%)
    - Max enemies en pantalla: 60 (para performance)
    - Dificultad: cada 30s reducir spawnInterval en 10% (mínimo 500ms)
  - Al morir: destruir sprite, dropear XP coin (1-3 monedas dependiendo tipo), reproducir `playHit()`
  - Colisiones: overlap con player → daño al jugador → empujar enemigo ligeramente hacia atrás

  **Must NOT do**:
  - NO pathfinding complejo (A*, navegación por obstáculos)
  - NO variaciones de IA entre tipos (todos van directo al jugador)
  - NO spawn de bosses o waves especiales

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - Reason: Sistema de spawn con dificultad progresiva + múltiples tipos

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T7, T9, T10, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T9, T13
  - **Blocked By**: T2, T4

  **References**:
  - Phaser moveToObject: https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.ArcadePhysics.html#moveToObject
  - Phaser Group: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html

  **Acceptance Criteria**:
  - [ ] 4 tipos de enemigos spawnean con stats diferentes
  - [ ] Todos se mueven hacia el jugador
  - [ ] Spawn rate aumenta con el tiempo
  - [ ] Max 60 enemigos en pantalla
  - [ ] Al morir dropean monedas de XP
  - [ ] Colisionan con jugador y hacen daño

  **QA Scenarios**:
  ```
  Scenario: Enemigos spawnean y persiguen
    Tool: Playwright
    Steps:
      1. Abrir juego, Play
      2. No mover jugador, esperar 10s
      3. Screenshot
      4. Contar enemigos visibles
    Expected Result: Múltiples enemigos moviéndose hacia el centro (jugador)
    Evidence: .sisyphus/evidence/t8-enemies-spawn.png

  Scenario: Dificultad progresiva
    Tool: Playwright + Browser Console
    Steps:
      1. Esperar 60s de gameplay
      2. En console: verificar `spawnSystem.spawnInterval`
    Expected Result: Interval es menor que 2000ms (ej: ~1600ms)
    Evidence: .sisyphus/evidence/t8-difficulty.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T9. Sistema de XP (Monedas + Leveling)**

  **What to do**:
  - Crear `src/entities/Coin.ts` extendiendo Phaser.Physics.Arcade.Sprite
  - Crear `src/systems/XPSystem.ts`
  - Coin:
    - Sprite: 'coin' (moneda dorada)
    - Spawn: al morir enemigo, dropear 1-3 monedas en posición random cercana (±20px)
    - Movimiento: magnetismo hacia jugador si está dentro de `pickupRadius` (inicial: 100px)
    - Velocidad de magnetismo: 200 px/s
    - Al tocar jugador: destruir, dar XP, reproducir `playCoin()`
  - XP System:
    - XP actual, XP para siguiente nivel, nivel actual
    - XP necesaria por nivel: `baseXP * (level ^ 1.5)` (baseXP: 100)
    - Ejemplo: Nivel 1→2: 100 XP, 2→3: 283 XP, 3→4: 520 XP
    - Al recoger moneda: +XP (valor depende del enemigo)
    - Al alcanzar XP necesaria: subir de nivel → emitir evento 'level-up' → pausar gameplay → mostrar UpgradeMenu
    - Stats por nivel: +5 Max HP (automático, no es upgrade)

  **Must NOT do**:
  - NO auto-recolectar todas las monedas (solo dentro del pickup radius)
  - NO XP compartida o sistema de clases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Sistema de XP lineal con fórmula simple

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T7, T8, T10, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10, T13
  - **Blocked By**: T2, T4, T8

  **References**:
  - Phaser Arcade Physics moveToObject (para magnetismo)

  **Acceptance Criteria**:
  - [ ] Monedas spawnean al morir enemigos
  - [ ] Monedas se mueven hacia jugador dentro de radio
  - [ ] Al tocar jugador, dan XP y desaparecen
  - [ ] XP barra visible en HUD (placeholder por ahora)
  - [ ] Al alcanzar XP necesaria, emite 'level-up'
  - [ ] Cada nivel da +5 Max HP automático

  **QA Scenarios**:
  ```
  Scenario: XP y leveling funcionan
    Tool: Playwright + Browser Console
    Steps:
      1. Abrir juego, Play
      2. Matar enemigos, recolectar monedas
      3. En console: verificar `xpSystem.xp` y `xpSystem.level`
      4. Esperar hasta level up
    Expected Result: XP aumenta con monedas, level sube al alcanzar threshold
    Evidence: .sisyphus/evidence/t9-xp-system.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T10. Sistema de Upgrades (7 Tipos + UI Selección)**

  **What to do**:
  - Crear `src/systems/UpgradeSystem.ts`
  - Crear `src/ui/UpgradeMenu.ts`
  - 7 upgrades disponibles:
    1. **Damage+**: +10 daño por proyectil (base: 25)
    2. **Attack Speed+**: -10% cooldown (mínimo 200ms)
    3. **Max HP+**: +20 HP máximo, heal +20 HP instantáneo
    4. **HP Regen**: +2 HP/segundo (base: 0)
    5. **Multi-shot**: +1 proyectil por disparo (base: 4)
    6. **Piercing**: Proyectiles atraviesan enemigos (boolean toggle, una vez activado permanece)
    7. **Orbitals**: Agrega 1 orbital girando alrededor del jugador (base: 0, máximo visual: 6)
  - Al subir de nivel:
    - Pausar gameplay (timeScale = 0)
    - Mostrar UpgradeMenu: fondo semitransparente negro, 3 tarjetas en fila horizontal
    - Cada tarjeta: nombre de upgrade + descripción + icono (sprite del efecto)
    - 3 upgrades random de las disponibles (si ya tiene piercing, no aparece)
    - Click en tarjeta → aplicar upgrade → cerrar menú → reanudar gameplay
    - Reproducir `playLevelUp()`
  - Estructura de datos upgrades:
    ```typescript
    interface Upgrades {
      damage: number;      // nivel de upgrade (0 = base)
      attackSpeed: number;
      maxHp: number;
      hpRegen: number;
      multiShot: number;
      piercing: boolean;
      orbitals: number;
    }
    ```
  - Aplicar efectos:
    - Damage: `baseDamage + (upgrades.damage * 10)`
    - Attack Speed: `baseCooldown * (0.9 ^ upgrades.attackSpeed)`
    - Max HP: aumentar maxHP y curar
    - HP Regen: regenerar cada segundo en `update()`
    - Multi-shot: aumentar N proyectiles
    - Piercing: cambiar colisión de collide a overlap
    - Orbitals: crear nuevo orbital (ver T11)

  **Must NOT do**:
  - NO mostrar estadísticas numéricas detalladas en tarjetas (solo nombre + descripción breve)
  - NO animaciones complejas de tarjetas (solo hover scale 1.1)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - Reason: Sistema complejo con múltiples efectos interconectados

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T7, T8, T9, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T4, T7, T9

  **References**:
  - Phaser Time: https://photonstorm.github.io/phaser3-docs/Phaser.Time.Clock.html
  - Phaser Container: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Container.html

  **Acceptance Criteria**:
  - [ ] Al subir de nivel, gameplay se pausa y aparece menú de 3 upgrades
  - [ ] Click en upgrade lo aplica correctamente
  - [ ] Menú cierra y gameplay reanuda
  - [ ] Cada upgrade tiene efecto visible (más proyectiles, más daño, etc.)
  - [ ] Piercing solo aparece una vez
  - [ ] Reproduce sonido de level up

  **QA Scenarios**:
  ```
  Scenario: Menú de upgrades aparece y funciona
    Tool: Playwright
    Steps:
      1. Abrir juego, Play
      2. En console: `window.xpSystem.addXP(9999)` para forzar level up
      3. Screenshot del menú de upgrades
      4. Click en primera tarjeta
      5. Screenshot tras cerrar menú
    Expected Result: Menú muestra 3 opciones, al elegir una el juego continúa
    Evidence: .sisyphus/evidence/t10-upgrade-menu.png

  Scenario: Multi-shot incrementa proyectiles
    Tool: Playwright + Browser Console
    Steps:
      1. Elegir Multi-shot
      2. Esperar siguiente disparo
      3. Contar proyectiles en screenshot
    Expected Result: Hay 5 proyectiles (4 base + 1 upgrade)
    Evidence: .sisyphus/evidence/t10-multishot-upgrade.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T11. Orbitals (Bolitas Girando alrededor del Jugador)**

  **What to do**:
  - Crear `src/entities/Orbital.ts` extendiendo Phaser.Physics.Arcade.Sprite
  - Cada orbital:
    - Sprite: 'orbital' (círculo azul claro)
    - Orbita alrededor del jugador en radio fijo (60px)
    - Velocidad angular: 180°/segundo (2 segundos por vuelta completa)
    - Daño: 15 por contacto (cada 500ms por enemigo, para evitar insta-kill)
    - Si múltiples orbitals: distribuidos equitativamente en el círculo (ej: 2 orbitals = opuestos, 3 = 120° aparte)
    - Tamaño: 20x20px
  - Actualización en `update()`:
    - Calcular ángulo basado en tiempo: `angle = baseAngle + time * angularSpeed`
    - Posición: `player.x + cos(angle) * radius`, `player.y + sin(angle) * radius`
  - Colisiones: overlap con enemigos → daño → cooldown de 500ms por enemigo/orbital

  **Must NOT do**:
  - NO hacer que los orbitales collisionen entre sí
  - NO aplicar física a los orbitales (posición manual, no velocity)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Matemática circular simple

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T7, T8, T9, T10, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T4

  **References**:
  - Phaser Math: https://photonstorm.github.io/phaser3-docs/Phaser.Math.html

  **Acceptance Criteria**:
  - [ ] Orbitals giran alrededor del jugador
  - [ ] Dañan enemigos al tocarlos
  - [ ] Cooldown de 500ms entre daños al mismo enemigo
  - [ ] Múltiples orbitals distribuidos equitativamente
  - [ ] Siguen al jugador al moverse

  **QA Scenarios**:
  ```
  Scenario: Orbitals funcionan
    Tool: Playwright + Browser Console
    Steps:
      1. En console: `window.player.upgrades.orbitals = 2`
      2. Esperar 2s
      3. Screenshot
    Expected Result: 2 círculos azules girando alrededor del jugador
    Evidence: .sisyphus/evidence/t11-orbitals.png
  ```

  **Commit**: GROUP with Wave 2

- [x] **T12. Cámara y Mundo (Bounds + Follow)**

  **What to do**:
  - Configurar mundo en GameScene:
    - Tamaño: 1600x1200 (2x la pantalla visible)
    - Bounds: (0, 0) a (1600, 1200)
  - Cámara:
    - Follow al jugador con suavizado (lerp: 0.1)
    - Deadzone: pequeña (20x20) para no moverse con micro-movimientos
    - Límites: no mostrar fuera del mundo (setBounds)
    - Background: color `#2a1f1d` (tierra oscura medieval)
  - Visual del mundo:
    - Grid sutil (líneas gris oscuro `#3d2f2b` cada 100px) para dar sensación de movimiento
    - Bordes del mundo: líneas de "pared" (rectángulos marrones)
  - Enemy spawn: usar bounds del mundo para calcular posiciones de borde

  **Must NOT do**:
  - NO agregar decoraciones complejas (árboles, rocas, etc.)
  - NO múltiples capas de parallax

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Phaser camera básico

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T6, T7, T8, T9, T10, T11)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T4

  **References**:
  - Phaser Camera: https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html

  **Acceptance Criteria**:
  - [ ] Cámara sigue al jugador suavemente
  - [ ] Jugador no puede salir de los bounds del mundo
  - [ ] Grid visible en fondo
  - [ ] Bordes del mundo visibles
  - [ ] Enemigos spawnean en bordes del mundo

  **QA Scenarios**:
  ```
  Scenario: Cámara sigue al jugador
    Tool: Playwright
    Steps:
      1. Abrir juego, Play
      2. Mover jugador hacia la derecha durante 3s
      3. Screenshot
    Expected Result: Cámara se desplazó, jugador sigue centrado (o cerca)
    Evidence: .sisyphus/evidence/t12-camera-follow.png
  ```

  **Commit**: GROUP with Wave 2

- [ ] **T13. Game Loop Completo (Waves, Dificultad Progresiva)**

  **What to do**:
  - Integrar TODOS los sistemas en GameScene:
    - Inicializar: Player, ShootingSystem, SpawnSystem, XPSystem, UpgradeSystem, AudioSystem
    - Setup colisiones: Projectile-Enemy, Player-Enemy, Player-Coin, Orbital-Enemy
    - Game loop en `update(time, delta)`:
      1. Actualizar player (input, movimiento)
      2. Actualizar shooting system (timer)
      3. Actualizar spawn system (timer + dificultad)
      4. Actualizar XP system (magnetismo monedas)
      5. Actualizar orbitals (posición circular)
      6. Regenerar HP si tiene upgrade (cada 1s)
      7. Actualizar timer de supervivencia
      8. Actualizar HUD
  - Dificultad progresiva:
    - Cada 30s: aumentar chance de enemigos avanzados
    - Cada 30s: reducir spawn interval en 10%
    - Cada 60s: aumentar HP de enemigos base en 10%
  - Score en tiempo real: `kills * 10 + time_seconds * 2 + level * 50`
  - Game Over: al HP <= 0 → guardar score → transicionar a GameOverScene

  **Must NOT do**:
  - NO agregar bosses o mini-bosses
  - NO agregar eventos especiales (duplicar XP, etc.)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
  - Reason: Integración de múltiples sistemas complejos

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T14)
  - **Parallel Group**: Wave 3
  - **Blocks**: T15, T18
  - **Blocked By**: T6, T7, T8, T9, T10, T11, T12

  **Acceptance Criteria**:
  - [ ] Todos los sistemas funcionan juntos sin errores
  - [ ] Jugador se mueve, dispara, mata, recolecta XP, sube nivel
  - [ ] Dificultad aumenta con el tiempo
  - [ ] Score se calcula correctamente
  - [ ] Al morir, transiciona a GameOverScene

  **QA Scenarios**:
  ```
  Scenario: Gameplay completo funciona
    Tool: Playwright
    Steps:
      1. Abrir juego, Play, ingresar nombre
      2. Jugar durante 30s (mover, matar, subir nivel)
      3. Screenshot durante gameplay
      4. Morir (dejar que enemigos ataquen)
      5. Screenshot GameOver
    Expected Result: Todo el loop funciona: movimiento, disparo, XP, level up, muerte
    Evidence: .sisyphus/evidence/t13-full-gameplay.png
  ```

  **Commit**: GROUP with Wave 3

- [ ] **T14. Pantalla Menu (Username Input + Play Button)**

  **What to do**:
  - Completar `src/scenes/MenuScene.ts`:
    - Fondo: color `#2a1f1d` con grid sutil
    - Título "Knight Survivor": texto grande (48px), color dorado `#c9b037`, centrado arriba
    - Subtítulo: "Survive the Dungeon" (24px), color gris claro, debajo del título
    - Input de username:
      - HTML input element (DOMElement de Phaser) o overlay HTML
      - Placeholder: "Enter your name..."
      - Estilo: fondo `#3d2f2b`, borde `#8b4513`, texto blanco, padding 10px
      - Centrado en pantalla
      - Max length: 20 caracteres
      - Required: no permite Play si está vacío
    - Botón Play:
      - Sprite: rectángulo marrón `#8b4513` con borde `#654321`
      - Texto: "PLAY" (24px, blanco, centrado)
      - Hover: cambiar a `#a0522d`
      - Click: validar username → guardar en `this.registry.set('username', value)` → reproducir click sound → iniciar GameScene
    - Tabla de rankings preview:
      - Debajo del botón Play
      - Mostrar top 5 scores de Supabase
      - Título "Top Knights" (18px, dorado)
      - Lista: `#rank. Name - Score - Time`
      - Actualizar cada 10s
    - Decoración medieval:
      - Líneas decorativas doradas arriba y abajo del título
      - Esquinas con pequeños ornamentos (sprites de esquina)

  **Must NOT do**:
  - NO agregar settings, controls, o créditos
  - NO hacer el menú responsive (solo desktop 800x600)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Diseño de UI medieval con Phaser

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T13, T15, T16, T17)
  - **Parallel Group**: Wave 3
  - **Blocks**: T18
  - **Blocked By**: T4

  **Acceptance Criteria**:
  - [ ] Menú muestra título, input, botón Play, y rankings
  - [ ] Input acepta texto y valida no vacío
  - [ ] Click en Play guarda username e inicia juego
  - [ ] Rankings se cargan de Supabase
  - [ ] Estilo visual es medieval coherente

  **QA Scenarios**:
  ```
  Scenario: Menu completo renderiza
    Tool: Playwright
    Steps:
      1. Abrir http://localhost:5173
      2. Esperar BootScene
      3. Screenshot completo de MenuScene
    Expected Result: Título dorado, input centrado, botón Play, rankings visibles
    Evidence: .sisyphus/evidence/t14-menu-screenshot.png

  Scenario: Username vacío bloquea Play
    Tool: Playwright
    Steps:
      1. Click Play sin llenar input
    Expected Result: No cambia de escena, input muestra borde rojo o alert
    Evidence: .sisyphus/evidence/t14-empty-username-block.png
  ```

  **Commit**: GROUP with Wave 3

- [ ] **T15. HUD (Timer Prominente Arriba + HP + Nivel + Kills)**

  **What to do**:
  - Crear `src/ui/HUD.ts` (container de Phaser)
  - Timer de supervivencia (PRINCIPAL, arriba centrado):
    - Texto: "⏱️ 01:23" (formato MM:SS)
    - Posición: centro arriba (x=400, y=30)
    - Estilo: 32px, color dorado `#ffd700`, stroke negro 4px
    - Fondo: rectángulo semitransparente `#000000` (alpha 0.5) detrás del texto
    - Actualización: cada segundo de tiempo de juego
  - Barra de HP (abajo izquierda):
    - Fondo: rectángulo rojo oscuro `#8b0000` (100x12px)
    - Fill: rectángulo rojo `#ff0000` proporcional al HP actual
    - Texto: "HP: 100/100" (14px, blanco)
    - Posición: x=20, y=560
  - Nivel (abajo centro):
    - Texto: "Lvl: 1" (16px, dorado)
    - Posición: x=400, y=560
  - Kills (abajo derecha):
    - Texto: "⚔️ 0" (16px, blanco)
    - Posición: x=760, y=560
  - XP Bar (arriba de HP bar):
    - Fondo: rectángulo gris oscuro (100x6px)
    - Fill: rectángulo dorado `#ffd700` proporcional al XP
    - Posición: x=20, y=550
  - Score (arriba derecha):
    - Texto: "Score: 0" (14px, blanco)
    - Posición: x=760, y=30
  - Actualización: en cada frame de update(), leer datos del player/game state

  **Must NOT do**:
  - NO mini-map
  - NO buff icons o indicadores de estado complejos
  - NO animaciones en el HUD (solo actualización de valores)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Diseño de UI con Phaser Text y Graphics

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T13, T14, T16, T17)
  - **Parallel Group**: Wave 3
  - **Blocks**: T16, T18
  - **Blocked By**: T13

  **Acceptance Criteria**:
  - [ ] Timer muestra tiempo en formato MM:SS
  - [ ] HP bar se actualiza al recibir daño
  - [ ] Nivel se actualiza al subir
  - [ ] Kills se actualiza al matar enemigos
  - [ ] XP bar muestra progreso al siguiente nivel
  - [ ] Score se calcula y muestra en tiempo real

  **QA Scenarios**:
  ```
  Scenario: HUD muestra todos los datos
    Tool: Playwright
    Steps:
      1. Abrir juego, Play
      2. Jugar durante 30s
      3. Screenshot del HUD
    Expected Result: Timer, HP bar, XP bar, nivel, kills, score visibles y actualizados
    Evidence: .sisyphus/evidence/t15-hud-visible.png
  ```

  **Commit**: GROUP with Wave 3

- [ ] **T16. Pantalla Game Over (Score + Ranking + Retry)**

  **What to do**:
  - Completar `src/scenes/GameOverScene.ts`:
    - Fondo: color `#2a1f1d` semitransparente (alpha 0.9) sobre último frame
    - Título "YOU DIED" (48px, rojo `#ff0000`, centrado)
    - Subtítulo: "The dungeon claims another soul..." (18px, gris)
    - Stats del run:
      - Time Survived: "⏱️ 01:45" (24px, dorado)
      - Level Reached: "Lvl: 8" (20px, blanco)
      - Kills: "⚔️ 42" (20px, blanco)
      - Score: "🏆 850" (28px, dorado, **destacado**)
    - Botones:
      - "TRY AGAIN" (Play de nuevo): rectángulo marrón, hover `#a0522d` → reinicia GameScene
      - "MENU" (Volver al menú): rectángulo gris, hover → MenuScene
    - Tabla de rankings:
      - Título "Hall of Knights" (20px, dorado)
      - Top 10 de Supabase
      - Destacar al jugador actual con fondo dorado semitransparente
      - Formato: `#rank | Name | Score | Time`
    - Guardar score:
      - Llamar `saveRanking()` con datos del run
      - Mostrar spinner mientras guarda
      - Mostrar "✓ Saved!" al completar
      - Si falla: mostrar "Offline - score not saved" en gris

  **Must NOT do**:
  - NO agregar compartir en redes sociales
  - NO agregar pantalla de logros

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: UI de Game Over con integración de datos

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T13, T14, T15, T17)
  - **Parallel Group**: Wave 3
  - **Blocks**: T18
  - **Blocked By**: T13, T15

  **Acceptance Criteria**:
  - [ ] Muestra stats del run correctos
  - [ ] Score se guarda en Supabase
  - [ ] Rankings se muestran y actualizan
  - [ ] Botón Try Again reinicia juego
  - [ ] Botón Menu vuelve al inicio
  - [ ] Jugador actual destacado en rankings

  **QA Scenarios**:
  ```
  Scenario: Game Over guarda score y muestra rankings
    Tool: Playwright
    Steps:
      1. Jugar hasta morir
      2. Screenshot GameOverScene
      3. Verificar que score aparece
      4. Click "TRY AGAIN"
      5. Verificar que reinicia GameScene
    Expected Result: Stats correctos, score guardado, botones funcionan
    Evidence: .sisyphus/evidence/t16-gameover.png
  ```

  **Commit**: GROUP with Wave 3

- [ ] **T17. Integración Supabase (Guardar/Ver Rankings)**

  **What to do**:
  - Integrar `src/api/supabase.ts` en GameOverScene:
    - Al morir: construir objeto Ranking y llamar `saveRanking()`
    - Mostrar loading state mientras guarda
    - Manejar errores (network, Supabase down)
  - Integrar en MenuScene:
    - Al entrar: llamar `getTopRankings(5)`
    - Mostrar lista de rankings
    - Auto-refresh cada 10s
  - Variables de entorno:
    - Crear `.env` con credenciales reales de Supabase (el usuario debe proveerlas)
    - `.env.example` ya existe, documentar que necesitan crear `.env`
  - Validación:
    - Username: máximo 20 caracteres, no vacío
    - Score: número entero positivo
    - Time: segundos enteros

  **Must NOT do**:
  - NO implementar rate limiting (Supabase maneja eso)
  - NO validar duplicados (permitir mismo nombre múltiples scores)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Integración de API ya creada

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T13, T14, T15, T16)
  - **Parallel Group**: Wave 3
  - **Blocks**: T18, T20
  - **Blocked By**: T5, T16

  **Acceptance Criteria**:
  - [ ] Score se guarda correctamente en Supabase
  - [ ] Rankings se cargan y muestran en Menu y GameOver
  - [ ] Manejo de errores (offline, API falla)
  - [ ] Datos validados antes de enviar

  **QA Scenarios**:
  ```
  Scenario: Score se guarda y aparece en rankings
    Tool: Playwright + Bash (curl)
    Steps:
      1. Jugar, morir
      2. En terminal: curl rankings de Supabase
      3. Verificar que el nuevo score aparece
    Expected Result: POST retorna 201, GET incluye el nuevo registro
    Evidence: .sisyphus/evidence/t17-ranking-saved.png
  ```

  **Commit**: GROUP with Wave 3

- [ ] **T18. Balance Tuning (Stats, Spawn Rates, XP Curve)**

  **What to do**:
  - Ajustar parámetros del juego para que sea divertido y desafiante:
    - **Player**: HP 100, Speed 200, baseDamage 25, baseCooldown 1000ms, pickupRadius 100
    - **Enemies**:
      - Basic: HP 50, Speed 100, Damage 10, XP 10
      - Fast: HP 25, Speed 180, Damage 5, XP 15
      - Tank: HP 150, Speed 60, Damage 20, XP 25
      - Shooter: HP 40, Speed 80, Damage 15, XP 20
    - **Spawn**: baseInterval 2000ms, minInterval 500ms, maxEnemies 60
    - **XP**: baseXP 100, formula `100 * (level ^ 1.5)`
    - **Upgrades**:
      - Damage: +10 por nivel
      - Attack Speed: -10% cooldown (min 200ms)
      - Max HP: +20 HP y heal +20
      - HP Regen: +2 HP/s
      - Multi-shot: +1 proyectil
      - Piercing: toggle (una vez)
      - Orbitals: +1 orbital, damage 15, radius 60px
    - **Dificultad**: cada 30s -10% spawnInterval, +10% enemyHP
  - Probar en gameplay real y ajustar si es muy fácil/difícil
  - Tiempo objetivo de supervivencia para jugador promedio: 2-3 minutos

  **Must NOT do**:
  - NO cambiar mecánicas (solo números)
  - NO agregar nuevos tipos de enemigos o upgrades

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: []
  - Reason: Ajuste de números basado en testing

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T19)
  - **Parallel Group**: Wave 4
  - **Blocks**: T20
  - **Blocked By**: T13-T17

  **Acceptance Criteria**:
  - [ ] Jugador promedio sobrevive 2-3 minutos
  - [ ] Upgrades se sienten impactantes
  - [ ] Dificultad rampa suavemente
  - [ ] No hay momentos de aburrimiento ni de imposibilidad súbita

  **QA Scenarios**:
  ```
  Scenario: Balance permite gameplay satisfactorio
    Tool: Playwright
    Steps:
      1. Jugar 3 veces
      2. Anotar tiempo de supervivencia promedio
    Expected Result: Tiempo entre 2-4 minutos
    Evidence: .sisyphus/evidence/t18-balance-test.txt
  ```

  **Commit**: GROUP with Wave 4

- [ ] **T19. Configuración Deploy Vercel**

  **What to do**:
  - Configurar `vite.config.ts` para static export:
    ```typescript
    export default defineConfig({
      base: './',
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
      }
    });
    ```
  - Crear `vercel.json`:
    ```json
    {
      "version": 2,
      "routes": [
        { "handle": "filesystem" },
        { "src": "/.*", "dest": "/index.html" }
      ]
    }
    ```
  - Asegurar que `index.html` referencia `src/main.ts` correctamente
  - Verificar que variables de entorno `.env` se lean correctamente (usar `import.meta.env`)
  - Build local: `npm run build` debe generar `dist/` sin errores
  - Incluir instrucciones para deploy:
    - Instalar Vercel CLI: `npm i -g vercel`
    - Login: `vercel login`
    - Deploy: `vercel --prod`

  **Must NOT do**:
  - NO configurar CI/CD automático (fuera de scope para 3h)
  - NO optimizar imágenes (no hay imágenes)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Config de deploy estándar

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T18)
  - **Parallel Group**: Wave 4
  - **Blocks**: T20
  - **Blocked By**: None (puede hacerse en paralelo)

  **Acceptance Criteria**:
  - [ ] `npm run build` genera `dist/` sin errores
  - [ ] `dist/index.html` abre correctamente en navegador
  - [ ] No hay errores 404 de assets
  - [ ] Juego funciona igual que en dev

  **QA Scenarios**:
  ```
  Scenario: Build estático funciona
    Tool: Bash
    Steps:
      1. npm run build
      2. npx serve dist
      3. curl http://localhost:3000
    Expected Result: HTML carga, no errores 404
    Evidence: .sisyphus/evidence/t19-build-success.txt
  ```

  **Commit**: GROUP with Wave 4

- [ ] **T20. Build y Deploy Final**

  **What to do**:
  - Build final: `npm run build`
  - Verificar que `dist/` contiene:
    - `index.html`
    - `assets/` (JS bundle, source maps)
  - Deploy a Vercel:
    - `vercel --prod`
    - Obtener URL pública
  - Verificar deploy:
    - Abrir URL en navegador
    - Testear flujo completo: Menu → Gameplay → Game Over → Retry
    - Verificar que Supabase funciona en producción
  - Documentar URL en plan

  **Must NOT do**:
  - NO deployar sin verificar que funciona localmente
  - NO compartir credenciales de Supabase en código

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Deploy simple

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: F1-F4
  - **Blocked By**: T17-T19

  **Acceptance Criteria**:
  - [ ] Juego deployado y accesible públicamente
  - [ ] URL funcional en navegador
  - [ ] Supabase funciona en producción
  - [ ] No hay errores en consola del navegador en producción

  **QA Scenarios**:
  ```
  Scenario: Deploy funcional
    Tool: Bash (curl)
    Steps:
      1. curl -s https://knight-survivor.vercel.app | head -20
    Expected Result: Retorna HTML válido, status 200
    Evidence: .sisyphus/evidence/t20-deploy-verification.txt
  ```

  **Commit**: GROUP with Wave 4

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + build. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty username, rapid deaths, max upgrades. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat: initial setup with Vite + Phaser + medieval sprites`
- **Wave 2**: `feat: core gameplay - player, shooting, enemies, XP, upgrades`
- **Wave 3**: `feat: UI screens, HUD, Supabase integration`
- **Wave 4**: `feat: balance tuning and Vercel deploy`

---

## Success Criteria

### Verification Commands
```bash
# Build
cd knight-survivor && npm run build

# Preview local
npm run preview

# Test Supabase connection
curl "$SUPABASE_URL/rest/v1/rankings?select=*&order=score.desc&limit=10" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

### Final Checklist
- [ ] Juego abre en navegador sin errores
- [ ] Pantalla de inicio muestra input de username + botón Play
- [ ] Timer de supervivencia visible arriba durante gameplay
- [ ] Jugador se mueve con WASD
- [ ] Disparo automático en 360° funciona
- [ ] Enemigos spawnean y se mueven hacia jugador
- [ ] XP/monedas funcionan y suben de nivel
- [ ] Menú de upgrades aparece con 3 opciones
- [ ] Score se guarda en Supabase
- [ ] Ranking global es visible
- [ ] Deployado en Vercel con URL pública

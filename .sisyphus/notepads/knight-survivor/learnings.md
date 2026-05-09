# Learnings - Knight Survivor

## 2026-05-09 - T1 Root Project State
Root project files verified and functional:
- `package.json` - vite, typescript, phaser, @supabase/supabase-js
- `vite.config.ts` - base: './', outDir: 'dist'
- `tsconfig.json` - ES2020, ESNext, strict, types: ["vite/client"]
- `index.html` - game-container div, 800x600 canvas target
- `src/main.ts` - BootScene with proof-of-life graphics and text
- `.env.example` - Supabase URL and anon key placeholders

Verification commands used:
- `npm install` - 0 vulnerabilities, 27 packages
- `npm run build` - tsc + vite build, success, dist/ generated
- `npm run dev` - Vite v6.4.2 on http://localhost:5173
- Playwright screenshot captured at `.sisyphus/evidence/t1-project-runs.png`

Cleanup performed:
- Removed accidental nested `knight-survivor/` directory (contained its own node_modules, dist, package.json).
T1 must remain at repository root only.

## 2026-05-09 - T2 Sprite Generation
`src/scenes/BootScene.ts` now generates Phaser textures for player, 4 enemy types, projectile, coin, orbital, and wood button.
Verification passed with `npm run build`; Playwright confirmed one 800x600 canvas and screenshot evidence at `.sisyphus/evidence/t2-sprites-generated.png`.
Browser console only showed a favicon 404; no missing texture errors.

## 2026-05-09 - T5 Supabase Client and Ranking API

Files created:
- `src/types/ranking.ts` - `Ranking` interface, `NewRanking` insert type, `RANKINGS_TABLE_SQL` schema string
- `src/api/supabase.ts` - Supabase client helper (`supabase`), `RankingError` typed error, `saveRanking()`, `getTopRankings()`

Design decisions:
- Client initialized lazily at module load from `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `supabase` exported as `SupabaseClient | null` so callers can check presence
- Graceful degradation: `getTopRankings` returns `[]` if config missing or any fetch error
- `saveRanking` throws `RankingError` (typed) on missing config or validation failure; caller can catch if awaited
- Input validation: name trimmed and capped at 20 chars; all numeric fields validated as finite non-negative integers
- No `as any`, `@ts-ignore`, empty catches, or `console.log` used
- Response data mapped with runtime `typeof` checks instead of type assertions

Build verification: `npm run build` passed (tsc + vite build success)

Outstanding: Supabase table must be created manually with the provided `RANKINGS_TABLE_SQL` when credentials are available.

## 2026-05-09 - T3 AudioSystem Implementation
`src/systems/AudioSystem.ts` created with Web Audio API medieval SFX:
- Exported `AudioSystem` class with methods: `resume()`, `playShoot()`, `playHit()`, `playCoin()`, `playLevelUp()`, `playGameOver()`
- Lazy AudioContext initialization: no eager creation in constructor; created on first `resume()` or play call
- Safari compatibility: `window.webkitAudioContext` declared via `declare global` interface augmentation (no `as any`)
- Graceful degradation: all play methods no-op if AudioContext unavailable; no exceptions thrown
- SFX specs implemented:
  - Shoot: square wave 800Hz→400Hz, 0.1s
  - Hit: white noise through lowpass filter, 0.15s
  - Coin: sine wave 1200Hz→1800Hz, 0.2s
  - LevelUp: sawtooth arpeggio 400→600→800Hz over 0.5s
  - GameOver: sine descending 400Hz→100Hz over 1s
- Build: `npm run build` passes (tsc + vite build successful)
- Anti-pattern scan: no `as any`, `@ts-ignore`, `@ts-expect-error`, empty catches, TODO/FIXME/HACK/xxx, or `console.log` found


## 2026-05-09 - T4 Scene Structure (Boot -> Menu -> Game -> GameOver)

Files verified/confirmed:
- `src/scenes/BootScene.ts` - Generates all T2 textures, shows boot screen, auto-transitions to MenuScene after 800ms
- `src/scenes/MenuScene.ts` - Title "Knight Survivor", DOM username input (maxlength 20), Play button with validation
- `src/scenes/GameScene.ts` - Placeholder showing "Game Running", username from registry, temporary `G` key shortcut to GameOverScene
- `src/scenes/GameOverScene.ts` - Shows score, time, level, kills; Retry button (-> GameScene), Menu button (-> MenuScene)
- `src/main.ts` - Registers all 4 scenes in order: `[BootScene, MenuScene, GameScene, GameOverScene]`

Design patterns observed:
- Phaser DOM input with `pointer-events: none` wrapper + `pointer-events: auto` on input element ensures canvas events don't interfere
- Username validation: trim + slice(0, 20) before storing in registry; empty input shows visible "Enter username" error with tween flash
- `AudioSystem.resume()` called on Play click to satisfy browser autoplay policy
- Scene data passed via `this.scene.start('GameOverScene', { score, timeSurvived, level, kills })`
- Button hover effects use `setTint()` / `clearTint()` on the wood button texture

Anti-pattern scan: no `as any`, `@ts-ignore`, `console.log`, TODO/FIXME/HACK/xxx found in any scene file.

Build verification: `npm run build` passes (tsc + vite build success)

## T5 Verification Fix
- Converted type-only imports (SupabaseClient, NewRanking, Ranking) to use import type /	type import modifier
- LSP diagnostics on src/api/supabase.ts: zero warnings/errors
- 
pm run build: passes
- No anti-patterns detected



## 2026-05-09 - T6 Player Entity Implementation

Files created:
- src/entities/Player.ts - Player class extending Phaser.Physics.Arcade.Sprite`
Implementation details:
- Constructor accepts (scene, x, y, onHit?) where onHit is an optional callback invoked on damage
- Stats: hp/maxHp = 100, speed = 200 px/s; all properties are public for integration
- Keyboard input: WASD + Arrow keys using Phaser.Input.Keyboard.KeyCodes; normalized diagonal movement
- HP bar: Two Phaser.GameObjects.Graphics objects (hpBarBg, hpBarFill) drawn above sprite
  - Width: 32px, height: 4px, offset: 22px above sprite center
  - Color transitions: green (>50%), yellow (>25%), red (<=25%)
- Damage flash: 	his.scene.tweens.add() with alpha 0.5 for 100ms, yoyo once
- Death event: scene.events.emit('player-death') emitted exactly once via isDead guard
- Bounds clamping: Phaser.Math.Clamp to world size 1600x1200, accounting for sprite half-width/height
- Public methods: 	akeDamage(amount), heal(amount), update(), getHealthRatio(): number`
- destroy() overridden to clean up HP bar graphics before calling super.destroy()`
Design decisions:
- Optional onHit callback provided instead of direct AudioSystem dependency to keep Player decoupled
- update() is idempotent and safe to call every frame; early returns if dead
- Velocity set to zero on death to prevent post-death sliding

Build verification: 
pm run build passes (tsc + vite build success)
Anti-pattern scan: no s any, @ts-ignore, console.log, or unused variables found.

## 2026-05-09 - T7 Omnidirectional Shooting System

Files created:
- `src/entities/Projectile.ts`
- `src/systems/ShootingSystem.ts`

Implementation notes:
- `Projectile` extends `Phaser.Physics.Arcade.Sprite` and stores typed fire config state for damage, piercing count, lifetime, rotation, and velocity.
- `Projectile.fire()` uses radians directly with `scene.physics.velocityFromRotation()` so evenly spaced 360° volleys stay mathematically correct for any projectile count.
- Projectile pooling is handled inside `ShootingSystem.acquireProjectile()` by reusing inactive `Projectile` instances from the provided Arcade group before allocating new ones.
- `ShootingSystem` constructor accepts `scene`, `projectileGroup`, `getPlayerPosition`, and optional `onShoot` callback so scene/audio integration stays decoupled.
- Base defaults match plan: 4 projectiles, 1000ms cooldown, 400 speed, 25 damage, 2000ms lifetime.
- Upgrade inputs supported via exported interfaces: `multishot`, `attackSpeed`, `damage`, `piercing`, plus direct overrides for cooldown/count/speed/lifetime.
- `update(time, enemies?)` is integration-friendly and currently ignores `enemies` until T13 wires collisions.
- Anti-pattern scan on the new files found no `any`, `@ts-ignore`, `@ts-expect-error`, `console.log`, `TODO`, `FIXME`, or `HACK`.

Verification notes:
- `lsp_diagnostics` is clean for both new files.
- `npm run build` is currently blocked by pre-existing unrelated code in `src/systems/SpawnSystem.ts:88` (`Group.children.each` callback returns `void` instead of `boolean | null`).


## 2026-05-09 - T12 World System (Camera + Bounds + Grid + Borders)

Files created:
- src/systems/WorldSystem.ts - Pure helper module with world constants and visual setup functions

Implementation details:
- WORLD_WIDTH = 1600, WORLD_HEIGHT = 1200, WORLD_BACKGROUND_COLOR = 0x2a1f1d exported as constants
- setupWorld(scene, player?) configures:
  - Physics world bounds: (0, 0) to (1600, 1200)
  - Camera bounds matching world bounds
  - Camera background color to medieval earth tone
  - If player provided: startFollow with lerp 0.1 on both axes, deadzone 20x20
- drawWorldBackground(scene) returns Graphics object with:
  - Subtle grid lines every 100px using color #3d2f2b at 60% alpha
  - Brown border (#8b4513) 4px thick around world perimeter
  - Set to depth -1 so grid renders behind all game objects

Design decisions:
- Pure functions (not a class) since world setup is one-time configuration
- Graphics object returned so caller can store reference if needed for cleanup
- Player parameter optional so setupWorld can be called before player exists
- Grid uses lineBetween for performance (avoids complex paths)

Build verification: npm run build passes (tsc + vite build success)
Anti-pattern scan: no as any, @ts-ignore, console.log, or unused variables found.


## 2026-05-09 - T11 Orbital Entity

Files created:
- `src/entities/Orbital.ts` - Orbital class extending Phaser.Physics.Arcade.Sprite

Implementation details:
- Constructor accepts (scene, getPlayerPosition, index, totalCount)
- `getPlayerPosition` is a callback returning `Phaser.Types.Math.Vector2Like` for loose coupling
- Orbit radius: 60px, angular speed: 180 deg/s (π rad/s), damage: 15, cooldown: 500ms per enemy
- `setOrbitSlot(index, total)` evenly distributes orbitals by setting base angle offset = (2π * index) / total
- `update(time)` computes delta from last frame time, advances angle, and manually sets position via `setPosition(x, y)`
- `canDamage(enemy)` checks `enemy.active` and 500ms cooldown via WeakMap
- `registerDamage(enemy)` records `scene.time.now` in WeakMap
- Physics body configured as immovable circle (radius 8) with gravity disabled for overlap detection
- No velocity used; all movement is manual position update

Design decisions:
- WeakMap<Enemy, number> for cooldown tracking: automatically releases entries when Enemy instances are garbage collected
- `import type { Enemy }` used since Enemy is only a type parameter and method argument type
- `lastUpdateTime` initialized to 0 with fallback delta of 16.667ms on first frame to avoid jump
- Body set to `setCircle(8)` for consistent circular hit detection regardless of sprite dimensions

Build verification: `npm run build` passes, `lsp_diagnostics` clean on Orbital.ts
Anti-pattern scan: no `as any`, `@ts-ignore`, `console.log`, TODO/FIXME/HACK/xxx found


## T10 - Sistema de Upgrades (7 Tipos + UI Seleccion)

### What was built
- src/systems/UpgradeSystem.ts: Core upgrade logic with 7 upgrade types
- src/ui/UpgradeMenu.ts: Phaser-based UI for upgrade selection

### Patterns Used
- UpgradeSystem uses a functional approach with exported functions (applyUpgrade, pickRandomUpgrades, getAvailableUpgrades)
- Upgrade definitions are declarative arrays with apply callbacks
- Upgrades interface exactly matches plan spec: damage, attackSpeed, maxHp, hpRegen, multiShot, piercing, orbitals
- UpgradeMenu extends Phaser.GameObjects.Container for scene integration

## 2026-05-09 - HUD + Returning Arrow Integration (post-T13 MVP patch)
- `src/scenes/GameScene.ts` now instantiates `HUD` and updates it every frame with live game state (time, difficulty stage, HP, XP, level, kills, score, upgrades).
- Added `returningArrows` physics group with manual `update(time, delta)` iteration (not `runChildUpdate: true` because `ReturningArrow.update()` is a custom method, not `preUpdate`).
- Returning arrow-enemy overlap follows the same pattern as orbital-enemy: `canDamage()` guard, `registerDamage()`, then `enemy.takeDamage()`; kills route through `handleEnemyDefeated()` for coin drops and score.
- `UpgradeContext` extended with `onReturningArrowAdded` callback; `UpgradeSystem.returningArrows` definition now invokes it on each selection.
- HUD powerup markers updated to include `returningArrows` (label "RAR"); `Upgrades` interface already had the field from the separate arrow task.
- Difficulty stage is computed from survival time: `Math.floor(survivalTimeMs / 30000) + 1`, matching the spawn system's 30s difficulty steps.
- Build passes cleanly; no `as any`, `@ts-ignore`, `console.log`, TODO/FIXME/HACK/xxx found in touched files.

## 2026-05-09 - T13 Full Game Loop Integration
- `src/scenes/GameScene.ts` now owns the full runtime loop: world setup, Player, AudioSystem, ShootingSystem, SpawnSystem, XPSystem, upgrade flow, orbitals, collisions, score calculation, and GameOver transition.
- XP coin pickup still works without a physics overlap because `XPSystem.update()` drives coin magnet + pickup by distance each frame.
- Upgrade pauses should freeze progression with `physics.world.pause()` plus a scene-level `loopPaused` guard; only skipping `update()` is not enough because Arcade velocities keep simulating otherwise.
- HP regen from `applyHpRegenTick()` needs an external accumulator; calling it every frame with ~16ms deltas never heals due to integer flooring.
- QA globals exposed on `window` (`gameScene`, `xpSystem`, `player`) made Playwright smoke validation possible without adding debug UI.
- Verification: `npm run build` passed and Playwright captured `.sisyphus/evidence/t13-full-gameplay.png` with active player/enemy/projectile state.
- Cards use Phaser graphics + text with interactive hit areas
- Hover effect uses Phaser tweens for smooth scale animation (1.0 -> 1.1)

### Integration Notes for T13
- UpgradeContext requires: player (Player), shootingSystem (ShootingSystem), optional onOrbitalAdded callback
- Pause/resume is handled via optional onPause/onResume callbacks in UpgradeMenuConfig
- Audio level-up sound via optional audioLevelUp callback
- HP regen is passive: call applyHpRegenTick(player, upgrades, deltaMs) from game loop
- Piercing is a boolean toggle in Upgrades but maps to numeric piercing count (50) in ShootingSystem


## 2026-05-09 - T9 Sistema de XP (Monedas + Leveling)

Files created:
- `src/entities/Coin.ts` - Coin class extending Phaser.Physics.Arcade.Sprite
- `src/systems/XPSystem.ts` - XP tracking, leveling, and coin spawning system

Implementation details:
- Coin constructor: `scene.add.existing(this); scene.physics.add.existing(this);` with `setActive(false); setVisible(false);`
- `Coin.spawn(x, y, value)` activates body and sets position + xp value
- `Coin.update(playerPosition)` handles magnetization (<=100px radius at 200 speed) and auto-pickup (<16px distance), returning xp value or null
- `Coin.deactivate()` stops velocity and calls `disableBody(true, true)` for pooling reuse
- XPSystem constructor config: scene, coinGroup, getPlayerPosition, optional onCoin/onLevelUp callbacks, optional player reference
- Level formula: `nextLevelXp = Math.floor(100 * level ** 1.5)`
- `addXP(amount)` supports multi-level jumps via while loop
- On level up: emits `'level-up'` event with new level, calls `onLevelUp` callback, grants +5 max HP to player if provided
- `spawnCoin(x, y, value)` reuses inactive coins from group pool or creates new ones
- `spawnCoinsFromEnemy(x, y, xpValue, count?)` distributes xp evenly across `count` coins with random ±12px spread
- Exposed public properties: `xp`, `level`, `nextLevelXp`, plus `getXpRatio()` and `addXP()`

Design decisions:
- Coin returns xp value directly from `update()` so XPSystem doesn't need collision callbacks for pickup detection
- `import type Phaser` used in XPSystem since Phaser only appears in type positions
- Player HP bonus applied directly via public `maxHp`/`hp` properties (no coupling beyond type import)
- Coin pooling follows same pattern as Projectile/ShootingSystem for consistency

Build verification: `npm run build` passes, `lsp_diagnostics` clean on both files
Anti-pattern scan: no `as any`, `@ts-ignore`, `console.log`, TODO/FIXME/HACK/xxx found


## 2026-05-09 - T12 Diagnostics Fix

Fixed Biome useImportType warnings in src/systems/WorldSystem.ts:
- import Phaser from 'phaser' ? import type Phaser from 'phaser'
- import { Player } from '../entities/Player' ? import type { Player } from '../entities/Player'

Both Phaser and Player are only used as type annotations in function signatures, never as runtime values.

Verification:
- LSP diagnostics on WorldSystem.ts: zero warnings/errors
- 
pm run build passes


## 2026-05-09 - T19 Configuración Deploy Vercel

Files created/updated:
- `vite.config.ts` - Added `chunkSizeWarningLimit: 1000` for Phaser bundle
- `vercel.json` - SPA rewrite rule: all routes → /index.html

Deploy settings:
- base: './' (relative paths for static hosting)
- build.outDir: 'dist'
- build.assetsDir: 'assets'
- chunkSizeWarningLimit: 1000 (Phaser ~1.5MB post-minify is expected)

Build verification:
- `npm run build` passes (tsc + vite build success)
- dist/ contains index.html + assets/index-BHSCPNPp.js
- Chunk warning appears but is expected/acceptable for Phaser

Vercel deploy commands (for T20):
- `npm run build`
- `vercel --prod` (requires Vercel CLI and login)

Evidence log: `.sisyphus/evidence/t19-build-success.txt`

## 2026-05-09 - Spawn/XP tuning patterns
- Reusing existing textures with setTint/setScale avoids asset pipeline changes for new enemy variants.
- SpawnSystem's weighted chance system makes it easy to slot in new enemy types at specific difficulty thresholds.
- Smoothing the XP exponent (1.5?1.35) has a bigger impact on early pacing than just lowering the base.

## 2026-05-09 - T15 HUD Implementation

Files created:
- `src/ui/HUD.ts` - HUD class extending `Phaser.GameObjects.Container` with typed `HUDData` interface

Implementation details:
- `HUDData` includes: timeSeconds, difficultyLevel/difficultyText, playerHp, playerMaxHp, level, xp, nextLevelXp, kills, score, upgrades (with optional arrow/returningArrow for future compatibility)
- Layout:
  - Timer (MM:SS) at top center in large gold text with black stroke and semitransparent bg
  - Difficulty stage label below timer
  - Score at top right
  - 8 compact powerup markers (DMG, SPD, HP, REG, MULT, PRC, ORB, ARR) in a centered row below difficulty; active ones show count in gold on dark bg, inactive dimmed
  - XP bar (gold fill on dark bg) bottom left, above HP bar
  - "Next powerup: X coins" text above XP bar
  - HP bar (red fill on dark red bg) bottom left with "HP: cur/max" label
  - Level at bottom center
  - Kills (⚔ icon) at bottom right
- All elements use `setScrollFactor(0)` and depth 200 so HUD stays fixed during camera follow
- No animations; pure text + rectangle updates for performance
- Powerup markers dynamically update labels and colors based on upgrade levels

Design decisions:
- Powerup markers use abbreviated 3-4 letter labels to stay compact (44px wide each)
- Future arrow upgrade supported via optional `arrow` field in HUDData.upgrades without requiring the upgrade to exist yet
- Bar widths fixed at 140px for consistent layout regardless of values

Build verification:
- `lsp_diagnostics` on HUD.ts: zero warnings/errors
- `npx tsc --noEmit` shows no errors in HUD.ts (project-wide build blocked only by pre-existing `ReturningArrow.ts` issues)
- Anti-pattern scan: no `as any`, `@ts-ignore`, `console.log`, TODO/FIXME/HACK/xxx found

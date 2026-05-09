# Decisions - Knight Survivor
## T10 - Decisions

### Piercing Implementation
- Upgrades.piercing is boolean (as per spec)
- Applied to ShootingSystem as piercing: 50 (meaning 50 additional pierces = effectively infinite for a game session)
- Alternative was piercing: 1, but 50 ensures projectiles feel truly piercing without being literally infinite (which could cause edge cases)

### Attack Speed Math
- Uses multiplicative reduction: currentCooldown * 0.9 per level
- Minimum cooldown capped at 200ms (prevents machine-gun rates that break gameplay)
- Alternative was baseCooldown * (0.9 ^ level), but the apply callback reads current stats and multiplies, achieving same result

### Damage Application
- Damage upgrade adds +10 to current projectileDamage
- This stacks with ShootingSystem base stats correctly
- Each level is independent; no cap (as per plan: no cap, stackean infinitamente)

### UpgradeMenu Design
- Uses camera dimensions for responsive positioning
- Cards centered horizontally, title at 20% height, cards at 55%
- Medieval color scheme: #3d2b1f (wood), #c9b037 (gold text), #654321 (border)

## 2026-05-09 - T13 Decisions
- Kept integration centered in `GameScene` instead of changing subsystem APIs broadly; only `GameOverScene` received a minimal compatible `username` data extension.
- Score is exposed via `GameScene.getScore()` and calculated from live state (`kills * 10 + time_seconds * 2 + level * 50`) so HUD/QA can read the same source of truth later.
- Player contact damage uses one global cooldown plus light knockback for MVP safety; this avoids instant death without introducing a more complex invulnerability/state machine system.
- Level-up handling queues upgrade selections and reopens the menu if multiple levels are earned at once, preventing dropped upgrades from large XP gains.

## 2026-05-09 - Returning Arrow Decisions
- Kept `UpgradeSystem` integration passive for `returningArrows` (no new `GameScene` callback yet) because the task explicitly forbids wiring `GameScene`; the upgrade now tracks owned arrow count and remains ready for the integrator to spawn entities later.
- Reused the existing `projectile` texture and a manual state machine instead of depending on Arcade move-to helpers, keeping the entity deterministic and easy to overlap-test like `Orbital`.
- Multiple arrows share the same orbit-slot distribution pattern as orbitals via `setOrbitSlot(index, total)`, so future scene wiring can refresh spacing with a familiar API.

## 2026-05-09 - Early game pacing + assassin enemy
- XP curve: BASE_NEXT_LEVEL_XP 100?70, LEVEL_EXPONENT 1.5?1.35 for cheaper/faster early levels.
- Spawn pacing: BASE_SPAWN_INTERVAL 2000?1500ms, MIN_SPAWN_INTERVAL 500?400ms, DIFFICULTY_STEP_MS 30000?22000s, MAX_ENEMIES 60?65.
- Added 'assassin' enemy type: reuses 'enemy-fast' texture with red tint (0xff4444) and 0.85 scale. Stats: 20 HP, 250 speed, 8 dmg, 30 XP.
- Assassin appears at difficultySteps >= 1 (first ~22s) alongside fast enemies.

## 2026-05-09 - HUD + Returning Arrow Integration Decisions
- HUD lifecycle is owned by GameScene (create once, update every frame). No scene-level pause/resume needed because the HUD container uses `setScrollFactor(0)` and renders on top.
- ReturningArrow instances are pooled via the physics group but rely on manual `child.update(time, delta)` iteration. This mirrors the orbital update pattern already in GameScene.
- `handleEnemyDefeated` is reused for all enemy death sources (projectiles, orbitals, returning arrows) so coin drops, kill counts, and SFX stay consistent.
- `UpgradeContext.onReturningArrowAdded` follows the same callback pattern as `onOrbitalAdded`, keeping UpgradeSystem decoupled from entity instantiation.
- Difficulty stage shown in HUD is computed from survival time (`Math.floor(survivalTimeMs / 30000) + 1`) to match spawn system difficulty steps without exposing private `SpawnSystem.elapsedMs`.


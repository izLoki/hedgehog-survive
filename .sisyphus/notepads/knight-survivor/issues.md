# Issues - Knight Survivor

## 2026-05-09 - Broad process killing forbidden
A previous subagent used `taskkill` or `Stop-Process -Name node` to kill the dev server.
This killed the OpenCode process itself, causing session interruption.
**Rule**: Only stop the specific dev server process/session that was started.
Use PTY `Ctrl+C` or kill the specific PTY session. Never use broad node.exe killers.

## 2026-05-09 - Build blocked outside T7 scope
`npm run build` fails before T7 can fully verify because `src/systems/SpawnSystem.ts:88` passes a callback returning `void` into `Group.children.each`, but Phaser expects `boolean | null`.
T7 file diagnostics are clean; the blocker is unrelated to `Projectile`/`ShootingSystem` and was not changed here.
## T10 - Issues / Gotchas

### TypeScript Strictness
- noUnusedLocals and noUnusedParameters are enabled
- Unused callback parameters prefixed with _ (e.g., _upgrades, _context)
- import type used for Player and ShootingSystem since they are only used as type annotations

### Phaser Container Lifecycle
- UpgradeMenu.destroy() clears the cards array before calling super.destroy()
- Cards are added to the container, so they are destroyed automatically with the parent
- Interactive events are cleaned up by Phaser when objects are destroyed

### Potential Future Issues
- Orbitals upgrade depends on T11 (Orbital entity). Currently uses onOrbitalAdded callback.
- If fewer than 3 upgrades are available (e.g., all maxed out), pickRandomUpgrades returns whatever is available.
- No fallback UI for "no upgrades available" case - might need handling in T13 integration.

## 2026-05-09 - T13 QA Notes
- Playwright accessibility snapshots do not expose Phaser canvas text/buttons, so menu/gameplay smoke had to interact via DOM input + canvas click coordinates and runtime debug globals.
- Browser console during dev-server QA showed favicon 404 and repeated Vite websocket reconnect noise, but gameplay runtime remained functional and `window.gameScene`/enemy/projectile counts validated the scene loop.

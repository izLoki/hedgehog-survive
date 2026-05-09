# Draft: Auto-Shooter Survival Arcade

## Requirements (confirmed)
- Juego survival arcade infinito (auto-shooter)
- Web portable con Phaser 3 + Vite
- Jugador se mueve, arma dispara sola cada X segundos
- Enemigos infinitos desde bordes (básico, rápido, gordo, shooter opcional)
- Sistema de XP y upgrades por nivel
- Ranking global con Supabase (name, time_survived, level, kills, score)
- Deploy en Vercel/Netlify
- Solo desktop por ahora (WASD/flechas)
- Sprites simples generados con canvas (no assets externos)
- MVP en 3 horas de desarrollo agentic

## Technical Decisions
- **Engine**: Phaser 3 (recomendado sobre PixiJS/ThreeJS/Pygame)
  - Razón: Game engine completo, soporte desktop, documentación extensa
- **Bundler**: Vite (rápido, HMR, export estático)
- **Deploy**: Vercel (estático)
- **DB**: Supabase (PostgreSQL + API REST real-time opcional)
- **Gráficos**: Canvas-generated sprites ESTILO MEDIEVAL (Phaser.Graphics / canvas API)
  - Jugador: Caballero/armadura simple
  - Enemigos: Esqueletos, murciélagos, ogros
  - Proyectiles: Dagas, flechas
  - XP: Monedas/gemas doradas
  - Fondo: Tonos marrones/ocres, piedra/tierra
  - UI: Estilo pergamino/madera medieval
- **Sonidos**: Estilo medieval (golpes de espada, pasos en piedra, monedas, no sci-fi)

## Scope Clarifications Needed
- Upgrades específicos a implementar
- Sonido/música ¿sí o no?
- Nombre del juego
- Test/QA strategy

## Scope Boundaries
- INCLUDE: Core loop completo (mover, disparar, matar, XP, upgrades, ranking)
- INCLUDE: 4 tipos de enemigos (básico, rápido, gordo, shooter)
- INCLUDE: Sistema de waves/dificultad progresiva
- INCLUDE: Pantalla de inicio con username + botón Play
- INCLUDE: HUD con timer prominente arriba
- INCLUDE: Estilo visual medieval (paleta, sprites, UI)
- INCLUDE: Sonido básico medieval
- EXCLUDE: Controles táctiles (versión futura)
- EXCLUDE: Animaciones complejas
- EXCLUDE: Múltiples personajes/armas desbloqueables
- EXCLUDE: Menú de opciones/settings

## Decisions Made

### Upgrades (7 seleccionados)
1. Damage + (más daño)
2. Attack Speed + (reduce cooldown)
3. Max HP + (más vida máxima)
4. HP Regen (regenera vida)
5. Multi-shot (+1 proyectil)
6. Piercing (proyectiles atraviesan enemigos)
7. Orbitals (bolitas girando alrededor del jugador)

### Sistema de Disparo (ACLARACIÓN CRÍTICA)
- **NO apunta al enemigo más cercano**
- Dispara en 360° en múltiples direcciones simultáneamente
- Empieza con ~4-6 proyectiles distribuidos en círculo
- Cada upgrade de Multi-shot agrega +1 proyectil al círculo
- El jugador NO necesita apuntar, solo moverse

### Audio
- Sí: sonido básico (disparos, hits, game over)
- Web Audio API via Phaser.Sound

### Nombre del Juego
- Propuesta: "Knight Survivor" o "Dungeon Survivor"
- Decisión: Definir en el plan

### UI Requerida (NUEVO)
- **Pantalla de Inicio**: Input de username + botón Play prominentes
- **HUD durante juego**: 
  - Timer de tiempo superado ARRIBA (principal)
  - HP bar
  - Nivel actual
  - Kills
- **Pantalla Game Over**: Score final + botón Reintentar + botón Ver Rankings

### Estilo Visual (NUEVO - Medieval/Viejo)
- Paleta: Marrones, ocres, grises, dorados (no neón/futurista)
- Formas: Menos geométrico perfecto, más orgánico/rústico
- Tipografía: Serif o medieval-style
- Fondo: Textura de piedra/tierra oscura

## Open Questions
- [ ] Nombre final del juego
- [ ] Test strategy (QA agent-executed)

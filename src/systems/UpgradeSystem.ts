import type { Player } from '../entities/Player';
import type { ShootingSystem } from './ShootingSystem';

/**
 * Current upgrade levels/possession for the player.
 * All numeric fields are levels (0 = not upgraded / base).
 * `piercing` is a boolean toggle (offered only once).
 */
export interface Upgrades {
  damage: number;
  attackSpeed: number;
  maxHp: number;
  hpRegen: number;
  multiShot: number;
  piercing: boolean;
  orbitals: number;
  returningArrows: number;
}

/**
 * Context required to apply an upgrade at runtime.
 */
export interface UpgradeContext {
  player: Player;
  shootingSystem: ShootingSystem;
  onOrbitalAdded?: () => void;
  onReturningArrowAdded?: () => void;
}

export interface UpgradeDefinition {
  id: keyof Upgrades;
  name: string;
  description: string;
  maxLevel: number;
  apply: (upgrades: Upgrades, context: UpgradeContext) => void;
}

export const DEFAULT_UPGRADES: Upgrades = {
  damage: 0,
  attackSpeed: 0,
  maxHp: 0,
  hpRegen: 0,
  multiShot: 0,
  piercing: false,
  orbitals: 0,
  returningArrows: 0,
};

const PIERCING_PROJECTILE_COUNT = 50;

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    id: 'damage',
    name: 'Damage+',
    description: 'Increase projectile damage by 10.',
    maxLevel: Infinity,
    apply: (_upgrades, context) => {
      const current = context.shootingSystem.getStats();
      context.shootingSystem.setStats({
        projectileDamage: current.projectileDamage + 10,
      });
    },
  },
  {
    id: 'attackSpeed',
    name: 'Attack Speed+',
    description: 'Reduce shot cooldown by 10%.',
    maxLevel: Infinity,
    apply: (_upgrades, context) => {
      const current = context.shootingSystem.getStats();
      const newCooldown = Math.max(200, current.cooldown * 0.9);
      context.shootingSystem.setStats({ cooldown: newCooldown });
    },
  },
  {
    id: 'maxHp',
    name: 'Max HP+',
    description: 'Increase max HP by 20 and heal 20.',
    maxLevel: Infinity,
    apply: (_upgrades, context) => {
      context.player.maxHp += 20;
      context.player.heal(20);
    },
  },
  {
    id: 'hpRegen',
    name: 'HP Regen',
    description: 'Regenerate +2 HP per second.',
    maxLevel: Infinity,
    apply: (_upgrades, _context) => {
      // Passive effect; applied via getHpRegenPerSecond / tick helper.
    },
  },
  {
    id: 'multiShot',
    name: 'Multi-shot',
    description: 'Fire +1 projectile per shot.',
    maxLevel: Infinity,
    apply: (_upgrades, context) => {
      const current = context.shootingSystem.getStats();
      context.shootingSystem.setStats({
        projectileCount: current.projectileCount + 1,
      });
    },
  },
  {
    id: 'piercing',
    name: 'Piercing',
    description: 'Projectiles pierce through enemies.',
    maxLevel: 1,
    apply: (_upgrades, context) => {
      context.shootingSystem.setUpgrades({
        piercing: PIERCING_PROJECTILE_COUNT,
      });
    },
  },
  {
    id: 'orbitals',
    name: 'Orbitals',
    description: 'Add a spinning shield around you.',
    maxLevel: 6,
    apply: (_upgrades, context) => {
      context.onOrbitalAdded?.();
    },
  },
  {
    id: 'returningArrows',
    name: 'Returning Arrow',
    description: 'Add a permanent homing arrow that returns to you.',
    maxLevel: 6,
    apply: (_upgrades, context) => {
      context.onReturningArrowAdded?.();
    },
  },
];

/**
 * Returns the list of upgrades that can currently be offered,
 * respecting max levels and the one-time piercing rule.
 */
export function getAvailableUpgrades(upgrades: Upgrades): UpgradeDefinition[] {
  return UPGRADE_DEFINITIONS.filter((def) => {
    const currentLevel = upgrades[def.id];
    if (def.id === 'piercing') {
      return currentLevel === false;
    }
    if (typeof currentLevel === 'number') {
      return currentLevel < def.maxLevel;
    }
    return true;
  });
}

/**
 * Pick N random distinct upgrades from the available pool.
 */
export function pickRandomUpgrades(
  upgrades: Upgrades,
  count: number
): UpgradeDefinition[] {
  const available = getAvailableUpgrades(upgrades);
  const shuffled = Phaser.Utils.Array.Shuffle([...available]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Apply a single upgrade by ID, updating the upgrades state and runtime context.
 */
export function applyUpgrade(
  id: keyof Upgrades,
  upgrades: Upgrades,
  context: UpgradeContext
): void {
  const def = UPGRADE_DEFINITIONS.find((d) => d.id === id);
  if (!def) {
    return;
  }

  if (id === 'piercing') {
    upgrades.piercing = true;
  } else if (typeof upgrades[id] === 'number') {
    (upgrades[id] as number) += 1;
  }

  def.apply(upgrades, context);
}

/**
 * Calculate HP regeneration per second based on current upgrade levels.
 */
export function getHpRegenPerSecond(upgrades: Upgrades): number {
  return upgrades.hpRegen * 2;
}

/**
 * Apply an HP regeneration tick. Call this from the game loop / player update.
 * @param deltaMs Time since last tick in milliseconds.
 */
export function applyHpRegenTick(
  player: Player,
  upgrades: Upgrades,
  deltaMs: number
): void {
  const regenPerSecond = getHpRegenPerSecond(upgrades);
  if (regenPerSecond <= 0) {
    return;
  }

  const healAmount = (regenPerSecond * deltaMs) / 1000;
  if (healAmount >= 1) {
    player.heal(Math.floor(healAmount));
  }
}

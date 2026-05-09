import Phaser from 'phaser';
import { Projectile, type ProjectileFireConfig } from '../entities/Projectile';

export interface ShootingStats {
  cooldown: number;
  projectileCount: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileLifetime: number;
  piercing: number;
}

export interface ShootingUpgradeInputs {
  damage?: number;
  attackSpeed?: number;
  multishot?: number;
  piercing?: number;
  cooldown?: number;
  cooldownMultiplier?: number;
  projectileCount?: number;
  projectileSpeed?: number;
  projectileLifetime?: number;
}

export interface ShootingSystemConfig {
  scene: Phaser.Scene;
  projectileGroup: Phaser.Physics.Arcade.Group;
  getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  onShoot?: () => void;
  stats?: Partial<ShootingStats>;
  upgrades?: ShootingUpgradeInputs;
}

export interface ShootingVolleySummary {
  projectileCount: number;
  cooldown: number;
  speed: number;
  damage: number;
  lifetime: number;
  piercing: number;
}

const BASE_SHOOTING_STATS: ShootingStats = {
  cooldown: 1000,
  projectileCount: 4,
  projectileSpeed: 400,
  projectileDamage: 25,
  projectileLifetime: 2000,
  piercing: 0,
};

export class ShootingSystem {
  private readonly scene: Phaser.Scene;
  private readonly projectileGroup: Phaser.Physics.Arcade.Group;
  private readonly getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  private readonly onShoot?: () => void;

  private baseStats: ShootingStats;
  private upgrades: ShootingUpgradeInputs;
  private nextShotAt: number | null = null;

  constructor(config: ShootingSystemConfig) {
    this.scene = config.scene;
    this.projectileGroup = config.projectileGroup;
    this.getPlayerPosition = config.getPlayerPosition;
    this.onShoot = config.onShoot;
    this.baseStats = {
      ...BASE_SHOOTING_STATS,
      ...config.stats,
    };
    this.upgrades = {
      ...config.upgrades,
    };
  }

  getStats(): ShootingStats {
    return this.computeStats();
  }

  setStats(stats: Partial<ShootingStats>, upgrades?: ShootingUpgradeInputs): void {
    this.baseStats = {
      ...this.baseStats,
      ...stats,
    };

    if (upgrades) {
      this.upgrades = {
        ...this.upgrades,
        ...upgrades,
      };
    }
  }

  setUpgrades(upgrades: Partial<ShootingUpgradeInputs>): void {
    this.upgrades = {
      ...this.upgrades,
      ...upgrades,
    };
  }

  resetCooldown(time = this.scene.time.now): void {
    this.nextShotAt = time + this.computeStats().cooldown;
  }

  update(time: number, enemies?: Phaser.GameObjects.GameObject | Phaser.GameObjects.Group): void {
    void enemies;

    const stats = this.computeStats();

    if (this.nextShotAt === null) {
      this.nextShotAt = time + stats.cooldown;
      return;
    }

    if (time < this.nextShotAt) {
      return;
    }

    this.fireVolley(stats);
    this.nextShotAt = time + stats.cooldown;
  }

  private computeStats(): ShootingStats {
    const attackSpeed = Math.max(0, this.upgrades.attackSpeed ?? 0);
    const cooldownMultiplier = Math.max(0.1, this.upgrades.cooldownMultiplier ?? 1);
    const directCooldown = this.upgrades.cooldown;
    const cooldown = directCooldown ?? (this.baseStats.cooldown / (1 + attackSpeed)) * cooldownMultiplier;

    return {
      cooldown: Math.max(50, cooldown),
      projectileCount: Math.max(
        1,
        Math.round(
          this.baseStats.projectileCount +
            (this.upgrades.multishot ?? 0) +
            (this.upgrades.projectileCount ?? 0)
        )
      ),
      projectileSpeed: Math.max(0, this.upgrades.projectileSpeed ?? this.baseStats.projectileSpeed),
      projectileDamage: Math.max(0, this.baseStats.projectileDamage + (this.upgrades.damage ?? 0)),
      projectileLifetime: Math.max(1, this.upgrades.projectileLifetime ?? this.baseStats.projectileLifetime),
      piercing: Math.max(0, this.baseStats.piercing + (this.upgrades.piercing ?? 0)),
    };
  }

  private fireVolley(stats: ShootingStats): ShootingVolleySummary {
    const origin = this.getPlayerPosition();
    const angleStep = Phaser.Math.PI2 / stats.projectileCount;

    for (let index = 0; index < stats.projectileCount; index += 1) {
      const angle = index * angleStep;
      const projectile = this.acquireProjectile();
      const config: ProjectileFireConfig = {
        x: origin.x,
        y: origin.y,
        angle,
        speed: stats.projectileSpeed,
        damage: stats.projectileDamage,
        lifetime: stats.projectileLifetime,
        piercing: stats.piercing,
      };

      projectile.fire(config);
    }

    this.onShoot?.();

    return {
      projectileCount: stats.projectileCount,
      cooldown: stats.cooldown,
      speed: stats.projectileSpeed,
      damage: stats.projectileDamage,
      lifetime: stats.projectileLifetime,
      piercing: stats.piercing,
    };
  }

  private acquireProjectile(): Projectile {
    const existingProjectile = this.projectileGroup
      .getChildren()
      .find((child): child is Projectile => child instanceof Projectile && !child.active);

    if (existingProjectile) {
      return existingProjectile;
    }

    const projectile = new Projectile(this.scene, 0, 0);
    this.projectileGroup.add(projectile, true);
    return projectile;
  }
}

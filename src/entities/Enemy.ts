import Phaser from 'phaser';

export const ENEMY_TYPES = ['basic', 'fast', 'tank', 'shooter', 'assassin'] as const;

export type EnemyType = (typeof ENEMY_TYPES)[number];

export type EnemyStats = {
  textureKey: 'enemy-basic' | 'enemy-fast' | 'enemy-tank' | 'enemy-shooter';
  maxHealth: number;
  speed: number;
  damage: number;
  xpValue: number;
};

export const ENEMY_STAT_TABLE: Record<EnemyType, EnemyStats> = {
  basic: {
    textureKey: 'enemy-basic',
    maxHealth: 50,
    speed: 100,
    damage: 10,
    xpValue: 10,
  },
  fast: {
    textureKey: 'enemy-fast',
    maxHealth: 25,
    speed: 180,
    damage: 5,
    xpValue: 15,
  },
  tank: {
    textureKey: 'enemy-tank',
    maxHealth: 150,
    speed: 60,
    damage: 20,
    xpValue: 25,
  },
  shooter: {
    textureKey: 'enemy-shooter',
    maxHealth: 40,
    speed: 80,
    damage: 15,
    xpValue: 20,
  },
  assassin: {
    textureKey: 'enemy-fast',
    maxHealth: 20,
    speed: 250,
    damage: 8,
    xpValue: 30,
  },
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  readonly enemyType: EnemyType;

  readonly maxHealth: number;

  readonly speed: number;

  readonly damage: number;

  readonly xpValue: number;

  private healthPoints: number;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyType: EnemyType) {
    const stats = ENEMY_STAT_TABLE[enemyType];

    super(scene, x, y, stats.textureKey);

    this.enemyType = enemyType;
    this.maxHealth = stats.maxHealth;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.xpValue = stats.xpValue;
    this.healthPoints = stats.maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
    this.setActive(true);
    this.setVisible(true);

    if (enemyType === 'assassin') {
      this.setTint(0xff4444);
      this.setScale(0.85);
    }

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      this.body.setCollideWorldBounds(false);
    }
  }

  get health(): number {
    return this.healthPoints;
  }

  updateMovement(target: Phaser.Types.Math.Vector2Like): void {
    if (!this.active) {
      return;
    }

    this.scene.physics.moveTo(this, target.x, target.y, this.speed);
  }

  takeDamage(amount: number): boolean {
    if (amount <= 0 || !this.active) {
      return false;
    }

    this.healthPoints = Math.max(0, this.healthPoints - amount);

    if (this.healthPoints > 0) {
      return false;
    }

    this.setVelocity(0, 0);
    return true;
  }
}

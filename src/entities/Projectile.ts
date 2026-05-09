import Phaser from 'phaser';

export interface ProjectileFireConfig {
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  lifetime: number;
  piercing?: number;
}

const WORLD_BOUNDS_MARGIN = 32;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  private damageAmount = 0;
  private remainingPierces = 0;
  private expiresAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.setOrigin(0.5);
  }

  get damage(): number {
    return this.damageAmount;
  }

  get piercing(): number {
    return this.remainingPierces;
  }

  fire(config: ProjectileFireConfig): void {
    this.damageAmount = config.damage;
    this.remainingPierces = Math.max(0, config.piercing ?? 0);
    this.expiresAt = this.scene.time.now + config.lifetime;

    this.enableBody(true, config.x, config.y, true, true);
    this.setPosition(config.x, config.y);
    this.setRotation(config.angle);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      this.scene.physics.velocityFromRotation(config.angle, config.speed, body.velocity);
      body.setAllowGravity(false);
    }
  }

  registerHit(): boolean {
    if (this.remainingPierces > 0) {
      this.remainingPierces -= 1;
      return false;
    }

    this.deactivate();
    return true;
  }

  deactivate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.stop();
    }

    this.disableBody(true, true);
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    void delta;

    if (!this.active) {
      return;
    }

    if (time >= this.expiresAt || this.isOutsideWorldBounds()) {
      this.deactivate();
    }
  }

  private isOutsideWorldBounds(): boolean {
    const bounds = this.scene.physics.world.bounds;

    return (
      this.x < bounds.x - WORLD_BOUNDS_MARGIN ||
      this.x > bounds.right + WORLD_BOUNDS_MARGIN ||
      this.y < bounds.y - WORLD_BOUNDS_MARGIN ||
      this.y > bounds.bottom + WORLD_BOUNDS_MARGIN
    );
  }
}

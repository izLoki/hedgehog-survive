import Phaser from 'phaser';
import type { Enemy } from './Enemy';

export class Orbital extends Phaser.Physics.Arcade.Sprite {
  private readonly getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  private readonly damageAmount = 15;
  private readonly orbitRadius = 60;
  private readonly angularSpeed = Phaser.Math.DegToRad(180);
  private readonly cooldownMs = 500;

  private orbitIndex = 0;
  private totalOrbitals = 1;
  private currentAngle = 0;
  private lastUpdateTime = 0;
  private cooldowns = new WeakMap<Enemy, number>();

  constructor(
    scene: Phaser.Scene,
    getPlayerPosition: () => Phaser.Types.Math.Vector2Like,
    index: number,
    totalCount: number
  ) {
    super(scene, 0, 0, 'orbital');

    this.getPlayerPosition = getPlayerPosition;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
    this.setActive(true);
    this.setVisible(true);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.body.setCircle(8);
    }

    this.setOrbitSlot(index, totalCount);
  }

  setOrbitSlot(index: number, total: number): void {
    this.orbitIndex = Math.max(0, index);
    this.totalOrbitals = Math.max(1, total);
    this.currentAngle = (Math.PI * 2 * this.orbitIndex) / this.totalOrbitals;
  }

  update(time: number): void {
    if (!this.active) {
      return;
    }

    let delta = 16.667;
    if (this.lastUpdateTime > 0) {
      delta = time - this.lastUpdateTime;
    }
    this.lastUpdateTime = time;

    const dt = delta / 1000;
    this.currentAngle += this.angularSpeed * dt;

    const playerPos = this.getPlayerPosition();
    const x = playerPos.x + Math.cos(this.currentAngle) * this.orbitRadius;
    const y = playerPos.y + Math.sin(this.currentAngle) * this.orbitRadius;

    this.setPosition(x, y);
  }

  canDamage(enemy: Enemy): boolean {
    if (!this.active || !enemy.active) {
      return false;
    }

    const lastDamageTime = this.cooldowns.get(enemy);
    if (lastDamageTime === undefined) {
      return true;
    }

    return this.scene.time.now - lastDamageTime >= this.cooldownMs;
  }

  registerDamage(enemy: Enemy): void {
    this.cooldowns.set(enemy, this.scene.time.now);
  }

  get damage(): number {
    return this.damageAmount;
  }
}

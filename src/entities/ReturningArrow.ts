import Phaser from 'phaser';
import { Enemy } from './Enemy';

type EnemySource = Phaser.Physics.Arcade.Group | (() => Iterable<Enemy>);

type ArrowState = 'orbiting' | 'outbound' | 'returning';

const ORBIT_RADIUS = 42;
const ORBIT_ANGULAR_SPEED = Phaser.Math.DegToRad(120);
const OUTBOUND_SPEED = 320;
const RETURN_SPEED = 360;
const DAMAGE_COOLDOWN_MS = 250;
const ATTACK_COOLDOWN_MS = 700;
const DAMAGE_AMOUNT = 10;
const TARGET_REACHED_DISTANCE = 20;
const RETURN_REACHED_DISTANCE = 18;

export class ReturningArrow extends Phaser.Physics.Arcade.Sprite {
  private readonly getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  private readonly enemySource: EnemySource;
  private readonly damageAmount = DAMAGE_AMOUNT;
  private readonly cooldowns = new WeakMap<Enemy, number>();

  private orbitIndex = 0;
  private totalArrows = 1;
  private currentAngle = 0;
  private arrowState: ArrowState = 'orbiting';
  private target: Enemy | null = null;
  private nextAttackAt = 0;

  constructor(
    scene: Phaser.Scene,
    getPlayerPosition: () => Phaser.Types.Math.Vector2Like,
    enemySource: EnemySource,
    index: number,
    totalCount: number
  ) {
    super(scene, 0, 0, 'projectile');

    this.getPlayerPosition = getPlayerPosition;
    this.enemySource = enemySource;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
    this.setActive(true);
    this.setVisible(true);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      this.body.setCircle(6);
    }

    this.setOrbitSlot(index, totalCount);
    this.snapToOrbit();
  }

  get damage(): number {
    return this.damageAmount;
  }

  get isOutbound(): boolean {
    return this.arrowState === 'outbound';
  }

  setOrbitSlot(index: number, total: number): void {
    this.orbitIndex = Math.max(0, index);
    this.totalArrows = Math.max(1, total);
    this.currentAngle = (Phaser.Math.PI2 * this.orbitIndex) / this.totalArrows;
  }

  update(time: number, delta: number): void {
    if (!this.active) {
      return;
    }

    const dt = Math.max(0, delta) / 1000;

    switch (this.arrowState) {
      case 'orbiting':
        this.updateOrbit(dt);
        if (time >= this.nextAttackAt) {
          this.tryLaunch();
        }
        break;
      case 'outbound':
        this.updateOutbound();
        break;
      case 'returning':
        this.updateReturning();
        break;
    }
  }

  canDamage(enemy: Enemy): boolean {
    if (!this.active || !enemy.active || this.arrowState !== 'outbound') {
      return false;
    }

    const lastDamageTime = this.cooldowns.get(enemy);
    if (lastDamageTime === undefined) {
      return true;
    }

    return this.scene.time.now - lastDamageTime >= DAMAGE_COOLDOWN_MS;
  }

  registerDamage(enemy: Enemy): void {
    this.cooldowns.set(enemy, this.scene.time.now);
    this.beginReturn();
  }

  private updateOrbit(dt: number): void {
    this.currentAngle += ORBIT_ANGULAR_SPEED * dt;
    this.snapToOrbit();
  }

  private tryLaunch(): void {
    const target = this.getNearestEnemy();
    if (!target) {
      return;
    }

    this.target = target;
    this.arrowState = 'outbound';
  }

  private updateOutbound(): void {
    const target = this.target?.active ? this.target : this.getNearestEnemy();
    if (!target) {
      this.beginReturn();
      return;
    }

    this.target = target;
    this.moveToward(target.x, target.y, OUTBOUND_SPEED);

    if (Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) <= TARGET_REACHED_DISTANCE) {
      this.beginReturn();
    }
  }

  private updateReturning(): void {
    const playerPos = this.getPlayerPosition();
    this.moveToward(playerPos.x, playerPos.y, RETURN_SPEED);

    if (Phaser.Math.Distance.Between(this.x, this.y, playerPos.x, playerPos.y) <= RETURN_REACHED_DISTANCE) {
      this.arrowState = 'orbiting';
      this.target = null;
      this.nextAttackAt = this.scene.time.now + ATTACK_COOLDOWN_MS;
      this.snapToOrbit();

      const body = this.body as Phaser.Physics.Arcade.Body | null;
      body?.stop();
    }
  }

  private beginReturn(): void {
    this.arrowState = 'returning';
    this.target = null;
  }

  private snapToOrbit(): void {
    const playerPos = this.getPlayerPosition();
    const x = playerPos.x + Math.cos(this.currentAngle) * ORBIT_RADIUS;
    const y = playerPos.y + Math.sin(this.currentAngle) * ORBIT_RADIUS;

    this.setPosition(x, y);
    this.setRotation(this.currentAngle + Math.PI / 2);
  }

  private moveToward(targetX: number, targetY: number, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setRotation(angle);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }

    this.scene.physics.velocityFromRotation(angle, speed, body.velocity);
  }

  private getNearestEnemy(): Enemy | null {
    const enemies = this.getActiveEnemies();
    if (enemies.length === 0) {
      return null;
    }

    let closestEnemy: Enemy | null = null;
    let closestDistanceSq = Number.POSITIVE_INFINITY;

    enemies.forEach((enemy) => {
      const distanceSq = Phaser.Math.Distance.Squared(this.x, this.y, enemy.x, enemy.y);
      if (distanceSq < closestDistanceSq) {
        closestDistanceSq = distanceSq;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }

  private getActiveEnemies(): Enemy[] {
    if (typeof this.enemySource === 'function') {
      return Array.from(this.enemySource()).filter((enemy) => enemy.active);
    }

    return this.enemySource
      .getChildren()
      .filter((child): child is Enemy => child instanceof Enemy && child.active);
  }
}

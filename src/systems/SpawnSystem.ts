import Phaser from 'phaser';
import { Enemy, type EnemyType } from '../entities/Enemy';

const BASE_SPAWN_INTERVAL = 1500;
const MIN_SPAWN_INTERVAL = 400;
const DIFFICULTY_STEP_MS = 22000;
const SPAWN_INTERVAL_MULTIPLIER = 0.9;
const MAX_ENEMIES = 65;
const MIN_PLAYER_DISTANCE = 400;
const MAX_SPAWN_ATTEMPTS = 12;

type WeightedEnemyChance = {
  type: EnemyType;
  weight: number;
};

export type PlayerPositionProvider = () => Phaser.Types.Math.Vector2Like;

export class SpawnSystem {
  readonly scene: Phaser.Scene;

  readonly enemyGroup: Phaser.Physics.Arcade.Group;

  readonly worldBounds: Phaser.Geom.Rectangle;

  readonly getPlayerPosition: PlayerPositionProvider;

  spawnInterval = BASE_SPAWN_INTERVAL;

  private elapsedMs = 0;

  private spawnAccumulatorMs = 0;

  constructor(
    scene: Phaser.Scene,
    enemyGroup: Phaser.Physics.Arcade.Group,
    playerPositionProvider: PlayerPositionProvider,
    worldBounds: Phaser.Geom.Rectangle
  ) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;
    this.getPlayerPosition = playerPositionProvider;
    this.worldBounds = worldBounds;
  }

  update(_time: number, delta: number): void {
    this.elapsedMs += delta;
    this.spawnAccumulatorMs += delta;
    this.spawnInterval = this.getCurrentSpawnInterval();

    this.updateEnemyMovement();

    if (this.enemyGroup.countActive(true) >= MAX_ENEMIES) {
      return;
    }

    while (
      this.spawnAccumulatorMs >= this.spawnInterval
      && this.enemyGroup.countActive(true) < MAX_ENEMIES
    ) {
      this.spawnAccumulatorMs -= this.spawnInterval;
      this.spawnEnemy();
    }
  }

  spawnEnemy(): Enemy | null {
    if (this.enemyGroup.countActive(true) >= MAX_ENEMIES) {
      return null;
    }

    const spawnPoint = this.findSpawnPoint();
    if (!spawnPoint) {
      return null;
    }

    const enemyType = this.chooseEnemyType();
    const enemy = new Enemy(this.scene, spawnPoint.x, spawnPoint.y, enemyType);

    this.enemyGroup.add(enemy);
    enemy.updateMovement(this.getPlayerPosition());

    return enemy;
  }

  private updateEnemyMovement(): void {
    const playerPosition = this.getPlayerPosition();

    this.enemyGroup.children.each((child) => {
      if (!(child instanceof Enemy) || !child.active) {
        return true;
      }

      child.updateMovement(playerPosition);
      return true;
    });
  }

  private getCurrentSpawnInterval(): number {
    const difficultySteps = Math.floor(this.elapsedMs / DIFFICULTY_STEP_MS);
    const scaledInterval = BASE_SPAWN_INTERVAL * (SPAWN_INTERVAL_MULTIPLIER ** difficultySteps);

    return Math.max(MIN_SPAWN_INTERVAL, Math.round(scaledInterval));
  }

  private chooseEnemyType(): EnemyType {
    const chances = this.getEnemyChances();
    const totalWeight = chances.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Phaser.Math.FloatBetween(0, totalWeight);

    for (const chance of chances) {
      roll -= chance.weight;

      if (roll <= 0) {
        return chance.type;
      }
    }

    return chances[chances.length - 1].type;
  }

  private getEnemyChances(): WeightedEnemyChance[] {
    const difficultySteps = Math.floor(this.elapsedMs / DIFFICULTY_STEP_MS);
    const chances: WeightedEnemyChance[] = [{ type: 'basic', weight: 100 }];

    if (difficultySteps >= 1) {
      chances[0].weight -= 25;
      chances.push({ type: 'fast', weight: 15 });
      chances.push({ type: 'assassin', weight: 10 });
    }

    if (difficultySteps >= 2) {
      chances[0].weight -= 10;
      chances.push({ type: 'tank', weight: 10 });
    }

    if (difficultySteps >= 3) {
      chances[0].weight -= 15;
      chances.push({ type: 'shooter', weight: 15 });
    }

    return chances;
  }

  private findSpawnPoint(): Phaser.Math.Vector2 | null {
    const playerPosition = this.getPlayerPosition();

    for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt += 1) {
      const point = this.getRandomEdgePoint();
      if (Phaser.Math.Distance.Between(point.x, point.y, playerPosition.x, playerPosition.y) >= MIN_PLAYER_DISTANCE) {
        return point;
      }
    }

    return null;
  }

  private getRandomEdgePoint(): Phaser.Math.Vector2 {
    const edge = Phaser.Math.RND.pick(['top', 'right', 'bottom', 'left'] as const);
    const { left, right, top, bottom } = this.worldBounds;

    switch (edge) {
      case 'top':
        return new Phaser.Math.Vector2(Phaser.Math.Between(left, right), top);
      case 'right':
        return new Phaser.Math.Vector2(right, Phaser.Math.Between(top, bottom));
      case 'bottom':
        return new Phaser.Math.Vector2(Phaser.Math.Between(left, right), bottom);
      default:
        return new Phaser.Math.Vector2(left, Phaser.Math.Between(top, bottom));
    }
  }
}

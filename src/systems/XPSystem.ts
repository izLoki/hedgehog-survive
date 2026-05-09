import type Phaser from 'phaser';
import { Coin } from '../entities/Coin';
import type { Player } from '../entities/Player';

export interface XPSystemConfig {
  scene: Phaser.Scene;
  coinGroup: Phaser.Physics.Arcade.Group;
  getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  onCoin?: () => void;
  onLevelUp?: (level: number) => void;
  player?: Player;
}

const HP_BONUS_PER_LEVEL = 5;
const BASE_NEXT_LEVEL_XP = 70;
const LEVEL_EXPONENT = 1.35;
const COIN_SPAWN_SPREAD = 24;

export class XPSystem {
  private readonly scene: Phaser.Scene;
  private readonly coinGroup: Phaser.Physics.Arcade.Group;
  private readonly getPlayerPosition: () => Phaser.Types.Math.Vector2Like;
  private readonly onCoin?: () => void;
  private readonly onLevelUp?: (level: number) => void;
  private readonly player?: Player;

  xp: number;
  level: number;
  nextLevelXp: number;

  constructor(config: XPSystemConfig) {
    this.scene = config.scene;
    this.coinGroup = config.coinGroup;
    this.getPlayerPosition = config.getPlayerPosition;
    this.onCoin = config.onCoin;
    this.onLevelUp = config.onLevelUp;
    this.player = config.player;

    this.xp = 0;
    this.level = 1;
    this.nextLevelXp = this.computeNextLevelXp(1);
  }

  getXpRatio(): number {
    return this.nextLevelXp > 0
      ? Math.min(1, this.xp / this.nextLevelXp)
      : 0;
  }

  addXP(amount: number): void {
    if (amount <= 0) {
      return;
    }

    this.xp += amount;

    while (this.xp >= this.nextLevelXp) {
      this.xp -= this.nextLevelXp;
      this.level += 1;
      this.nextLevelXp = this.computeNextLevelXp(this.level);

      if (this.player) {
        this.player.maxHp += HP_BONUS_PER_LEVEL;
        this.player.hp += HP_BONUS_PER_LEVEL;
      }

      this.scene.events.emit('level-up', this.level);
      this.onLevelUp?.(this.level);
    }
  }

  spawnCoin(x: number, y: number, value: number): Coin {
    const existingCoin = this.coinGroup
      .getChildren()
      .find((child): child is Coin => child instanceof Coin && !child.active);

    const coin = existingCoin ?? new Coin(this.scene, 0, 0);
    if (!existingCoin) {
      this.coinGroup.add(coin, true);
    }

    coin.spawn(x, y, value);
    return coin;
  }

  spawnCoinsFromEnemy(
    x: number,
    y: number,
    xpValue: number,
    count?: number
  ): Coin[] {
    const coinCount = count ?? 1;
    const coins: Coin[] = [];

    if (coinCount <= 0) {
      return coins;
    }

    const valuePerCoin = Math.floor(xpValue / coinCount);
    const remainder = xpValue - valuePerCoin * coinCount;

    for (let index = 0; index < coinCount; index += 1) {
      const value = Math.max(1, valuePerCoin + (index < remainder ? 1 : 0));
      const offsetX = (Math.random() - 0.5) * COIN_SPAWN_SPREAD;
      const offsetY = (Math.random() - 0.5) * COIN_SPAWN_SPREAD;
      coins.push(this.spawnCoin(x + offsetX, y + offsetY, value));
    }

    return coins;
  }

  update(): void {
    const playerPosition = this.getPlayerPosition();

    this.coinGroup.getChildren().forEach((child) => {
      if (child instanceof Coin && child.active) {
        const xp = child.update(playerPosition);
        if (xp !== null) {
          this.addXP(xp);
          this.onCoin?.();
        }
      }
    });
  }

  private computeNextLevelXp(level: number): number {
    return Math.floor(BASE_NEXT_LEVEL_XP * level ** LEVEL_EXPONENT);
  }
}

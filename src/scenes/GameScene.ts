import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Orbital } from '../entities/Orbital';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { ReturningArrow } from '../entities/ReturningArrow';
import { AudioSystem } from '../systems/AudioSystem';
import { ShootingSystem } from '../systems/ShootingSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import {
  DEFAULT_UPGRADES,
  applyHpRegenTick,
  type UpgradeContext,
  type Upgrades,
} from '../systems/UpgradeSystem';
import { WORLD_HEIGHT, WORLD_WIDTH, drawWorldBackground, setupWorld } from '../systems/WorldSystem';
import { XPSystem } from '../systems/XPSystem';
import { HUD } from '../ui/HUD';
import { UpgradeMenu } from '../ui/UpgradeMenu';

declare global {
  interface Window {
    gameScene?: GameScene;
    xpSystem?: XPSystem;
    player?: Player;
  }
}

const PLAYER_ENEMY_HIT_COOLDOWN_MS = 650;
const PLAYER_KNOCKBACK_DISTANCE = 24;
const PLAYER_KNOCKBACK_SPEED = 240;
const ENEMY_KNOCKBACK_SPEED = 120;
const REGEN_TICK_MS = 1000;

interface GameOverData {
  username: string;
  score: number;
  timeSurvived: number;
  level: number;
  kills: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private audioSystem!: AudioSystem;
  private shootingSystem!: ShootingSystem;
  private spawnSystem!: SpawnSystem;
  private xpSystem!: XPSystem;

  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private orbitals!: Phaser.Physics.Arcade.Group;
  private returningArrows!: Phaser.Physics.Arcade.Group;

  private hud!: HUD;
  private upgradeMenu: UpgradeMenu | null = null;
  private upgrades: Upgrades = { ...DEFAULT_UPGRADES };

  private kills = 0;
  private survivalTimeMs = 0;
  private regenAccumulatorMs = 0;
  private pendingUpgradeSelections = 0;
  private lastPlayerHitAt = -PLAYER_ENEMY_HIT_COOLDOWN_MS;
  private gameOver = false;
  private loopPaused = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.upgrades = { ...DEFAULT_UPGRADES };
    this.kills = 0;
    this.survivalTimeMs = 0;
    this.regenAccumulatorMs = 0;
    this.pendingUpgradeSelections = 0;
    this.lastPlayerHitAt = -PLAYER_ENEMY_HIT_COOLDOWN_MS;
    this.gameOver = false;
    this.loopPaused = false;

    drawWorldBackground(this);

    this.createGroups();
    this.audioSystem = new AudioSystem();
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, () => {
      this.audioSystem.playHit();
    });

    setupWorld(this, this.player);

    this.shootingSystem = new ShootingSystem({
      scene: this,
      projectileGroup: this.projectiles,
      getPlayerPosition: this.getPlayerPosition,
      onShoot: () => {
        this.audioSystem.playShoot();
      },
    });
    this.spawnSystem = new SpawnSystem(
      this,
      this.enemies,
      this.getPlayerPosition,
      new Phaser.Geom.Rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    );
    this.xpSystem = new XPSystem({
      scene: this,
      coinGroup: this.coins,
      getPlayerPosition: this.getPlayerPosition,
      onCoin: () => {
        this.audioSystem.playCoin();
      },
      onLevelUp: () => {
        this.queueUpgradeMenu();
      },
      player: this.player,
    });

    this.createColliders();
    this.hud = new HUD(this);

    this.events.once('player-death', this.handlePlayerDeath, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.clearDebugGlobals, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.clearDebugGlobals, this);
    this.exposeDebugGlobals();
  }

  update(time: number, delta: number): void {
    if (this.gameOver || this.loopPaused) {
      return;
    }

    this.survivalTimeMs += delta;
    this.regenAccumulatorMs += delta;

    this.player.update();
    this.shootingSystem.update(time, this.enemies);
    this.spawnSystem.update(time, delta);
    this.xpSystem.update();
    this.updateOrbitals(time);
    this.updateReturningArrows(time, delta);
    this.applyRegen();
    this.updateHUD();
  }

  getPlayer(): Player {
    return this.player;
  }

  getKills(): number {
    return this.kills;
  }

  getLevel(): number {
    return this.xpSystem.level;
  }

  getTimeSurvivedSeconds(): number {
    return Math.floor(this.survivalTimeMs / 1000);
  }

  getScore(): number {
    return this.kills * 10 + this.getTimeSurvivedSeconds() * 2 + this.getLevel() * 50;
  }

  private createGroups(): void {
    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ runChildUpdate: true });
    this.coins = this.physics.add.group({ runChildUpdate: false });
    this.orbitals = this.physics.add.group({ runChildUpdate: false });
    this.returningArrows = this.physics.add.group({ runChildUpdate: false });
  }

  private createColliders(): void {
    this.physics.add.overlap(this.projectiles, this.enemies, (projectile, enemy) => {
      if (projectile instanceof Projectile && enemy instanceof Enemy) {
        this.handleProjectileHit(projectile, enemy);
      }
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (player instanceof Player && enemy instanceof Enemy) {
        this.handlePlayerEnemyOverlap(player, enemy);
      }
    });

    this.physics.add.overlap(this.orbitals, this.enemies, (orbital, enemy) => {
      if (orbital instanceof Orbital && enemy instanceof Enemy) {
        this.handleOrbitalHit(orbital, enemy);
      }
    });

    this.physics.add.overlap(this.returningArrows, this.enemies, (arrow, enemy) => {
      if (arrow instanceof ReturningArrow && enemy instanceof Enemy) {
        this.handleReturningArrowHit(arrow, enemy);
      }
    });
  }

  private handleProjectileHit(projectile: Projectile, enemy: Enemy): void {
    if (!projectile.active || !enemy.active || this.gameOver) {
      return;
    }

    const enemyDied = enemy.takeDamage(projectile.damage);
    projectile.registerHit();

    if (enemyDied) {
      this.handleEnemyDefeated(enemy);
    }
  }

  private handleOrbitalHit(orbital: Orbital, enemy: Enemy): void {
    if (!orbital.active || !enemy.active || !orbital.canDamage(enemy) || this.gameOver) {
      return;
    }

    orbital.registerDamage(enemy);
    const enemyDied = enemy.takeDamage(orbital.damage);

    if (enemyDied) {
      this.handleEnemyDefeated(enemy);
    }
  }

  private handlePlayerEnemyOverlap(player: Player, enemy: Enemy): void {
    if (!player.active || !enemy.active || this.gameOver) {
      return;
    }

    if (this.time.now - this.lastPlayerHitAt < PLAYER_ENEMY_HIT_COOLDOWN_MS) {
      return;
    }

    this.lastPlayerHitAt = this.time.now;
    player.takeDamage(enemy.damage);

    const direction = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y);
    if (direction.lengthSq() === 0) {
      direction.set(1, 0);
    }
    direction.normalize();

    player.setPosition(
      Phaser.Math.Clamp(player.x + direction.x * PLAYER_KNOCKBACK_DISTANCE, player.width / 2, WORLD_WIDTH - player.width / 2),
      Phaser.Math.Clamp(player.y + direction.y * PLAYER_KNOCKBACK_DISTANCE, player.height / 2, WORLD_HEIGHT - player.height / 2)
    );
    player.setVelocity(direction.x * PLAYER_KNOCKBACK_SPEED, direction.y * PLAYER_KNOCKBACK_SPEED);
    enemy.setVelocity(-direction.x * ENEMY_KNOCKBACK_SPEED, -direction.y * ENEMY_KNOCKBACK_SPEED);
  }

  private handleReturningArrowHit(arrow: ReturningArrow, enemy: Enemy): void {
    if (!arrow.active || !enemy.active || !arrow.canDamage(enemy) || this.gameOver) {
      return;
    }

    arrow.registerDamage(enemy);
    const enemyDied = enemy.takeDamage(arrow.damage);

    if (enemyDied) {
      this.handleEnemyDefeated(enemy);
    }
  }

  private handleEnemyDefeated(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }

    this.kills += 1;
    this.audioSystem.playHit();

    const coinCount = Phaser.Math.Clamp(Math.round(enemy.xpValue / 10), 1, 3);
    this.xpSystem.spawnCoinsFromEnemy(enemy.x, enemy.y, enemy.xpValue, coinCount);

    enemy.disableBody(true, true);
  }

  private queueUpgradeMenu(): void {
    this.pendingUpgradeSelections += 1;

    if (!this.upgradeMenu) {
      this.openUpgradeMenu();
    }
  }

  private openUpgradeMenu(): void {
    if (this.pendingUpgradeSelections <= 0 || this.upgradeMenu || this.gameOver) {
      return;
    }

    const context: UpgradeContext = {
      player: this.player,
      shootingSystem: this.shootingSystem,
      onOrbitalAdded: () => {
        this.addOrbital();
      },
      onReturningArrowAdded: () => {
        this.addReturningArrow();
      },
    };

    this.upgradeMenu = new UpgradeMenu({
      scene: this,
      upgrades: this.upgrades,
      context,
      onPause: () => {
        this.loopPaused = true;
        this.physics.world.pause();
      },
      onResume: () => {
        this.pendingUpgradeSelections = Math.max(0, this.pendingUpgradeSelections - 1);
        this.upgradeMenu = null;
        this.loopPaused = false;
        this.physics.world.resume();
        if (this.pendingUpgradeSelections > 0) {
          this.openUpgradeMenu();
        }
      },
      audioLevelUp: () => {
        this.audioSystem.playLevelUp();
      },
    });
  }

  private addOrbital(): void {
    const orbitalCount = this.orbitals.getChildren().filter((child) => child.active).length + 1;
    const orbital = new Orbital(this, this.getPlayerPosition, orbitalCount - 1, orbitalCount);
    this.orbitals.add(orbital, true);
    this.refreshOrbitalSlots();
  }

  private refreshOrbitalSlots(): void {
    const activeOrbitals = this.orbitals
      .getChildren()
      .filter((child): child is Orbital => child instanceof Orbital && child.active);

    activeOrbitals.forEach((orbital, index) => {
      orbital.setOrbitSlot(index, activeOrbitals.length);
    });
  }

  private addReturningArrow(): void {
    const activeCount = this.returningArrows.getChildren().filter((child) => child.active).length + 1;
    const arrow = new ReturningArrow(this, this.getPlayerPosition, this.enemies, activeCount - 1, activeCount);
    this.returningArrows.add(arrow, true);
    this.refreshReturningArrowSlots();
  }

  private refreshReturningArrowSlots(): void {
    const activeArrows = this.returningArrows
      .getChildren()
      .filter((child): child is ReturningArrow => child instanceof ReturningArrow && child.active);

    activeArrows.forEach((arrow, index) => {
      arrow.setOrbitSlot(index, activeArrows.length);
    });
  }

  private updateReturningArrows(time: number, delta: number): void {
    this.returningArrows.getChildren().forEach((child) => {
      if (child instanceof ReturningArrow && child.active) {
        child.update(time, delta);
      }
    });
  }

  private updateHUD(): void {
    this.hud.update({
      timeSeconds: this.getTimeSurvivedSeconds(),
      difficultyLevel: Math.floor(this.survivalTimeMs / 30000) + 1,
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      level: this.getLevel(),
      xp: this.xpSystem.xp,
      nextLevelXp: this.xpSystem.nextLevelXp,
      kills: this.getKills(),
      score: this.getScore(),
      upgrades: this.upgrades,
    });
  }

  private updateOrbitals(time: number): void {
    this.orbitals.getChildren().forEach((child) => {
      if (child instanceof Orbital && child.active) {
        child.update(time);
      }
    });
  }

  private applyRegen(): void {
    while (this.regenAccumulatorMs >= REGEN_TICK_MS) {
      applyHpRegenTick(this.player, this.upgrades, REGEN_TICK_MS);
      this.regenAccumulatorMs -= REGEN_TICK_MS;
    }
  }

  private handlePlayerDeath(): void {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.loopPaused = true;
    this.physics.world.pause();
    this.audioSystem.playGameOver();

    const gameOverData: GameOverData = {
      username: this.getUsername(),
      timeSurvived: this.getTimeSurvivedSeconds(),
      level: this.getLevel(),
      kills: this.kills,
      score: this.getScore(),
    };

    this.scene.start('GameOverScene', gameOverData);
  }

  private getUsername(): string {
    const username = this.registry.get('username');
    return typeof username === 'string' && username.trim().length > 0 ? username : 'Unknown Knight';
  }

  private readonly getPlayerPosition = (): Phaser.Types.Math.Vector2Like => ({
    x: this.player.x,
    y: this.player.y,
  });

  private exposeDebugGlobals(): void {
    window.gameScene = this;
    window.xpSystem = this.xpSystem;
    window.player = this.player;
  }

  private clearDebugGlobals(): void {
    if (window.gameScene === this) {
      delete window.gameScene;
    }
    if (window.xpSystem === this.xpSystem) {
      delete window.xpSystem;
    }
    if (window.player === this.player) {
      delete window.player;
    }
  }
}

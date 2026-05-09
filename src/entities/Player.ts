import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  speed: number;

  private keys: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private readonly hpBarWidth = 32;
  private readonly hpBarHeight = 4;
  private readonly hpBarOffset = 22;

  private isDead: boolean;
  private onHitCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onHit?: () => void
  ) {
    super(scene, x, y, 'player');

    this.hp = 100;
    this.maxHp = 100;
    this.speed = 200;
    this.isDead = false;
    this.onHitCallback = onHit;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input not available');
    }

    this.keys = {
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
    this.drawHpBar();
  }

  update(): void {
    if (this.isDead) {
      return;
    }

    this.handleMovement();
    this.clampToBounds();
    this.updateHpBarPosition();
  }

  private handleMovement(): void {
    let velocityX = 0;
    let velocityY = 0;

    if (this.keys.w.isDown || this.keys.up.isDown) {
      velocityY -= 1;
    }
    if (this.keys.s.isDown || this.keys.down.isDown) {
      velocityY += 1;
    }
    if (this.keys.a.isDown || this.keys.left.isDown) {
      velocityX -= 1;
    }
    if (this.keys.d.isDown || this.keys.right.isDown) {
      velocityX += 1;
    }

    if (velocityX !== 0 || velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / length) * this.speed;
      velocityY = (velocityY / length) * this.speed;
    }

    this.setVelocity(velocityX, velocityY);
  }

  private clampToBounds(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    const minX = halfWidth;
    const maxX = 1600 - halfWidth;
    const minY = halfHeight;
    const maxY = 1200 - halfHeight;

    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
    this.y = Phaser.Math.Clamp(this.y, minY, maxY);
  }

  takeDamage(amount: number): void {
    if (this.isDead || amount <= 0) {
      return;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.drawHpBar();
    this.flashDamage();

    if (this.onHitCallback) {
      this.onHitCallback();
    }

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      this.setVelocity(0, 0);
      this.scene.events.emit('player-death');
    }
  }

  heal(amount: number): void {
    if (this.isDead || amount <= 0) {
      return;
    }

    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.drawHpBar();
  }

  getHealthRatio(): number {
    return this.maxHp > 0 ? this.hp / this.maxHp : 0;
  }

  private flashDamage(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 0,
    });
  }

  private updateHpBarPosition(): void {
    this.drawHpBar();
  }

  private drawHpBar(): void {
    this.hpBarBg.clear();
    this.hpBarFill.clear();

    const barX = this.x - this.hpBarWidth / 2;
    const barY = this.y - this.hpBarOffset;

    this.hpBarBg.fillStyle(0x000000, 0.6);
    this.hpBarBg.fillRect(barX, barY, this.hpBarWidth, this.hpBarHeight);

    const ratio = this.getHealthRatio();
    const fillWidth = Math.max(0, this.hpBarWidth * ratio);

    const color = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000;

    this.hpBarFill.fillStyle(color, 1);
    this.hpBarFill.fillRect(barX, barY, fillWidth, this.hpBarHeight);
  }

  destroy(fromScene?: boolean): void {
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    super.destroy(fromScene);
  }
}

import Phaser from 'phaser';

const PICKUP_RADIUS = 100;
const MAGNET_SPEED = 200;
const PICKUP_DISTANCE = 16;

export class Coin extends Phaser.Physics.Arcade.Sprite {
  xpValue: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'coin');

    this.xpValue = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.setOrigin(0.5);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setAllowGravity(false);
    }
  }

  spawn(x: number, y: number, value: number): void {
    this.xpValue = value;
    this.setPosition(x, y);
    this.enableBody(true, x, y, true, true);
  }

  update(playerPosition: Phaser.Types.Math.Vector2Like): number | null {
    if (!this.active) {
      return null;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerPosition.x,
      playerPosition.y
    );

    if (distance <= PICKUP_RADIUS) {
      this.scene.physics.moveTo(
        this,
        playerPosition.x,
        playerPosition.y,
        MAGNET_SPEED
      );
    } else {
      const body = this.body as Phaser.Physics.Arcade.Body | null;
      if (body) {
        body.setVelocity(0, 0);
      }
    }

    if (distance < PICKUP_DISTANCE) {
      const value = this.xpValue;
      this.deactivate();
      return value;
    }

    return null;
  }

  deactivate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) {
      body.setVelocity(0, 0);
    }

    this.disableBody(true, true);
  }
}

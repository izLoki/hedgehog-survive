import Phaser from 'phaser';

type TextureSpec = {
  key: string;
  width: number;
  height: number;
  draw: (graphics: Phaser.GameObjects.Graphics) => void;
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.generateMedievalTextures();
    this.showBootScreen();
  }

  private showBootScreen(): void {
    this.add.text(400, 250, 'Knight Survivor', {
      fontSize: '42px',
      color: '#c9b037',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(400, 310, 'Loading...', {
      fontSize: '18px',
      color: '#a09080',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.time.delayedCall(800, () => {
      this.scene.start('MenuScene');
    });
  }

  private generateMedievalTextures(): void {
    const specs: TextureSpec[] = [
      {
        key: 'player',
        width: 32,
        height: 32,
        draw: (graphics) => {
          graphics.fillStyle(0x4a6fa5, 1);
          graphics.fillRect(8, 10, 16, 18);
          graphics.fillStyle(0xc9b037, 1);
          graphics.fillRect(10, 4, 12, 10);
          graphics.fillStyle(0x2f425f, 1);
          graphics.fillRect(12, 8, 8, 3);
        },
      },
      {
        key: 'enemy-basic',
        width: 32,
        height: 32,
        draw: (graphics) => {
          graphics.fillStyle(0xe8e0d5, 1);
          graphics.fillRect(10, 12, 12, 16);
          graphics.fillRect(9, 5, 14, 10);
          graphics.fillStyle(0x2a1f1d, 1);
          graphics.fillRect(12, 8, 3, 3);
          graphics.fillRect(17, 8, 3, 3);
        },
      },
      {
        key: 'enemy-fast',
        width: 32,
        height: 32,
        draw: (graphics) => {
          graphics.fillStyle(0x8b4513, 1);
          graphics.fillTriangle(16, 10, 3, 24, 15, 22);
          graphics.fillTriangle(16, 10, 29, 24, 17, 22);
          graphics.fillCircle(16, 17, 5);
        },
      },
      {
        key: 'enemy-tank',
        width: 32,
        height: 32,
        draw: (graphics) => {
          graphics.fillStyle(0x2d5016, 1);
          graphics.fillRect(5, 8, 22, 20);
          graphics.fillStyle(0x3f6f20, 1);
          graphics.fillRect(8, 4, 16, 8);
          graphics.fillStyle(0x1a2f0d, 1);
          graphics.fillRect(11, 7, 10, 3);
        },
      },
      {
        key: 'enemy-shooter',
        width: 32,
        height: 32,
        draw: (graphics) => {
          graphics.fillStyle(0xe8e0d5, 1);
          graphics.fillRect(10, 12, 12, 16);
          graphics.fillRect(9, 5, 14, 10);
          graphics.lineStyle(2, 0x8b4513, 1);
          graphics.strokeCircle(24, 17, 7);
        },
      },
      {
        key: 'projectile',
        width: 16,
        height: 16,
        draw: (graphics) => {
          graphics.fillStyle(0xa0a0a0, 1);
          graphics.fillTriangle(13, 8, 3, 3, 5, 8);
          graphics.fillTriangle(13, 8, 3, 13, 5, 8);
          graphics.fillStyle(0x5f5f5f, 1);
          graphics.fillRect(2, 6, 4, 4);
        },
      },
      {
        key: 'coin',
        width: 16,
        height: 16,
        draw: (graphics) => {
          graphics.fillStyle(0xb8860b, 1);
          graphics.fillCircle(8, 8, 7);
          graphics.fillStyle(0xffd700, 1);
          graphics.fillCircle(8, 8, 5);
          graphics.fillStyle(0xb8860b, 1);
          graphics.fillRect(7, 4, 2, 8);
        },
      },
      {
        key: 'orbital',
        width: 20,
        height: 20,
        draw: (graphics) => {
          graphics.fillStyle(0x3a8cc1, 1);
          graphics.fillCircle(10, 10, 9);
          graphics.fillStyle(0x87ceeb, 1);
          graphics.fillCircle(10, 10, 6);
          graphics.fillStyle(0xffffff, 0.8);
          graphics.fillCircle(7, 7, 2);
        },
      },
      {
        key: 'button-wood',
        width: 160,
        height: 48,
        draw: (graphics) => {
          graphics.fillStyle(0x654321, 1);
          graphics.fillRect(0, 0, 160, 48);
          graphics.fillStyle(0x8b4513, 1);
          graphics.fillRect(4, 4, 152, 40);
          graphics.lineStyle(2, 0xa0522d, 1);
          graphics.strokeRect(8, 8, 144, 32);
        },
      },
    ];

    specs.forEach((spec) => {
      this.generateTexture(spec);
    });
  }

  private generateTexture(spec: TextureSpec): void {
    if (this.textures.exists(spec.key)) {
      this.textures.remove(spec.key);
    }

    const graphics = this.add.graphics({ x: 0, y: 0 });
    graphics.clear();
    spec.draw(graphics);
    graphics.generateTexture(spec.key, spec.width, spec.height);
    graphics.destroy();
  }

}

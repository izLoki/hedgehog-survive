import Phaser from 'phaser';

interface GameOverData {
  username?: string;
  score?: number;
  timeSurvived?: number;
  level?: number;
  kills?: number;
}

export class GameOverScene extends Phaser.Scene {
  private dataReceived: GameOverData = {};

  constructor() {
    super('GameOverScene');
  }

  init(data: GameOverData): void {
    this.dataReceived = data;
  }

  create(): void {
    this.add.rectangle(400, 300, 800, 600, 0x1a120f);

    this.add.text(400, 120, 'Game Over', {
      fontSize: '48px',
      color: '#ff4444',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    const score = this.dataReceived.score ?? 0;
    const timeSurvived = this.dataReceived.timeSurvived ?? 0;
    const level = this.dataReceived.level ?? 1;
    const kills = this.dataReceived.kills ?? 0;
    const username = this.dataReceived.username ?? 'Unknown Knight';

    const minutes = Math.floor(timeSurvived / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeSurvived % 60).toString().padStart(2, '0');

    this.add.text(400, 200, `Score: ${score}`, {
      fontSize: '28px',
      color: '#ffd700',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(400, 160, `Knight: ${username}`, {
      fontSize: '18px',
      color: '#a09080',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(400, 250, `Time: ${minutes}:${seconds}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(400, 285, `Level: ${level}  |  Kills: ${kills}`, {
      fontSize: '18px',
      color: '#a09080',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.createRetryButton();
    this.createMenuButton();
  }

  private createRetryButton(): void {
    const buttonBg = this.add.image(400, 380, 'button-wood').setInteractive({ useHandCursor: true });
    this.add.text(400, 380, 'Retry', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setTint(0xd2a679);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clearTint();
    });

    buttonBg.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }

  private createMenuButton(): void {
    const buttonBg = this.add.image(400, 460, 'button-wood').setInteractive({ useHandCursor: true });
    this.add.text(400, 460, 'Menu', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setTint(0xd2a679);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clearTint();
    });

    buttonBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

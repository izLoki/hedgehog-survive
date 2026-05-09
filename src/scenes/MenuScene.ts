import Phaser from 'phaser';
import { getTopRankings } from '../api/supabase';
import { AudioSystem } from '../systems/AudioSystem';
import type { Ranking } from '../types/ranking';

export class MenuScene extends Phaser.Scene {
  private audioSystem: AudioSystem;
  private usernameInput!: Phaser.GameObjects.DOMElement;
  private errorText!: Phaser.GameObjects.Text;
  private rankingsContainer!: Phaser.GameObjects.Container;
  private rankingsTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('MenuScene');
    this.audioSystem = new AudioSystem();
  }

  create(): void {
    this.createBackground();
    this.createDecorations();
    this.createTitle();
    this.createUsernameInput();
    this.createPlayButton();
    this.createErrorText();
    this.createRankingsPreview();
    this.loadRankings();
  }

  private createBackground(): void {
    this.add.rectangle(400, 300, 800, 600, 0x2a1f1d);

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x3d2f2b, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    graphics.strokePath();
  }

  private createDecorations(): void {
    const graphics = this.add.graphics();
    const gold = 0xc9b037;
    graphics.lineStyle(2, gold, 0.8);

    // Horizontal gold lines above title area
    graphics.moveTo(200, 85);
    graphics.lineTo(600, 85);
    graphics.moveTo(220, 90);
    graphics.lineTo(580, 90);

    // Horizontal gold lines below subtitle area
    graphics.moveTo(220, 200);
    graphics.lineTo(580, 200);
    graphics.moveTo(200, 205);
    graphics.lineTo(600, 205);

    // Small ornamental crosses at line ends
    const crossSize = 6;
    for (const cx of [200, 600]) {
      // Top line crosses
      graphics.moveTo(cx - crossSize, 85);
      graphics.lineTo(cx + crossSize, 85);
      graphics.moveTo(cx, 85 - crossSize);
      graphics.lineTo(cx, 85 + crossSize);
      // Bottom line crosses
      graphics.moveTo(cx - crossSize, 205);
      graphics.lineTo(cx + crossSize, 205);
      graphics.moveTo(cx, 205 - crossSize);
      graphics.lineTo(cx, 205 + crossSize);
    }

    graphics.strokePath();
  }

  private createTitle(): void {
    this.add.text(400, 120, 'Knight Survivor', {
      fontSize: '48px',
      color: '#c9b037',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    this.add.text(400, 175, 'Survive the Dungeon', {
      fontSize: '20px',
      color: '#a09080',
      fontFamily: 'serif',
    }).setOrigin(0.5);
  }

  private createUsernameInput(): void {
    const inputHTML = `
      <div style="pointer-events: none;">
        <input
          type="text"
          id="username-input"
          placeholder="Enter your name..."
          maxlength="20"
          style="
            width: 220px;
            padding: 10px 14px;
            font-size: 16px;
            font-family: serif;
            background: #3d2f2b;
            border: 2px solid #8b4513;
            border-radius: 4px;
            color: #ffffff;
            outline: none;
            text-align: center;
            pointer-events: auto;
          "
        />
      </div>
    `;

    this.usernameInput = this.add.dom(400, 280).createFromHTML(inputHTML);
    this.usernameInput.setOrigin(0.5);
    this.usernameInput.setPerspective(800);
  }

  private createPlayButton(): void {
    const buttonBg = this.add.image(400, 360, 'button-wood').setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(400, 360, 'PLAY', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'serif',
    }).setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setTint(0xa0522d);
      buttonText.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clearTint();
      buttonText.setScale(1);
    });

    buttonBg.on('pointerdown', () => {
      this.handlePlay();
    });
  }

  private createErrorText(): void {
    this.errorText = this.add.text(400, 410, '', {
      fontSize: '16px',
      color: '#ff6b6b',
      fontFamily: 'serif',
    }).setOrigin(0.5);
  }

  private createRankingsPreview(): void {
    this.rankingsContainer = this.add.container(400, 500);

    const titleText = this.add.text(0, -70, 'Top Knights', {
      fontSize: '18px',
      color: '#c9b037',
      fontFamily: 'serif',
    }).setOrigin(0.5);
    this.rankingsContainer.add(titleText);

    // Decorative line under title
    const decoGraphics = this.add.graphics();
    decoGraphics.lineStyle(1, 0xc9b037, 0.5);
    decoGraphics.moveTo(-80, -55);
    decoGraphics.lineTo(80, -55);
    decoGraphics.strokePath();
    this.rankingsContainer.add(decoGraphics);

    // Start 10s refresh timer
    this.rankingsTimer = this.time.addEvent({
      delay: 10000,
      callback: () => {
        this.loadRankings();
      },
      loop: true,
    });
  }

  private async loadRankings(): Promise<void> {
    // Clear existing ranking rows (keep first 2 children: title + deco line)
    while (this.rankingsContainer.length > 2) {
      const child = this.rankingsContainer.last;
      if (child) {
        this.rankingsContainer.remove(child, true);
      }
    }

    const rankings = await getTopRankings(5);

    if (rankings.length === 0) {
      const offlineText = this.add.text(0, 0, 'No rankings yet', {
        fontSize: '14px',
        color: '#887766',
        fontFamily: 'serif',
      }).setOrigin(0.5);
      this.rankingsContainer.add(offlineText);
      return;
    }

    let yOffset = -30;
    for (let i = 0; i < rankings.length; i++) {
      const row = this.createRankingRow(rankings[i], i + 1, yOffset);
      this.rankingsContainer.add(row);
      yOffset += 22;
    }
  }

  private createRankingRow(ranking: Ranking, rank: number, y: number): Phaser.GameObjects.Text {
    const label = `${rank}. ${ranking.name} - ${ranking.score} - ${this.formatTime(ranking.time_survived)}`;
    const color = rank === 1 ? '#ffd700' : '#ccccbb';
    return this.add.text(0, y, label, {
      fontSize: '14px',
      color,
      fontFamily: 'serif',
    }).setOrigin(0.5);
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private handlePlay(): void {
    const inputEl = this.usernameInput.getChildByID('username-input') as HTMLInputElement | null;
    if (!inputEl) {
      this.showError('Enter username');
      return;
    }

    const rawValue = inputEl.value;
    const username = rawValue.trim().slice(0, 20);

    if (username.length === 0) {
      this.showError('Enter username');
      return;
    }

    this.errorText.setText('');
    this.registry.set('username', username);

    this.audioSystem.resume().then(
      () => {
        /* audio context resumed or already running */
      },
      () => {
        /* resume failed; proceed anyway */
      }
    );

    this.scene.start('GameScene');
  }

  private showError(message: string): void {
    this.errorText.setText(message);
    this.tweens.add({
      targets: this.errorText,
      alpha: 0,
      duration: 150,
      yoyo: true,
      repeat: 1,
    });
  }

  shutdown(): void {
    if (this.rankingsTimer) {
      this.rankingsTimer.remove();
    }
  }
}

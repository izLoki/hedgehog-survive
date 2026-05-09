import Phaser from 'phaser';
import {
  applyUpgrade,
  pickRandomUpgrades,
  type UpgradeContext,
  type Upgrades,
} from '../systems/UpgradeSystem';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 140;
const CARD_SPACING = 24;
const CARD_COLOR = 0x3d2b1f;
const CARD_BORDER = 0x654321;
const CARD_HOVER = 0x5a3e2a;
const TEXT_NAME_COLOR = '#c9b037';
const TEXT_DESC_COLOR = '#a09080';
const BG_ALPHA = 0.85;

export interface UpgradeMenuConfig {
  scene: Phaser.Scene;
  upgrades: Upgrades;
  context: UpgradeContext;
  onPause?: () => void;
  onResume?: () => void;
  audioLevelUp?: () => void;
}

export class UpgradeMenu extends Phaser.GameObjects.Container {
  private readonly upgrades: Upgrades;
  private readonly context: UpgradeContext;
  private readonly onPause?: () => void;
  private readonly onResume?: () => void;
  private readonly audioLevelUp?: () => void;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private cards: Phaser.GameObjects.Container[] = [];

  constructor(config: UpgradeMenuConfig) {
    super(config.scene, 0, 0);

    this.upgrades = config.upgrades;
    this.context = config.context;
    this.onPause = config.onPause;
    this.onResume = config.onResume;
    this.audioLevelUp = config.audioLevelUp;

    const camera = config.scene.cameras.main;
    const width = camera.width;
    const height = camera.height;

    this.bg = config.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x1a120f,
      BG_ALPHA
    );
    this.bg.setScrollFactor(0);
    this.bg.setDepth(100);
    this.add(this.bg);

    const title = config.scene.add.text(width / 2, height * 0.2, 'Level Up!', {
      fontSize: '36px',
      color: '#c9b037',
      fontFamily: 'serif',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(101);
    this.add(title);

    const options = pickRandomUpgrades(this.upgrades, 3);
    const totalWidth =
      options.length * CARD_WIDTH + (options.length - 1) * CARD_SPACING;
    const startX = (width - totalWidth) / 2 + CARD_WIDTH / 2;
    const cardY = height * 0.55;

    options.forEach((def, index) => {
      const cardX = startX + index * (CARD_WIDTH + CARD_SPACING);
      const card = this.createCard(cardX, cardY, def);
      this.add(card);
      this.cards.push(card);
    });

    config.scene.add.existing(this);
    this.setDepth(100);
    this.onPause?.();
    this.audioLevelUp?.();
  }

  private createCard(
    x: number,
    y: number,
    def: ReturnType<typeof pickRandomUpgrades>[number]
  ): Phaser.GameObjects.Container {
    const scene = this.scene;
    const card = scene.add.container(x, y);
    card.setScrollFactor(0);

    const graphics = scene.add.graphics();
    this.drawCardBackground(graphics, CARD_COLOR);
    card.add(graphics);

    const nameText = scene.add.text(0, -CARD_HEIGHT * 0.25, def.name, {
      fontSize: '22px',
      color: TEXT_NAME_COLOR,
      fontFamily: 'serif',
      fontStyle: 'bold',
    });
    nameText.setOrigin(0.5);
    card.add(nameText);

    const descText = scene.add.text(0, CARD_HEIGHT * 0.1, def.description, {
      fontSize: '14px',
      color: TEXT_DESC_COLOR,
      fontFamily: 'serif',
      align: 'center',
      wordWrap: { width: CARD_WIDTH - 24 },
    });
    descText.setOrigin(0.5);
    card.add(descText);

    const levelText = scene.add.text(
      0,
      CARD_HEIGHT * 0.4,
      this.getLevelLabel(def.id),
      {
        fontSize: '12px',
        color: '#888080',
        fontFamily: 'serif',
      }
    );
    levelText.setOrigin(0.5);
    card.add(levelText);

    const hitArea = new Phaser.Geom.Rectangle(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
    card.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    card.on('pointerover', () => {
      this.drawCardBackground(graphics, CARD_HOVER);
      scene.tweens.add({
        targets: card,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: 'Sine.easeInOut',
      });
    });

    card.on('pointerout', () => {
      this.drawCardBackground(graphics, CARD_COLOR);
      scene.tweens.add({
        targets: card,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 150,
        ease: 'Sine.easeInOut',
      });
    });

    card.on('pointerdown', () => {
      this.selectUpgrade(def.id);
    });

    return card;
  }

  private drawCardBackground(
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ): void {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      8
    );
    graphics.lineStyle(2, CARD_BORDER, 1);
    graphics.strokeRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      8
    );
  }

  private getLevelLabel(id: keyof Upgrades): string {
    if (id === 'piercing') {
      return this.upgrades.piercing ? 'Owned' : 'New';
    }
    const level = this.upgrades[id] as number;
    return level > 0 ? `Level ${level + 1}` : 'New';
  }

  private selectUpgrade(id: keyof Upgrades): void {
    applyUpgrade(id, this.upgrades, this.context);
    this.destroy();
    this.onResume?.();
  }

  override destroy(fromScene?: boolean): void {
    this.cards = [];
    super.destroy(fromScene);
  }
}

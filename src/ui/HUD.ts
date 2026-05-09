import Phaser from 'phaser';
import type { Upgrades } from '../systems/UpgradeSystem';

export interface HUDData {
  timeSeconds: number;
  difficultyLevel: number;
  difficultyText?: string;
  playerHp: number;
  playerMaxHp: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  kills: number;
  score: number;
  upgrades: Upgrades & { arrow?: number; returningArrow?: number };
}

interface PowerupMarker {
  key: string;
  label: string;
  getValue: (u: HUDData['upgrades']) => number | boolean;
}

const POWERUP_MARKERS: PowerupMarker[] = [
  { key: 'damage', label: 'DMG', getValue: (u) => u.damage },
  { key: 'attackSpeed', label: 'SPD', getValue: (u) => u.attackSpeed },
  { key: 'maxHp', label: 'HP', getValue: (u) => u.maxHp },
  { key: 'hpRegen', label: 'REG', getValue: (u) => u.hpRegen },
  { key: 'multiShot', label: 'MULT', getValue: (u) => u.multiShot },
  { key: 'piercing', label: 'PRC', getValue: (u) => (u.piercing ? 1 : 0) },
  { key: 'orbitals', label: 'ORB', getValue: (u) => u.orbitals },
  { key: 'arrow', label: 'ARR', getValue: (u) => u.arrow ?? 0 },
  { key: 'returningArrows', label: 'RAR', getValue: (u) => u.returningArrows },
];

const COLOR_GOLD = '#ffd700';
const COLOR_GOLD_DIM = '#8a7a30';
const COLOR_WHITE = '#ffffff';
const COLOR_RED = '#ff0000';
const COLOR_RED_DARK = '#8b0000';
const COLOR_GRAY_DARK = '#333333';
const COLOR_GRAY_FILL = '#555555';
const COLOR_BLACK = '#000000';

const FONT_FAMILY = 'serif';
const DEPTH_HUD = 200;

export class HUD extends Phaser.GameObjects.Container {
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly difficultyText: Phaser.GameObjects.Text;
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly hpBg: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly xpBg: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly killsText: Phaser.GameObjects.Text;
  private readonly nextPowerupText: Phaser.GameObjects.Text;
  private readonly markerTexts: Phaser.GameObjects.Text[] = [];
  private readonly markerBgs: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    const camera = scene.cameras.main;
    const cx = camera.width / 2;
    const cy = camera.height;

    // Timer (top center)
    this.timerText = scene.add.text(cx, 24, '00:00', {
      fontSize: '32px',
      color: COLOR_GOLD,
      fontFamily: FONT_FAMILY,
      fontStyle: 'bold',
      stroke: COLOR_BLACK,
      strokeThickness: 4,
    });
    this.timerText.setOrigin(0.5);
    this.timerText.setScrollFactor(0);
    this.timerText.setDepth(DEPTH_HUD);
    this.add(this.timerText);

    // Timer background
    const timerBg = scene.add.rectangle(
      cx,
      24,
      this.timerText.width + 24,
      this.timerText.height + 12,
      0x000000,
      0.5
    );
    timerBg.setScrollFactor(0);
    timerBg.setDepth(DEPTH_HUD - 1);
    this.add(timerBg);

    // Difficulty text (below timer)
    this.difficultyText = scene.add.text(cx, 50, '', {
      fontSize: '14px',
      color: COLOR_GOLD_DIM,
      fontFamily: FONT_FAMILY,
    });
    this.difficultyText.setOrigin(0.5);
    this.difficultyText.setScrollFactor(0);
    this.difficultyText.setDepth(DEPTH_HUD);
    this.add(this.difficultyText);

    // Score (top right)
    this.scoreText = scene.add.text(camera.width - 16, 20, 'Score: 0', {
      fontSize: '16px',
      color: COLOR_WHITE,
      fontFamily: FONT_FAMILY,
      fontStyle: 'bold',
      stroke: COLOR_BLACK,
      strokeThickness: 3,
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(DEPTH_HUD);
    this.add(this.scoreText);

    // Powerup markers (below difficulty, compact row)
    this.createPowerupMarkers(scene, cx, 72);

    // XP bar (bottom left, above HP)
    const barX = 16;
    const barW = 140;
    const xpBarY = cy - 36;
    this.xpBg = scene.add.rectangle(barX, xpBarY, barW, 6, parseInt(COLOR_GRAY_DARK.slice(1), 16));
    this.xpBg.setOrigin(0, 0.5);
    this.xpBg.setScrollFactor(0);
    this.xpBg.setDepth(DEPTH_HUD - 1);
    this.add(this.xpBg);

    this.xpFill = scene.add.rectangle(barX, xpBarY, 0, 6, parseInt(COLOR_GOLD.slice(1), 16));
    this.xpFill.setOrigin(0, 0.5);
    this.xpFill.setScrollFactor(0);
    this.xpFill.setDepth(DEPTH_HUD);
    this.add(this.xpFill);

    // Next powerup text (left of XP bar or below it)
    this.nextPowerupText = scene.add.text(barX, xpBarY - 10, '', {
      fontSize: '11px',
      color: COLOR_GOLD_DIM,
      fontFamily: FONT_FAMILY,
    });
    this.nextPowerupText.setOrigin(0, 0.5);
    this.nextPowerupText.setScrollFactor(0);
    this.nextPowerupText.setDepth(DEPTH_HUD);
    this.add(this.nextPowerupText);

    // HP bar (bottom left)
    const hpBarY = cy - 18;
    this.hpBg = scene.add.rectangle(barX, hpBarY, barW, 12, parseInt(COLOR_RED_DARK.slice(1), 16));
    this.hpBg.setOrigin(0, 0.5);
    this.hpBg.setScrollFactor(0);
    this.hpBg.setDepth(DEPTH_HUD - 1);
    this.add(this.hpBg);

    this.hpFill = scene.add.rectangle(barX, hpBarY, barW, 12, parseInt(COLOR_RED.slice(1), 16));
    this.hpFill.setOrigin(0, 0.5);
    this.hpFill.setScrollFactor(0);
    this.hpFill.setDepth(DEPTH_HUD);
    this.add(this.hpFill);

    // HP text
    this.hpText = scene.add.text(barX + barW / 2, hpBarY, 'HP: 100/100', {
      fontSize: '12px',
      color: COLOR_WHITE,
      fontFamily: FONT_FAMILY,
      fontStyle: 'bold',
    });
    this.hpText.setOrigin(0.5);
    this.hpText.setScrollFactor(0);
    this.hpText.setDepth(DEPTH_HUD + 1);
    this.add(this.hpText);

    // Level (bottom center)
    this.levelText = scene.add.text(cx, cy - 18, 'Lvl: 1', {
      fontSize: '18px',
      color: COLOR_GOLD,
      fontFamily: FONT_FAMILY,
      fontStyle: 'bold',
      stroke: COLOR_BLACK,
      strokeThickness: 3,
    });
    this.levelText.setOrigin(0.5);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(DEPTH_HUD);
    this.add(this.levelText);

    // Kills (bottom right)
    this.killsText = scene.add.text(camera.width - 16, cy - 18, '\u2694 0', {
      fontSize: '16px',
      color: COLOR_WHITE,
      fontFamily: FONT_FAMILY,
      fontStyle: 'bold',
      stroke: COLOR_BLACK,
      strokeThickness: 3,
    });
    this.killsText.setOrigin(1, 0.5);
    this.killsText.setScrollFactor(0);
    this.killsText.setDepth(DEPTH_HUD);
    this.add(this.killsText);

    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(DEPTH_HUD);
  }

  private createPowerupMarkers(scene: Phaser.Scene, cx: number, y: number): void {
    const markerW = 44;
    const markerH = 22;
    const spacing = 6;
    const totalW = POWERUP_MARKERS.length * markerW + (POWERUP_MARKERS.length - 1) * spacing;
    let x = cx - totalW / 2 + markerW / 2;

    for (const marker of POWERUP_MARKERS) {
      const bg = scene.add.rectangle(x, y, markerW, markerH, 0x1a120f, 0.8);
      bg.setScrollFactor(0);
      bg.setDepth(DEPTH_HUD - 1);
      this.add(bg);
      this.markerBgs.push(bg);

      const text = scene.add.text(x, y, marker.label, {
        fontSize: '10px',
        color: COLOR_GRAY_FILL,
        fontFamily: FONT_FAMILY,
        fontStyle: 'bold',
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      text.setDepth(DEPTH_HUD);
      this.add(text);
      this.markerTexts.push(text);

      x += markerW + spacing;
    }
  }

  update(data: HUDData): void {
    // Timer
    const minutes = Math.floor(data.timeSeconds / 60);
    const seconds = data.timeSeconds % 60;
    this.timerText.setText(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    );

    // Difficulty
    const diffLabel = data.difficultyText ?? `Stage ${data.difficultyLevel}`;
    this.difficultyText.setText(diffLabel);

    // Score
    this.scoreText.setText(`Score: ${data.score}`);

    // HP bar
    const hpRatio = data.playerMaxHp > 0 ? data.playerHp / data.playerMaxHp : 0;
    const hpWidth = Math.max(0, Math.min(1, hpRatio)) * 140;
    this.hpFill.width = hpWidth;
    this.hpText.setText(`HP: ${data.playerHp}/${data.playerMaxHp}`);

    // XP bar
    const xpRatio = data.nextLevelXp > 0 ? data.xp / data.nextLevelXp : 0;
    const xpWidth = Math.max(0, Math.min(1, xpRatio)) * 140;
    this.xpFill.width = xpWidth;

    // Next powerup coins needed
    const coinsNeeded = Math.max(0, data.nextLevelXp - data.xp);
    this.nextPowerupText.setText(`Next powerup: ${coinsNeeded} coins`);

    // Level
    this.levelText.setText(`Lvl: ${data.level}`);

    // Kills
    this.killsText.setText(`\u2694 ${data.kills}`);

    // Powerup markers
    for (let i = 0; i < POWERUP_MARKERS.length; i += 1) {
      const def = POWERUP_MARKERS[i];
      const value = def.getValue(data.upgrades);
      const isActive = typeof value === 'boolean' ? value : value > 0;
      const text = this.markerTexts[i];
      const bg = this.markerBgs[i];

      if (isActive) {
        const count = typeof value === 'boolean' ? 1 : value;
        text.setText(`${def.label} ${count}`);
        text.setColor(COLOR_GOLD);
        bg.setFillStyle(0x3d2b1f, 0.9);
      } else {
        text.setText(def.label);
        text.setColor(COLOR_GRAY_FILL);
        bg.setFillStyle(0x1a120f, 0.5);
      }
    }
  }
}

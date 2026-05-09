import type Phaser from 'phaser';
import type { Player } from '../entities/Player';

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1200;
export const WORLD_BACKGROUND_COLOR = 0x2a1f1d;

const GRID_COLOR = 0x3d2f2b;
const GRID_SPACING = 100;
const BORDER_COLOR = 0x8b4513;
const BORDER_THICKNESS = 4;

export function setupWorld(scene: Phaser.Scene, player?: Player): void {
  scene.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const camera = scene.cameras.main;
  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  camera.setBackgroundColor(WORLD_BACKGROUND_COLOR);

  if (player) {
    camera.startFollow(player, true, 0.1, 0.1);
    camera.setDeadzone(20, 20);
  }
}

export function drawWorldBackground(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();

  graphics.lineStyle(1, GRID_COLOR, 0.6);

  for (let x = 0; x <= WORLD_WIDTH; x += GRID_SPACING) {
    graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
  }

  for (let y = 0; y <= WORLD_HEIGHT; y += GRID_SPACING) {
    graphics.lineBetween(0, y, WORLD_WIDTH, y);
  }

  graphics.lineStyle(BORDER_THICKNESS, BORDER_COLOR, 1);
  graphics.strokeRect(
    BORDER_THICKNESS / 2,
    BORDER_THICKNESS / 2,
    WORLD_WIDTH - BORDER_THICKNESS,
    WORLD_HEIGHT - BORDER_THICKNESS
  );

  graphics.setDepth(-1);

  return graphics;
}

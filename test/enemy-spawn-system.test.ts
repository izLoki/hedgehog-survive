/**
 * T8 Validation Test Suite: Enemy.ts & SpawnSystem.ts
 * Run: npx tsx test/enemy-spawn-system.test.ts
 */

import Phaser from 'phaser';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Enemy, ENEMY_TYPES, ENEMY_STAT_TABLE, type EnemyType } from '../src/entities/Enemy';
import { SpawnSystem } from '../src/systems/SpawnSystem';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFakeScene(): Phaser.Scene {
  return {
    add: { existing: vi.fn() },
    physics: {
      add: { existing: vi.fn() },
      moveTo: vi.fn(),
    },
  } as unknown as Phaser.Scene;
}

function makeFakeGroup(): Phaser.Physics.Arcade.Group {
  const children = new Phaser.GameObjects.GameObjectsContainer(null as any);
  return {
    children,
    countActive: vi.fn(() => 0),
    add: vi.fn(),
  } as unknown as Phaser.Physics.Arcade.Group;
}

const BOUNDS = new Phaser.Geom.Rectangle(0, 0, 1600, 1200);

// ---------------------------------------------------------------------------
// ENEMY — exported API sanity
// ---------------------------------------------------------------------------

describe('Enemy — exported API sanity', () => {
  test('ENEMY_TYPES has exactly 4 literal values', () => {
    expect(ENEMY_TYPES).toHaveLength(4);
    expect(ENEMY_TYPES).toContain('basic');
    expect(ENEMY_TYPES).toContain('fast');
    expect(ENEMY_TYPES).toContain('tank');
    expect(ENEMY_TYPES).toContain('shooter');
  });

  test('ENEMY_STAT_TABLE has entry for every ENEMY_TYPE', () => {
    for (const type of ENEMY_TYPES) {
      expect(ENEMY_STAT_TABLE[type]).toBeDefined();
      expect(typeof ENEMY_STAT_TABLE[type].maxHealth).toBe('number');
      expect(typeof ENEMY_STAT_TABLE[type].speed).toBe('number');
      expect(typeof ENEMY_STAT_TABLE[type].damage).toBe('number');
      expect(typeof ENEMY_STAT_TABLE[type].xpValue).toBe('number');
      expect(typeof ENEMY_STAT_TABLE[type].textureKey).toBe('string');
    }
  });

  test('each enemy type has positive stats', () => {
    for (const type of ENEMY_TYPES) {
      const s = ENEMY_STAT_TABLE[type];
      expect(s.maxHealth).toBeGreaterThan(0);
      expect(s.speed).toBeGreaterThan(0);
      expect(s.damage).toBeGreaterThan(0);
      expect(s.xpValue).toBeGreaterThan(0);
    }
  });

  test('constructor assigns correct stats for each type', () => {
    const scene = makeFakeScene();
    for (const type of ENEMY_TYPES) {
      const e = new Enemy(scene, 100, 100, type);
      expect(e.enemyType).toBe(type);
      expect(e.maxHealth).toBe(ENEMY_STAT_TABLE[type].maxHealth);
      expect(e.speed).toBe(ENEMY_STAT_TABLE[type].speed);
      expect(e.damage).toBe(ENEMY_STAT_TABLE[type].damage);
      expect(e.xpValue).toBe(ENEMY_STAT_TABLE[type].xpValue);
      expect(e.health).toBe(ENEMY_STAT_TABLE[type].maxHealth);
    }
  });

  test('Enemy getter: health returns current healthPoints', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    expect(e.health).toBe(ENEMY_STAT_TABLE.basic.maxHealth);
    e.takeDamage(10);
    expect(e.health).toBe(ENEMY_STAT_TABLE.basic.maxHealth - 10);
  });
});

// ---------------------------------------------------------------------------
// ENEMY — takeDamage edge cases
// ---------------------------------------------------------------------------

describe('Enemy — takeDamage edge cases', () => {
  test('takeDamage(0) returns false, does not change health', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    const initialHealth = e.health;
    expect(e.takeDamage(0)).toBe(false);
    expect(e.health).toBe(initialHealth);
  });

  test('takeDamage(negative) returns false, does not change health', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    const initialHealth = e.health;
    expect(e.takeDamage(-5)).toBe(false);
    expect(e.health).toBe(initialHealth);
  });

  test('takeDamage(EXACT health) returns true (enemy dies)', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    const health = e.health;
    expect(e.takeDamage(health)).toBe(true);
    expect(e.health).toBe(0);
  });

  test('takeDamage(OVERKILL) clamps health to 0, returns true', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    expect(e.takeDamage(e.health + 999)).toBe(true);
    expect(e.health).toBe(0);
  });

  test('takeDamage on destroyed enemy returns false', () => {
    const scene = makeFakeScene();
    const e = new Enemy(scene, 0, 0, 'basic');
    e.destroy();
    expect(e.takeDamage(10)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ENEMY — updateMovement behavior
// ---------------------------------------------------------------------------

describe('Enemy — updateMovement', () => {
  test('calls scene.physics.moveTo with correct speed', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const e = new Enemy(scene, 0, 0, 'fast');
    const target = { x: 500, y: 500 };
    e.updateMovement(target);
    expect(scene.physics.moveTo).toHaveBeenCalledWith(e, 500, 500, ENEMY_STAT_TABLE.fast.speed);
  });

  test('does nothing when enemy is inactive', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const e = new Enemy(scene, 0, 0, 'basic');
    e.setActive(false);
    e.updateMovement({ x: 0, y: 0 });
    expect(scene.physics.moveTo).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — exported API sanity
// ---------------------------------------------------------------------------

describe('SpawnSystem — constructor & public shape', () => {
  test('SpawnSystem can be instantiated with valid args', () => {
    const scene = makeFakeScene();
    const group = makeFakeGroup();
    const getPos = () => ({ x: 400, y: 300 });
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);
    expect(ss).toBeDefined();
  });

  test('SpawnSystem exposes update() method', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), () => ({ x: 0, y: 0 }), BOUNDS);
    expect(typeof ss.update).toBe('function');
  });

  test('SpawnSystem exposes spawnEnemy() method returning Enemy|null', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), () => ({ x: 0, y: 0 }), BOUNDS);
    expect(typeof ss.spawnEnemy).toBe('function');
  });

  test('spawnInterval is exposed and starts at BASE_SPAWN_INTERVAL (2000)', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), () => ({ x: 0, y: 0 }), BOUNDS);
    expect(ss.spawnInterval).toBe(2000);
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — spawn interval progression
// ---------------------------------------------------------------------------

describe('SpawnSystem — spawn interval progression', () => {
  const getPos = () => ({ x: 800, y: 600 });

  test('interval unchanged before first DIFFICULTY_STEP_MS (30s)', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), getPos, BOUNDS);
    ss.update(0, 29999);
    expect(ss.spawnInterval).toBe(2000);
  });

  test('interval decreases at 30s elapsed (0.9x multiplier)', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), getPos, BOUNDS);
    ss.update(30000, 30000);
    expect(ss.spawnInterval).toBe(1800);
  });

  test('interval decreases at 60s elapsed (0.9^2)', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), getPos, BOUNDS);
    ss.update(60000, 60000);
    expect(ss.spawnInterval).toBe(1620);
  });

  test('interval floors at MIN_SPAWN_INTERVAL (500ms)', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), getPos, BOUNDS);
    // 12 difficulty steps: 2000 * 0.9^12 ~= 688 -> but clamp at 500
    ss.update(360000, 360000);
    expect(ss.spawnInterval).toBe(500);
  });

  test('spawn accumulator triggers spawn when threshold met', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);

    ss.update(0, 2500); // > 2000ms threshold
    expect(group.add).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — enemy type unlocking
// ---------------------------------------------------------------------------

describe('SpawnSystem — enemy type unlocking', () => {
  const getPos = () => ({ x: 800, y: 600 });

  // Expose internal selection via repeated spawnEnemy calls
  function collectTypes(ss: SpawnSystem, count: number): EnemyType[] {
    const types: EnemyType[] = [];
    for (let i = 0; i < count; i++) {
      const e = ss.spawnEnemy();
      if (e) types.push(e.enemyType);
    }
    return types;
  }

  test('at difficultyStep=0 only basic is available', () => {
    const ss = new SpawnSystem(makeFakeScene(), makeFakeGroup(), getPos, BOUNDS);
    ss.update(0, 0);
    const types = collectTypes(ss, 50);
    expect(types.every(t => t === 'basic')).toBe(true);
  });

  test('at difficultyStep>=1 fast enemy can appear', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);
    ss.update(30000, 30000); // difficultyStep >= 1

    const types = collectTypes(ss, 50);
    expect(types.some(t => t === 'fast')).toBe(true);
  });

  test('at difficultyStep>=2 tank enemy can appear', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);
    ss.update(60000, 60000); // difficultyStep >= 2

    const types = collectTypes(ss, 50);
    expect(types.some(t => t === 'tank')).toBe(true);
  });

  test('at difficultyStep>=3 shooter enemy can appear', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);
    ss.update(90000, 90000); // difficultyStep >= 3

    const types = collectTypes(ss, 50);
    expect(types.some(t => t === 'shooter')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — max-enemy cap
// ---------------------------------------------------------------------------

describe('SpawnSystem — max-enemy cap', () => {
  const getPos = () => ({ x: 800, y: 600 });

  test('update() skips spawning when active count >= MAX_ENEMIES (60)', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(60);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);

    ss.update(0, 100000);
    expect(group.add).not.toHaveBeenCalled();
  });

  test('spawnEnemy() returns null when at MAX_ENEMIES', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(60);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);

    expect(ss.spawnEnemy()).toBeNull();
  });

  test('spawnEnemy() returns Enemy when under MAX_ENEMIES', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);

    expect(ss.spawnEnemy()).toBeInstanceOf(Enemy);
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — min-distance spawn rule
// ---------------------------------------------------------------------------

describe('SpawnSystem — min-distance spawn rule (400px)', () => {
  const getPos = () => ({ x: 800, y: 600 });
  const BOUNDS_LARGE = new Phaser.Geom.Rectangle(0, 0, 1600, 1200);

  test('spawnEnemy() returns null when player is at center and world is too small', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const tinyBounds = new Phaser.Geom.Rectangle(0, 0, 200, 200);
    const ss = new SpawnSystem(scene, group, getPos, tinyBounds);

    const result = ss.spawnEnemy();
    expect(result).toBeNull();
  });

  test('spawnEnemy() succeeds when player is far enough from edges', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS_LARGE);

    const result = ss.spawnEnemy();
    expect(result).toBeInstanceOf(Enemy);
  });

  test('spawned enemy position is at least MIN_PLAYER_DISTANCE from player', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(0);
    const ss = new SpawnSystem(scene, group, getPos, BOUNDS_LARGE);

    // Collect up to MAX_SPAWN_ATTEMPTS attempts (12)
    for (let i = 0; i < 12; i++) {
      const e = ss.spawnEnemy();
      if (!e) break;
      const dist = Phaser.Math.Distance.Between(e.x, e.y, 800, 600);
      expect(dist).toBeGreaterThanOrEqual(400);
    }
  });
});

// ---------------------------------------------------------------------------
// SPAWNSYSTEM — movement update behavior
// ---------------------------------------------------------------------------

describe('SpawnSystem — movement update behavior', () => {
  test('updateEnemyMovement() calls updateMovement on each active Enemy child', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    const getPos = () => ({ x: 500, y: 500 });

    vi.mocked(group.countActive).mockReturnValue(2);

    const fakeEnemy1 = { updateMovement: vi.fn(), active: true } as unknown as Enemy;
    const fakeEnemy2 = { updateMovement: vi.fn(), active: true } as unknown as Enemy;

    const iterateFn = vi.fn().mockImplementation((cb: (child: any) => boolean) => {
      cb(fakeEnemy1);
      cb(fakeEnemy2);
      return undefined;
    });
    (group.children as any).iterate = iterateFn;

    const ss = new SpawnSystem(scene, group, getPos, BOUNDS);
    ss.update(0, 16);

    expect(fakeEnemy1.updateMovement).toHaveBeenCalledWith(getPos());
    expect(fakeEnemy2.updateMovement).toHaveBeenCalledWith(getPos());
  });

  test('updateEnemyMovement() skips inactive Enemy children', () => {
    const scene = makeFakeScene() as Phaser.Scene;
    const group = makeFakeGroup() as Phaser.Physics.Arcade.Group;
    vi.mocked(group.countActive).mockReturnValue(1);

    const activeEnemy = { updateMovement: vi.fn(), active: true } as unknown as Enemy;
    const inactiveEnemy = { updateMovement: vi.fn(), active: false } as unknown as Enemy;

    const iterateFn = vi.fn().mockImplementation((cb: (child: any) => boolean) => {
      cb(activeEnemy);
      cb(inactiveEnemy);
      return undefined;
    });
    (group.children as any).iterate = iterateFn;

    const ss = new SpawnSystem(scene, group, () => ({ x: 0, y: 0 }), BOUNDS);
    ss.update(0, 16);

    expect(activeEnemy.updateMovement).toHaveBeenCalled();
    expect(inactiveEnemy.updateMovement).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// End of suite
// ---------------------------------------------------------------------------

console.log('T8 Test Suite: Enemy.ts & SpawnSystem.ts — complete');

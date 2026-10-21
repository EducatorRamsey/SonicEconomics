import Phaser from "phaser";
import { Runner } from "./player";
import {
  drawLevel,
  makeTextures,
  WORLD_WIDTH,
  checkpoints,
  hazardPositions,
  tokenPositions,
} from "./level";
import { progress, settings, save } from "./state";
import { cue, music } from "./audio";
export interface Bridge {
  ready: () => void;
  question: (id: number) => void;
  finish: () => void;
  hud: () => void;
  nearby: (yes: boolean) => void;
  notice: (s: string) => void;
}
export class Desert extends Phaser.Scene {
  player!: Runner;
  hazards!: Phaser.Physics.Arcade.Group;
  tokens!: Phaser.Physics.Arcade.StaticGroup;
  activePlay = false;
  invulnerable = 0;
  runTime = 0;
  private savedAt = 0;
  private shopNear = false;
  private bridge!: Bridge;
  private shieldHalo!: Phaser.GameObjects.Arc;
  private pausedVelocity = { x: 0, y: 0 };
  constructor() {
    super("desert");
  }
  connect(bridge: Bridge) {
    this.bridge = bridge;
  }
  create(data: { play?: boolean } = {}) {
    this.invulnerable = 0;
    this.runTime = 0;
    this.savedAt = 0;
    this.shopNear = false;
    makeTextures(this);
    this.physics.world.setBounds(0, -300, WORLD_WIDTH, 1100);
    const platforms = drawLevel(this);
    this.player = new Runner(this, progress.x);
    this.physics.add.collider(this.player, platforms);
    this.tokens = this.physics.add.staticGroup();
    tokenPositions.forEach((p, i) => {
      if (!progress.collected.includes(i)) {
        const t = this.tokens.create(p.x, p.y, "token");
        t.setData("id", i);
      }
    });
    this.physics.add.overlap(this.player, this.tokens, (_p, t) => {
      if (!this.activePlay) return;
      const obj = t as Phaser.Physics.Arcade.Sprite;
      progress.collected.push(obj.getData("id"));
      progress.tokens++;
      obj.destroy();
      cue("token");
      save();
      this.bridge.hud();
    });
    this.hazards = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    hazardPositions.forEach((x, i) => {
      const h = this.hazards.create(
        x,
        482,
        "tumbleweed",
      ) as Phaser.Physics.Arcade.Sprite;
      h.setCircle(15, 3, 3);
      h.setData("home", x);
      h.setData("phase", i);
    });
    this.physics.add.overlap(this.player, this.hazards, () => this.hurt());
    this.shieldHalo = this.add
      .circle(0, 0, 40, 0, 0)
      .setStrokeStyle(3, 0x2d827d)
      .setDepth(8);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 540);
    this.cameras.main.startFollow(
      this.player,
      true,
      settings.reduced ? 1 : 0.09,
      1,
      -150,
      60,
    );
    this.setPlaying(false);
    if (data.play) this.setPlaying(true);
    this.bridge?.hud();
    this.bridge?.ready();
  }
  setPlaying(active: boolean) {
    this.activePlay = active;
    if (!this.player) return;
    if (active) {
      this.physics.resume();
      this.player.setVelocity(this.pausedVelocity.x, this.pausedVelocity.y);
    } else {
      const b = this.player.body as Phaser.Physics.Arcade.Body;
      this.pausedVelocity = { x: b.velocity.x, y: b.velocity.y };
      this.physics.pause();
      this.player.clear();
    }
    music(active);
  }
  reset() {
    this.scene.restart({ play: true });
  }
  recover() {
    this.player.setPosition(progress.x, 420);
    this.player.setVelocity(0, 0);
    this.invulnerable = 2.5;
    this.bridge.notice(
      "Back at your safe checkpoint. Your tokens and answers are saved.",
    );
    save();
  }
  hurt() {
    if (!this.activePlay || this.invulnerable > 0) return;
    this.invulnerable = 2;
    cue("hit");
    if (progress.shield > 0) {
      progress.shield--;
      this.bridge.notice("Your shield protected a heart.");
    } else {
      progress.hearts--;
      this.bridge.notice(
        "A bump! One heart used. You have a moment of protection.",
      );
      if (progress.hearts <= 0) {
        progress.hearts = 3;
        this.recover();
      }
    }
    save();
    this.bridge.hud();
  }
  update(_time: number, delta: number) {
    if (!this.player) return;
    this.shieldHalo
      .setPosition(this.player.x + 7, this.player.y - 1)
      .setVisible(progress.shield > 0);
    if (!this.activePlay) return;
    const dt = Math.min(delta, 50) / 1000;
    this.runTime += dt * 1000;
    progress.elapsed += dt;
    progress.boost = Math.max(0, progress.boost - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.player.setAlpha(this.invulnerable > 0 ? 0.65 : 1);
    this.player.move(this.runTime, progress.boost > 0);
    this.hazards.children.iterate((child) => {
      const h = child as Phaser.Physics.Arcade.Sprite;
      h.x =
        h.getData("home") +
        Math.sin(this.runTime / 850 + h.getData("phase")) * 34;
      if (!settings.reduced) h.rotation += dt * 1.2;
      return true;
    });
    if (this.player.y > 640) this.recover();
    for (let i = 0; i < checkpoints.length; i++) {
      if (
        this.player.x >= checkpoints[i].x - 40 &&
        !progress.answered.includes(i)
      ) {
        progress.x = checkpoints[i].x - 85;
        save();
        this.bridge.question(i);
        break;
      }
    }
    const near = Math.abs(this.player.x - 1710) < 175;
    if (near !== this.shopNear) {
      this.shopNear = near;
      this.bridge.nearby(near);
    }
    if (this.player.x >= 5215 && progress.answered.length === 3) {
      progress.finished = true;
      save();
      this.bridge.finish();
    }
    if (this.runTime - this.savedAt > 500) {
      this.savedAt = this.runTime;
      save();
      this.bridge.hud();
    }
  }
}

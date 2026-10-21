import Phaser from "phaser";
import { Runner } from "./player";
import { LoopRunner } from "./loops";
import { levels, obstacles, movingGaps } from "./course";
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
  rest: (id: number | null) => void;
  question: (id: number) => void;
  finish: () => void;
  hud: () => void;
  nearby: (yes: boolean) => void;
  notice: (s: string) => void;
}
export class Desert extends Phaser.Scene {
  player!: Runner;
  loops!: LoopRunner;
  private stageCheckpoint = false;
  movingPlatforms!: Phaser.Physics.Arcade.Group;
  windLabels: Phaser.GameObjects.Text[] = [];
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
    const level = levels[progress.level];
    this.stageCheckpoint = progress.x >= level.safe;
    this.physics.world.gravity.y = progress.level === 2 ? 650 : 1120;
    this.physics.world.setBounds(
      level.left,
      -300,
      level.right - level.left,
      1100,
    );
    const platforms = drawLevel(this, settings.mode === "relaxed");
    this.player = new Runner(this, progress.x);
    this.loops = new LoopRunner(this.player);
    this.bridge.rest(null);
    this.physics.add.collider(this.player, platforms);
    this.tokens = this.physics.add.staticGroup();
    tokenPositions.forEach((p, i) => {
      if (
        p.x >= level.left &&
        p.x < level.right &&
        !progress.collected.includes(i)
      ) {
        const t = this.tokens.create(
          p.x,
          p.y,
          ["token", "chip", "crystal"][progress.level],
        );
        t.setData("id", i);
      }
    });
    this.physics.add.overlap(this.player, this.tokens, (_p, t) =>
      this.collect(t as Phaser.Physics.Arcade.Sprite),
    );
    this.hazards = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.windLabels = [];
    obstacles
      .filter((o) => o.level === progress.level)
      .forEach((o, i) => {
        const h = this.hazards.create(
          o.x,
          o.kind === "wind" ? 456 : o.kind === "boulder" ? 475 : 482,
          o.kind === "wind"
            ? "energy"
            : progress.level === 1
              ? "barrier"
              : o.kind,
        ) as Phaser.Physics.Arcade.Sprite;
        if (o.kind === "tumbleweed") h.setCircle(15, 3, 3);
        if (o.kind === "boulder") h.setCircle(22, 3, 3);
        if (o.kind === "wind") {
          h.setSize(42, 80);
          h.setAlpha(0.7);
          const label = this.add
            .text(o.x, 393, "Gate charging", {
              fontSize: "12px",
              color: "#254c49",
              backgroundColor: "#f6efd8",
              padding: { x: 5, y: 4 },
            })
            .setOrigin(0.5);
          h.setData("label", label);
          this.windLabels.push(label);
        }
        if (progress.level === 2 && o.kind === "boulder") h.setTint(0xc8b3e2);
        h.setData("home", o.x)
          .setData("phase", i)
          .setData("kind", o.kind)
          .setData("danger", o.kind !== "wind");
      });
    this.physics.add.overlap(this.player, this.hazards, (_p, h) => {
      if ((h as Phaser.Physics.Arcade.Sprite).getData("danger")) this.hurt();
    });
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    if (progress.level === 2)
      for (const gap of movingGaps) {
        const mid = (gap.left + gap.right) / 2;
        const plank = this.add
          .rectangle(mid, 492, 150, 16, 0x557c6b)
          .setStrokeStyle(3, 0xf3d199);
        this.physics.add.existing(plank);
        this.movingPlatforms.add(plank);
        const body = plank.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false).setImmovable(true).setVelocityX(65);
        body.friction.x = 1;
        plank.setData("mid", mid);
      }
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.shieldHalo = this.add
      .circle(0, 0, 40, 0, 0)
      .setStrokeStyle(3, 0x2d827d)
      .setDepth(8);
    this.cameras.main.setBounds(level.left, 0, level.right - level.left, 540);
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
  private collect(obj: Phaser.Physics.Arcade.Sprite) {
    if (!this.activePlay || !obj.active) return;
    progress.collected.push(obj.getData("id"));
    progress.tokens++;
    obj.destroy();
    cue("token");
    save();
    this.bridge.hud();
  }
  reset() {
    this.scene.restart({ play: true });
  }
  recover() {
    this.loops.reset();
    (this.player.body as Phaser.Physics.Arcade.Body).reset(progress.x, 420);
    this.player.setVelocity(0, 0);
    this.invulnerable = 2.5;
    this.bridge.notice(
      "Back at your safe checkpoint. Your tokens and answers are saved.",
    );
    save();
  }
  advanceLevel() {
    if (
      progress.level >= 2 ||
      !progress.completedLevels.includes(progress.level)
    )
      return;
    progress.level++;
    progress.pendingGate = null;
    progress.x = levels[progress.level].start;
    progress.hearts = 3;
    progress.finished = false;
    save();
    this.scene.restart({ play: true });
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
    progress.magnet = Math.max(0, progress.magnet - dt);
    progress.boots = Math.max(0, progress.boots - dt);
    if (progress.magnet > 0)
      for (const obj of this.tokens.getChildren().slice()) {
        const token = obj as Phaser.Physics.Arcade.Sprite;
        if (
          Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            token.x,
            token.y,
          ) < 150
        )
          this.collect(token);
      }
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.player.setAlpha(this.invulnerable > 0 ? 0.65 : 1);
    if (!this.loops.update(dt))
      this.player.move(this.runTime, progress.boost > 0, true);
    else
      this.tokens
        .getChildren()
        .slice()
        .forEach((obj) => {
          const token = obj as Phaser.Physics.Arcade.Sprite;
          if (
            Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              token.x,
              token.y,
            ) < 34
          )
            this.collect(token);
        });
    this.hazards.children.iterate((child) => {
      const h = child as Phaser.Physics.Arcade.Sprite,
        kind = h.getData("kind");
      if (kind === "wind") {
        const cycle = (this.runTime + h.getData("phase") * 700) % 4500;
        h.setData("danger", cycle >= 1500 && cycle < 3000);
        (h.getData("label") as Phaser.GameObjects.Text).setText(
          cycle < 1500
            ? "Gate charging"
            : cycle < 3000
              ? "Energy on · jump"
              : "Gate off · go",
        );
      } else {
        const stone = kind === "boulder";
        h.x =
          h.getData("home") +
          Math.sin(this.runTime / (stone ? 550 : 1000) + h.getData("phase")) *
            (stone ? 105 : 34);
        if (!settings.reduced && progress.level !== 1)
          h.rotation += dt * (stone ? 2.2 : 1.1);
      }
      return true;
    });
    this.movingPlatforms.children.iterate((child) => {
      const p = child as Phaser.GameObjects.Rectangle,
        b = p.body as Phaser.Physics.Arcade.Body;
      if (p.x > p.getData("mid") + 65) b.setVelocityX(-65);
      else if (p.x < p.getData("mid") - 65) b.setVelocityX(65);
      return true;
    });
    if (this.player.y > 640) this.recover();
    const level = levels[progress.level];
    if (!this.stageCheckpoint && this.player.x >= level.safe) {
      this.stageCheckpoint = true;
      progress.x = level.safe;
      save();
      this.bridge.notice("Safe checkpoint saved.");
    }
    const near = Math.abs(this.player.x - level.shop) < 165;
    if (near !== this.shopNear) {
      this.shopNear = near;
      this.bridge.nearby(near);
    }
    if (this.player.x >= level.end - 45) {
      this.loops.reset();
      (this.player.body as Phaser.Physics.Arcade.Body).reset(
        level.end - 90,
        440,
      );
      this.player.setVelocity(0, 0);
      progress.x = level.end - 90;
      progress.pendingGate = progress.level;
      save();
      this.bridge.question(progress.level);
      return;
    }
    if (this.runTime - this.savedAt > 500) {
      this.savedAt = this.runTime;
      save();
      this.bridge.hud();
    }
  }
}

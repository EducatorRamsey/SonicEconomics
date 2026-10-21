import Phaser from "phaser";
import { settings, progress, save, wardrobe } from "./state";
import { cue } from "./audio";
export class Runner extends Phaser.Physics.Arcade.Sprite {
  private outfit!: Phaser.GameObjects.Graphics;
  held = { left: false, right: false, jump: false };
  private wasJump = false;
  private lastGround = 0;
  private jumpQueued = 0;
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  constructor(scene: Phaser.Scene, x: number) {
    super(scene, x, 450, "bird0");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(31, 53)
      .setOffset(37, 15)
      .setCollideWorldBounds(true)
      .setMaxVelocity(480, 900);
    this.outfit = scene.add.graphics().setDepth(9);
    this.once("destroy", () => this.outfit?.destroy());
    this.bind();
  }
  bind() {
    const keyboard = this.scene.input.keyboard!;
    this.keys = {
      left: keyboard.addKey(settings.left),
      right: keyboard.addKey(settings.right),
      jump: keyboard.addKey(settings.jump),
      a: keyboard.addKey("LEFT"),
      d: keyboard.addKey("RIGHT"),
      space: keyboard.addKey("SPACE"),
      w: keyboard.addKey("W"),
      up: keyboard.addKey("UP"),
    };
  }
  move(time: number, boost: boolean, outdoor = false) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down;
    if (grounded) this.lastGround = time;
    const { axis, jump } = this.controls();

    const pressed = jump && !this.wasJump;
    if (pressed) this.jumpQueued = time + 130;
    this.wasJump = jump;
    const reversing =
      axis &&
      Math.sign(body.velocity.x) !== axis &&
      Math.abs(body.velocity.x) > 30;
    this.setAccelerationX(axis * (reversing ? 2100 : 1100));
    this.setDragX(420);
    this.setMaxVelocity(
      600 *
        settings.speed *
        (outdoor && progress.boots > 0 ? 1.25 : 1) *
        (outdoor && wardrobe.includes(0) ? 1.1 : 1),
      900,
    );
    if (axis) this.setFlipX(axis < 0);
    if (this.jumpQueued > time && time - this.lastGround < 110) {
      this.setVelocityY(boost ? -585 : -465);
      this.jumpQueued = 0;
      this.lastGround = -1000;
      cue("jump");
    } else if (
      pressed &&
      outdoor &&
      !grounded &&
      time - this.lastGround >= 110 &&
      progress.jets > 0
    ) {
      progress.jets--;
      this.setVelocityY(-420);
      this.jumpQueued = 0;
      save();
      cue("jump");
    }
    this.setTexture(
      grounded && Math.abs(body.velocity.x) > 25
        ? `bird${1 + (Math.floor(time / 110) % 2)}`
        : "bird0",
    );
  }
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.outfit) return;
    const g = this.outfit;
    g.clear();
    g.setPosition(this.x, this.y)
      .setRotation(this.rotation)
      .setScale(this.flipX ? -1 : 1, 1)
      .setAlpha(this.alpha);
    if (wardrobe.includes(0)) {
      const stride =
        this.texture.key === "bird1"
          ? 10
          : this.texture.key === "bird2"
            ? -9
            : 0;
      g.fillStyle(0xc74636);
      g.fillRoundedRect(-13 + stride, 25, 18, 9, 3);
      g.fillRoundedRect(4 - stride, 25, 18, 9, 3);
      g.lineStyle(2, 0xfff5df);
      g.lineBetween(-13 + stride, 33, 5 + stride, 33);
      g.lineBetween(4 - stride, 33, 22 - stride, 33);
    }
    if (
      wardrobe.includes(1) &&
      !(wardrobe.includes(2) && progress.level === 2)
    ) {
      g.fillStyle(0xe5b94f);
      g.fillRoundedRect(9, -47, 23, 14, 5);
      g.fillStyle(0xad752d);
      g.fillRoundedRect(3, -35, 34, 5, 2);
    }
    if (wardrobe.includes(2) && progress.level === 2) {
      g.fillStyle(0x9de3ff, 0.12);
      g.fillCircle(17, -18, 24);
      g.lineStyle(3, 0xc8eaff);
      g.strokeCircle(17, -18, 24);
      g.lineBetween(7, -34, 16, -37);
    }
  }
  controls() {
    const left = this.held.left || this.keys.left.isDown || this.keys.a.isDown;
    const right =
      this.held.right || this.keys.right.isDown || this.keys.d.isDown;
    const jump =
      this.held.jump ||
      this.keys.jump.isDown ||
      this.keys.space.isDown ||
      this.keys.w.isDown ||
      this.keys.up.isDown;
    return { axis: Number(right) - Number(left), jump };
  }
  leaveSurface() {
    this.lastGround = -1000;
    this.wasJump = true;
    this.jumpQueued = 0;
  }
  clear() {
    this.held = { left: false, right: false, jump: false };
    Object.values(this.keys).forEach((k) => k.reset());
    this.wasJump = false;
    this.jumpQueued = 0;
  }
}

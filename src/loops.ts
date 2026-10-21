import Phaser from "phaser";
import { loopTracks } from "./course";
import { Runner } from "./player";
import { settings } from "./state";

/** Assisted surface physics: speed responds to gravity, acceleration and braking.
 * The safe ground route remains open underneath every optional loop. */
export class LoopRunner {
  active: {
    index: number;
    angle: number;
    speed: number;
    direction: number;
    jumpHeld: boolean;
  } | null = null;
  private blocked = -1;
  private previousX: number;
  completed = new Set<number>();
  constructor(private player: Runner) {
    this.previousX = player.x;
  }
  update(dt: number): boolean {
    const p = this.player,
      body = p.body as Phaser.Physics.Arcade.Body;
    const { axis, jump } = p.controls();
    if (!settings.loops) {
      if (this.active) this.exit(0, 0);
      this.previousX = p.x;
      return false;
    }
    if (!this.active) {
      if (this.blocked >= 0 && Math.abs(p.x - loopTracks[this.blocked].x) > 240)
        this.blocked = -1;
      const index = loopTracks.findIndex(
        (t, i) =>
          i !== this.blocked &&
          p.y > 430 &&
          p.y < 480 &&
          Math.abs(body.velocity.x) > 110 &&
          (Math.abs(p.x - t.x) < 28 ||
            ((this.previousX - t.x) * (p.x - t.x) < 0 &&
              Math.abs(p.x - this.previousX) < 100)),
      );
      this.previousX = p.x;
      if (index < 0) return false;
      this.active = {
        index,
        angle: 0,
        speed: Math.max(340, Math.abs(body.velocity.x)),
        direction: Math.sign(body.velocity.x),
        jumpHeld: jump,
      };
      body.enable = false;
      p.setAcceleration(0).setVelocity(0);
      p.setFlipX(this.active.direction < 0);
    }
    const a = this.active,
      t = loopTracks[a.index];
    const theta = a.angle * a.direction;
    // Uphill motion spends momentum; downhill motion restores it. Keeping a
    // direction held drives the runner; the opposite direction brakes.
    a.speed +=
      (axis * a.direction * 700 - 300 * Math.sin(a.angle) - (axis ? 0 : 70)) *
      dt;
    a.speed = Phaser.Math.Clamp(
      a.speed,
      180,
      Math.max(420, 600 * settings.speed),
    );
    a.angle += (a.speed / t.radius) * dt;
    const next = a.angle * a.direction;
    p.setPosition(
      t.x + Math.sin(next) * t.radius,
      t.y + Math.cos(next) * t.radius,
    );
    p.setRotation(-next).setTexture(`bird${1 + (Math.floor(a.angle * 7) % 2)}`);
    if (jump && !a.jumpHeld) {
      const vx =
        Math.cos(theta) * a.speed * a.direction - Math.sin(theta) * 280;
      const vy =
        -Math.sin(theta) * a.speed * a.direction - Math.cos(theta) * 280;
      this.exit(vx, vy);
    } else if (a.angle >= Math.PI * 2) {
      this.completed.add(a.index);
      p.setPosition(t.x + a.direction * 45, 465);
      this.exit(a.speed * a.direction, 0);
    } else a.jumpHeld = jump;
    return true;
  }
  private exit(vx: number, vy: number) {
    const p = this.player,
      b = p.body as Phaser.Physics.Arcade.Body;
    this.blocked = this.active!.index;
    this.active = null;
    p.setRotation(0);
    b.enable = true;
    b.reset(p.x, p.y);
    p.setVelocity(vx, vy);
    p.leaveSurface();
    this.previousX = p.x;
  }
  reset() {
    if (this.active) this.exit(0, 0);
    this.blocked = -1;
    this.previousX = this.player.x;
  }
}

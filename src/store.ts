import { stores, inventories } from "./inventory";
import Phaser from "phaser";
import { Runner } from "./player";
import { makeTextures } from "./level";
import { settings, progress } from "./state";
import { music } from "./audio";
export class TradingPost extends Phaser.Scene {
  player!: Runner;
  activePlay = false;
  runTime = 0;
  constructor(private callbacks: { ready: () => void }) {
    super("store-interior");
  }
  create() {
    this.runTime = 0;
    makeTextures(this);
    this.physics.world.setBounds(0, 0, 960, 650);
    const g = this.add.graphics();
    const stage = progress.level;
    g.fillStyle([0xead4ac, 0xd2e4ec, 0x202d46][stage]);
    g.fillRect(0, 0, 960, 540);
    g.fillStyle([0xc88c67, 0x8dabbc, 0x657a97][stage]);
    g.fillRect(0, 90, 960, 340);
    g.fillStyle([0xb57854, 0x647e91, 0x3e506e][stage]);
    g.fillRect(0, 430, 960, 110);
    for (let x = 0; x < 960; x += 96) {
      g.lineStyle(2, 0x9e684d);
      g.lineBetween(x, 430, x, 540);
    }
    g.fillStyle(0x305b53);
    g.fillRoundedRect(55, 310, 100, 190, 42);
    g.fillStyle(0xe9be79);
    g.fillCircle(130, 413, 5);
    this.add
      .text(105, 285, "EXIT · E", { fontSize: "15px", color: "#24483e" })
      .setOrigin(0.5);
    g.fillStyle(0xf9ecc8);
    g.fillRoundedRect(735, 150, 160, 155, 55);
    g.fillStyle(0xca956d);
    g.fillTriangle(738, 300, 803, 203, 893, 300);
    for (let row = 0; row < 2; row++) {
      g.fillStyle(0x916046);
      g.fillRect(300, 210 + row * 85, 280, 12);
      for (let col = 0; col < 5; col++) {
        g.fillStyle(col % 2 ? 0x75977c : 0xdcb263);
        g.fillRoundedRect(320 + col * 48, 177 + row * 85, 27, 33, 5);
      }
    }
    if (stage === 1) {
      g.fillStyle(0xbfe8f1);
      g.fillRoundedRect(735, 150, 160, 155, 55);
      for (let x = 750; x < 880; x += 35) {
        g.fillStyle(0x597d96);
        g.fillRect(x, 200 + (x % 3) * 15, 25, 90);
        g.fillStyle(0xd1ebe8);
        g.fillRect(x + 7, 230, 10, 8);
      }
      g.fillStyle(0x478fa8);
      g.fillRect(740, 285, 150, 20);
    }
    if (stage === 2) {
      g.fillStyle(0x101628);
      g.fillRoundedRect(735, 150, 160, 155, 55);
      g.fillStyle(0x5ca3d7);
      g.fillCircle(815, 215, 37);
      g.fillStyle(0xd5e7ff);
      g.fillCircle(760, 180, 2);
      g.fillCircle(870, 267, 2);
    }
    // Original tortoise shopkeeper behind the counter.
    g.fillStyle(0x698e71);
    g.fillEllipse(670, 353, 76, 52);
    g.fillCircle(710, 337, 19);
    g.fillStyle(0x203f3a);
    g.fillCircle(716, 333, 3);
    g.fillStyle(0x925f40);
    g.fillRoundedRect(580, 375, 250, 125, 9);
    g.fillStyle(0xe7b879);
    g.fillRect(567, 370, 277, 18);
    this.add
      .text(
        707,
        409,
        inventories[stage].map((item) => item.name.toUpperCase()).join("\n"),
        {
          fontSize: "19px",
          color: "#fff1c9",
          align: "center",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);
    this.add
      .text(480, 92, stores[stage].toUpperCase(), {
        fontSize: "32px",
        color: "#2b5548",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(
        480,
        118,
        [
          "Albuquerque · Trail essentials",
          "Houston · Prepare for launch",
          "Moon habitat · Gear for low gravity",
        ][stage],
        {
          fontSize: "16px",
          color: "#4e6755",
        },
      )
      .setOrigin(0.5);
    this.add
      .text(645, 311, "COUNTER · E", { fontSize: "14px", color: "#254c42" })
      .setOrigin(0.5);
    const floor = this.add.rectangle(480, 525, 960, 50, 0, 0);
    this.physics.add.existing(floor, true);
    this.player = new Runner(this, 215);
    this.player.setPosition(215, 440);
    this.physics.add.collider(this.player, floor);
    this.setPlaying(true);
    this.callbacks.ready();
  }
  setPlaying(active: boolean) {
    this.activePlay = active;
    if (!this.player) return;
    if (active) {
      this.physics.resume();
      this.player.bind();
    } else {
      this.physics.pause();
      this.player.clear();
    }
    music(active);
  }
  update(_time: number, delta: number) {
    if (!this.activePlay || !this.player) return;
    this.runTime += Math.min(delta, 50);
    this.player.move(this.runTime, false);
    this.player.setMaxVelocity(220 * settings.speed, 900);
  }
  atCounter() {
    return Math.abs(this.player.x - 620) < 150;
  }
  atDoor() {
    return this.player.x < 175;
  }
  approachCounter() {
    (this.player.body as Phaser.Physics.Arcade.Body).reset(610, 450);
    this.player.setVelocity(0, 0);
  }
}

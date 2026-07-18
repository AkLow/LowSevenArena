import Phaser from 'phaser'
import './style.css'

class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene')
  }

  create() {
    const width = this.scale.width
    const height = this.scale.height

    this.add.rectangle(width / 2, height / 2, width, height, 0x183c24)

    this.add.rectangle(
      width / 2,
      height / 2,
      width - 70,
      height - 240,
      0x4f7d3a
    ).setStrokeStyle(8, 0x8b5a2b)

    this.add.text(width / 2, 55, 'LOWSEVEN ARENA', {
      fontFamily: 'Arial',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#f7d774',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(width / 2, height - 75, 'Comment to Join • 30 Likes to Join', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: {
        x: 16,
        y: 10,
      },
    }).setOrigin(0.5)

    const fighter = this.add.container(width / 2, height / 2)

    const shadow = this.add.ellipse(0, 26, 60, 20, 0x000000, 0.35)

    const body = this.add.rectangle(0, 0, 46, 58, 0x4c7cff)
      .setStrokeStyle(4, 0x15234a)

    const helmet = this.add.circle(0, -35, 24, 0xbfc7d5)
      .setStrokeStyle(4, 0x3e4654)

    const visor = this.add.rectangle(0, -34, 32, 9, 0x252b35)

    const sword = this.add.rectangle(34, 0, 8, 56, 0xd9e1e8)
      .setStrokeStyle(3, 0x555d66)
      .setAngle(25)

    fighter.add([shadow, body, helmet, visor, sword])

    this.add.text(width / 2, height / 2 - 90, 'PLAYER', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    const healthBackground = this.add.rectangle(
      width / 2,
      height / 2 - 65,
      100,
      14,
      0x3b1111
    )

    const healthBar = this.add.rectangle(
      width / 2 - 48,
      height / 2 - 65,
      96,
      10,
      0x46d369
    ).setOrigin(0, 0.5)

    this.tweens.add({
      targets: fighter,
      y: fighter.y - 8,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.tweens.add({
      targets: sword,
      angle: -25,
      duration: 450,
      yoyo: true,
      repeat: -1,
      repeatDelay: 700,
      ease: 'Power2',
    })
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 540,
  height: 960,
  backgroundColor: '#111111',
  scene: ArenaScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

new Phaser.Game(config)
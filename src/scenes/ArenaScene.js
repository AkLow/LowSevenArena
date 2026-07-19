import Phaser from 'phaser'
import FighterManager from '../managers/FighterManager'
import RoundSystem from '../systems/RoundSystem'
import TikTokManager from '../managers/TikTokManager.js'

export default class ArenaScene extends Phaser.Scene {
  constructor() {
    super('ArenaScene')
  }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x183c24
    )

    this.add
      .rectangle(
        width / 2,
        height / 2,
        width - 70,
        height - 240,
        0x4f7d3a
      )
      .setStrokeStyle(8, 0x8b5a2b)

    this.add
      .text(width / 2, 55, 'LOWSEVEN ARENA', {
        fontFamily: 'Arial',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#f7d774',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.add
      .text(
        width / 2,
        height - 70,
        'Comment to Join • Gifts Add HP',
        {
          fontFamily: 'Arial',
          fontSize: '21px',
          color: '#ffffff',
          backgroundColor: '#00000099',
          padding: {
            x: 16,
            y: 10,
          },
        }
      )
      .setOrigin(0.5)

    this.fighterManager = new FighterManager(this)
    this.fighterManager.spawnTestFighters(8)
    this.tiktokManager = new TikTokManager(this)
this.tiktokManager.connect()

    this.roundSystem = new RoundSystem(
      this,
      this.fighterManager
    )
  }

  update(time, delta) {
    this.fighterManager.update(delta)
    this.roundSystem.update()
  }
}
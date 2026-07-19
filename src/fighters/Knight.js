import Phaser from 'phaser'

export default class Knight extends Phaser.GameObjects.Container {
  constructor(scene, x, y, color = 0x4c7cff) {
    super(scene, x, y)

    const shadow = scene.add.ellipse(0, 26, 60, 20, 0x000000, 0.35)

    const body = scene.add
      .rectangle(0, 0, 46, 58, color)
      .setStrokeStyle(4, 0x15234a)

    const helmet = scene.add
      .circle(0, -35, 24, 0xbfc7d5)
      .setStrokeStyle(4, 0x3e4654)

    const visor = scene.add.rectangle(0, -34, 32, 9, 0x252b35)

    const sword = scene.add
      .rectangle(34, 0, 8, 56, 0xd9e1e8)
      .setStrokeStyle(3, 0x555d66)
      .setAngle(25)

    this.add([shadow, body, helmet, visor, sword])

    scene.add.existing(this)

    scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    scene.tweens.add({
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
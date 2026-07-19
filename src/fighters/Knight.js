import Phaser from 'phaser'
import MovementSystem from '../systems/MovementSystem'
import TargetSystem from '../systems/TargetSystem'
import CombatSystem from '../systems/CombatSystem'

export default class Knight extends Phaser.GameObjects.Container {
  constructor(scene, x, y, color = 0x4c7cff, playerName = 'Fighter') {
    super(scene, x, y)

    this.id = Phaser.Math.RND.uuid()
    this.playerName = playerName

    this.maxHp = 100
    this.hp = 100
    this.alive = true

    this.attackDamage = 10
    this.attackRange = 55
    this.attackCooldown = 1000
    this.nextAttackTime = 0

    this.speed = 55
    this.target = null
    this.kills = 0

    const shadow = scene.add.ellipse(0, 26, 60, 20, 0x000000, 0.35)

    const body = scene.add
      .rectangle(0, 0, 46, 58, color)
      .setStrokeStyle(4, 0x15234a)

    const helmet = scene.add
      .circle(0, -35, 24, 0xbfc7d5)
      .setStrokeStyle(4, 0x3e4654)

    const visor = scene.add.rectangle(0, -34, 32, 9, 0x252b35)

    this.sword = scene.add
      .rectangle(34, 0, 8, 56, 0xd9e1e8)
      .setStrokeStyle(3, 0x555d66)
      .setAngle(25)

    this.nameText = scene.add
      .text(0, -78, this.playerName, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    // Health bar background
    this.hpBg = scene.add.rectangle(0, -58, 42, 6, 0x222222)

    // Health bar fill
    this.hpBar = scene.add.rectangle(-21, -58, 42, 6, 0x2ecc71)
    this.hpBar.setOrigin(0, 0.5)

    this.add([
      shadow,
      body,
      helmet,
      visor,
      this.sword,
      this.nameText,
      this.hpBg,
      this.hpBar,
    ])

    scene.add.existing(this)
  }

  updateHealthBar() {
    const percent = this.hp / this.maxHp

    this.hpBar.width = 42 * percent

    if (percent > 0.6) {
      this.hpBar.fillColor = 0x2ecc71
    } else if (percent > 0.3) {
      this.hpBar.fillColor = 0xf1c40f
    } else {
      this.hpBar.fillColor = 0xe74c3c
    }
  }

  update(delta, fighters) {
    if (!this.alive) return

    if (!this.target || !this.target.alive) {
      this.target = TargetSystem.findNearestEnemy(this, fighters)
    }

    MovementSystem.update(this, delta)
    CombatSystem.update(this, this.scene.time.now)
  }
}
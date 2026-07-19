import Phaser from 'phaser'
import HealthSystem from './HealthSystem'

export default class CombatSystem {
  static update(attacker, time) {
    if (!attacker.alive) return

    if (!attacker.target) return

    if (!attacker.target.alive) return

    const distance = Phaser.Math.Distance.Between(
      attacker.x,
      attacker.y,
      attacker.target.x,
      attacker.target.y
    )

    if (distance > attacker.attackRange) return

    if (time < attacker.nextAttackTime) return

    attacker.nextAttackTime =
      time + Phaser.Math.Between(900, 1100)

    const roll = Phaser.Math.Between(1, 100)

    let damage = 0

    if (roll <= 20) {
      damage = 0
    } else if (roll <= 80) {
      damage = Phaser.Math.Between(8, 12)
    } else {
      damage = Phaser.Math.Between(18, 25)
    }

    if (damage === 0) return

    const died = HealthSystem.damage(
      attacker.target,
      damage
    )

    if (died) {
      attacker.kills++
      attacker.target = null
    }
  }
}
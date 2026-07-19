import Phaser from 'phaser'

export default class MovementSystem {
  static update(fighter, delta) {
    if (!fighter.target || !fighter.target.alive) {
      return
    }

    const distance = Phaser.Math.Distance.Between(
      fighter.x,
      fighter.y,
      fighter.target.x,
      fighter.target.y
    )

    if (distance <= fighter.attackRange) {
      return
    }

    const angle = Phaser.Math.Angle.Between(
      fighter.x,
      fighter.y,
      fighter.target.x,
      fighter.target.y
    )

    const seconds = delta / 1000

    fighter.x += Math.cos(angle) * fighter.speed * seconds
    fighter.y += Math.sin(angle) * fighter.speed * seconds
  }
}
import Phaser from 'phaser'

export default class TargetSystem {
  static findNearestEnemy(fighter, fighters) {
    let nearestEnemy = null
    let nearestDistance = Infinity

    for (const otherFighter of fighters) {
      if (otherFighter === fighter || !otherFighter.alive) {
        continue
      }

      const distance = Phaser.Math.Distance.Between(
        fighter.x,
        fighter.y,
        otherFighter.x,
        otherFighter.y
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestEnemy = otherFighter
      }
    }

    return nearestEnemy
  }
}
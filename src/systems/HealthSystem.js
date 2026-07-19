export default class HealthSystem {
  static damage(fighter, amount) {
    if (!fighter.alive) return false

    fighter.hp -= amount

    if (fighter.hp <= 0) {
      fighter.hp = 0
      fighter.alive = false
    }

    fighter.updateHealthBar()

    return !fighter.alive
  }

  static heal(fighter, amount) {
    if (!fighter.alive) return

    fighter.hp = Math.min(fighter.maxHp, fighter.hp + amount)

    fighter.updateHealthBar()
  }

  static healthPercent(fighter) {
    return fighter.hp / fighter.maxHp
  }
}
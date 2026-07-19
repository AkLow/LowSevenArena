import Phaser from 'phaser'
import Knight from '../fighters/Knight'

export default class FighterManager {
  constructor(scene) {
    this.scene = scene
    this.fighters = []

    this.giftHealing = {
      rose: 5,
      'finger heart': 15,
      galaxy: 50,
      lion: 100,
    }
  }

  spawnFighter(name = 'Fighter', displayName = name) {
    const existingFighter = this.getFighterByName(name)

    if (existingFighter) {
      console.log(`${displayName} is already in the arena.`)
      return existingFighter
    }

    const { width, height } = this.scene.scale

    const fighter = new Knight(
      this.scene,
      Phaser.Math.Between(100, width - 100),
      Phaser.Math.Between(180, height - 140),
      Phaser.Display.Color.RandomRGB().color,
      displayName,
    )

    fighter.username = name
    fighter.displayName = displayName
    fighter.playerName = displayName

    this.fighters.push(fighter)

    console.log(`${displayName} joined the arena.`)

    return fighter
  }

  addPlayer(username, displayName = username) {
    if (!username) {
      return null
    }

    const existingFighter = this.getFighterByName(username)

    if (existingFighter) {
      console.log(`${displayName} is already fighting.`)
      return existingFighter
    }

    return this.spawnFighter(username, displayName)
  }

  healPlayer(username, giftName, amount = 1) {
    if (!username || !giftName) {
      return false
    }

    const fighter = this.getFighterByName(username)

    if (!fighter) {
      console.log(
        `${username} sent ${giftName}, but they are not in the arena.`,
      )

      return false
    }

    if (!fighter.alive) {
      console.log(
        `${username} sent ${giftName}, but their fighter is already dead.`,
      )

      return false
    }

    const normalizedGiftName = giftName
      .toString()
      .trim()
      .toLowerCase()

    const healPerGift =
      this.giftHealing[normalizedGiftName] || 0

    if (healPerGift <= 0) {
      console.log(
        `${giftName} does not have a healing value yet.`,
      )

      return false
    }

    const giftAmount = Math.max(1, Number(amount) || 1)
    const totalHealing = healPerGift * giftAmount

    const previousHealth = this.getCurrentHealth(fighter)
    const maximumHealth = this.getMaximumHealth(fighter)

    if (previousHealth === null || maximumHealth === null) {
      console.warn(
        `Could not find the health properties for ${username}.`,
      )

      return false
    }

    const newHealth = Math.min(
      previousHealth + totalHealing,
      maximumHealth,
    )

    this.setCurrentHealth(fighter, newHealth)
    this.refreshHealthBar(fighter)

    const actualHealing = newHealth - previousHealth

    console.log(
      `${fighter.displayName || username} healed for ${actualHealing} HP with ${giftName} x${giftAmount}.`,
    )

    this.showHealingText(fighter, actualHealing)

    return true
  }

  boostPlayer(username) {
    if (!username) {
      return false
    }

    const fighter = this.getFighterByName(username)

    if (!fighter) {
      console.log(
        `${username} reached 30 likes, but they are not in the arena.`,
      )

      return false
    }

    if (!fighter.alive) {
      console.log(
        `${username} reached 30 likes, but their fighter is dead.`,
      )

      return false
    }

    if (fighter.likeBoostActive) {
      console.log(
        `${fighter.displayName || username} already has a like boost.`,
      )

      return false
    }

    fighter.likeBoostActive = true

    const originalSpeed =
      fighter.speed ??
      fighter.moveSpeed ??
      fighter.movementSpeed ??
      100

    const originalDamage =
      fighter.damage ??
      fighter.attackDamage ??
      10

    fighter.originalLikeBoostSpeed = originalSpeed
    fighter.originalLikeBoostDamage = originalDamage

    this.setFighterSpeed(fighter, originalSpeed * 1.35)
    this.setFighterDamage(fighter, originalDamage * 1.5)

    console.log(
      `${fighter.displayName || username} received a 10-second like boost.`,
    )

    this.showBoostText(fighter)

    this.scene.time.delayedCall(10000, () => {
      if (!fighter || !fighter.scene) {
        return
      }

      this.setFighterSpeed(
        fighter,
        fighter.originalLikeBoostSpeed,
      )

      this.setFighterDamage(
        fighter,
        fighter.originalLikeBoostDamage,
      )

      fighter.likeBoostActive = false

      console.log(
        `${fighter.displayName || username}'s like boost ended.`,
      )
    })

    return true
  }

  getCurrentHealth(fighter) {
    if (typeof fighter.health === 'number') {
      return fighter.health
    }

    if (typeof fighter.hp === 'number') {
      return fighter.hp
    }

    if (typeof fighter.currentHealth === 'number') {
      return fighter.currentHealth
    }

    return null
  }

  getMaximumHealth(fighter) {
    if (typeof fighter.maxHealth === 'number') {
      return fighter.maxHealth
    }

    if (typeof fighter.maxHp === 'number') {
      return fighter.maxHp
    }

    if (typeof fighter.maximumHealth === 'number') {
      return fighter.maximumHealth
    }

    return null
  }

  setCurrentHealth(fighter, value) {
    if (typeof fighter.health === 'number') {
      fighter.health = value
      return
    }

    if (typeof fighter.hp === 'number') {
      fighter.hp = value
      return
    }

    if (typeof fighter.currentHealth === 'number') {
      fighter.currentHealth = value
    }
  }

  refreshHealthBar(fighter) {
    if (typeof fighter.updateHealthBar === 'function') {
      fighter.updateHealthBar()
      return
    }

    if (
      fighter.healthSystem &&
      typeof fighter.healthSystem.updateHealthBar ===
        'function'
    ) {
      fighter.healthSystem.updateHealthBar()
      return
    }

    if (
      fighter.healthBar &&
      typeof fighter.healthBar.update === 'function'
    ) {
      fighter.healthBar.update()
    }
  }

  setFighterSpeed(fighter, value) {
    if (typeof fighter.speed === 'number') {
      fighter.speed = value
    }

    if (typeof fighter.moveSpeed === 'number') {
      fighter.moveSpeed = value
    }

    if (typeof fighter.movementSpeed === 'number') {
      fighter.movementSpeed = value
    }
  }

  setFighterDamage(fighter, value) {
    if (typeof fighter.damage === 'number') {
      fighter.damage = value
    }

    if (typeof fighter.attackDamage === 'number') {
      fighter.attackDamage = value
    }
  }

  showHealingText(fighter, amount) {
    if (amount <= 0) {
      return
    }

    const x = fighter.x ?? fighter.sprite?.x
    const y = fighter.y ?? fighter.sprite?.y

    if (typeof x !== 'number' || typeof y !== 'number') {
      return
    }

    const text = this.scene.add
      .text(x, y - 40, `+${amount} HP`, {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#55ff55',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    this.scene.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy()
      },
    })
  }

  showBoostText(fighter) {
    const x = fighter.x ?? fighter.sprite?.x
    const y = fighter.y ?? fighter.sprite?.y

    if (typeof x !== 'number' || typeof y !== 'number') {
      return
    }

    const text = this.scene.add
      .text(x, y - 45, '30 LIKE BOOST!', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffff55',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1000)

    this.scene.tweens.add({
      targets: text,
      y: y - 85,
      alpha: 0,
      duration: 1400,
      onComplete: () => {
        text.destroy()
      },
    })
  }

  spawnTestFighters(amount = 8) {
    for (let i = 0; i < amount; i++) {
      this.spawnFighter(
        `test-fighter-${i + 1}`,
        `Fighter ${i + 1}`,
      )
    }
  }

  update(delta) {
    for (const fighter of this.fighters) {
      fighter.update(delta, this.fighters)
    }
  }

  getAllFighters() {
    return this.fighters
  }

  getLivingFighters() {
    return this.fighters.filter(
      (fighter) => fighter.alive,
    )
  }

  getFighterByName(name) {
    if (!name) {
      return null
    }

    const searchedName = name
      .toString()
      .trim()
      .toLowerCase()

    return this.fighters.find((fighter) => {
      const possibleNames = [
        fighter.username,
        fighter.playerName,
        fighter.displayName,
      ]

      return possibleNames.some((fighterName) => {
        if (!fighterName) {
          return false
        }

        return (
          fighterName
            .toString()
            .trim()
            .toLowerCase() === searchedName
        )
      })
    })
  }

  removeFighter(fighter) {
    const index = this.fighters.indexOf(fighter)

    if (index === -1) {
      return
    }

    fighter.destroy()
    this.fighters.splice(index, 1)
  }

  clearAllFighters() {
    for (const fighter of this.fighters) {
      fighter.destroy()
    }

    this.fighters = []
  }
}
export default class RoundSystem {
  constructor(scene, fighterManager) {
    this.scene = scene
    this.fighterManager = fighterManager

    this.roundOver = false

    this.winnerText = scene.add
      .text(
        scene.scale.width / 2,
        scene.scale.height / 2,
        '',
        {
          fontFamily: 'Arial',
          fontSize: '42px',
          fontStyle: 'bold',
          color: '#f7d774',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 7,
        }
      )
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false)
  }

  update() {
    if (this.roundOver) {
      return
    }

    const livingFighters =
      this.fighterManager.getLivingFighters()

    if (livingFighters.length !== 1) {
      return
    }

    this.endRound(livingFighters[0])
  }

  endRound(winner) {
    this.roundOver = true

    this.winnerText
      .setText(
        `${winner.playerName} WINS!\nKills: ${winner.kills}`
      )
      .setVisible(true)

    this.scene.time.delayedCall(3000, () => {
      this.startNewRound()
    })
  }

  startNewRound() {
    this.winnerText.setVisible(false)

    this.fighterManager.clearAllFighters()
    this.fighterManager.spawnTestFighters(8)

    this.roundOver = false
  }
}
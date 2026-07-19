import Phaser from 'phaser'
import './style.css'
import ArenaScene from './scenes/ArenaScene'

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 540,
  height: 960,
  backgroundColor: '#111111',
  scene: [ArenaScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

new Phaser.Game(config)
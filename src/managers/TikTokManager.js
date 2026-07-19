export default class TikTokManager {
  constructor(scene) {
    this.scene = scene
    this.socket = null
    this.reconnectTimer = null
    this.isConnected = false
  }

  connect() {
    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      return
    }

    console.log('Connecting game to TikTok server...')

    this.socket = new WebSocket('ws://localhost:8080')

    this.socket.addEventListener('open', () => {
      this.isConnected = true
      console.log('Game connected to TikTok WebSocket server.')
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleEvent(data)
      } catch (error) {
        console.error('Invalid WebSocket message:', error)
      }
    })

    this.socket.addEventListener('close', () => {
      this.isConnected = false
      console.log('Game disconnected from TikTok server.')

      clearTimeout(this.reconnectTimer)

      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, 3000)
    })

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  handleEvent(data) {
    console.log('TikTok event received:', data)

    switch (data.type) {
      case 'server-status':
        console.log(data.message)
        break

      case 'tiktok-status':
        if (data.connected) {
          console.log(`TikTok LIVE connected: @${data.username}`)
        } else {
          console.log('TikTok LIVE disconnected.')
        }
        break

      case 'join':
        this.handleJoin(data)
        break

      case 'gift':
        this.handleGift(data)
        break

      case 'likes':
        this.handleLikeReward(data)
        break

      case 'like-progress':
        break

      default:
        console.log('Unknown TikTok event:', data)
    }
  }

  handleJoin(data) {
    const username = data.username
    const displayName = data.nickname || username

    if (!username) {
      return
    }

    console.log(`${displayName} is joining the arena.`)

    if (this.scene.fighterManager?.addPlayer) {
      this.scene.fighterManager.addPlayer(username, displayName)
      return
    }

    if (this.scene.fighterManager?.spawnFighter) {
      this.scene.fighterManager.spawnFighter(username, displayName)
      return
    }

    console.warn(
      'FighterManager needs an addPlayer() or spawnFighter() method.',
    )
  }

  handleGift(data) {
    const username = data.username
    const giftName = data.gift
    const amount = Number(data.amount || 1)

    if (!username || !giftName) {
      return
    }

    console.log(
      `${username} sent ${giftName} x${amount}`,
    )

    if (this.scene.fighterManager?.healPlayer) {
      this.scene.fighterManager.healPlayer(
        username,
        giftName,
        amount,
      )
      return
    }

    console.warn(
      'FighterManager needs a healPlayer() method.',
    )
  }

  handleLikeReward(data) {
    const username = data.username

    if (!username) {
      return
    }

    console.log(`${username} reached the like goal.`)

    if (this.scene.fighterManager?.boostPlayer) {
      this.scene.fighterManager.boostPlayer(username)
      return
    }

    console.log(
      'Like reward received, but boostPlayer() is not implemented yet.',
    )
  }

  disconnect() {
    clearTimeout(this.reconnectTimer)

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnected = false
  }
}
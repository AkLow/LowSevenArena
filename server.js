import {
  TikTokLiveConnection,
  WebcastEvent,
  ControlEvent,
} from 'tiktok-live-connector'

import {
  WebSocket,
  WebSocketServer,
} from 'ws'

// TikTok username, including the leading period
const tiktokUsername = '.lowseven'

// Tracks accumulated likes for each viewer
const viewerLikes = new Map()

let reconnectTimer = null
let isConnecting = false

// --------------------------------------------------
// WebSocket server
// Sends TikTok events to the Phaser browser game
// --------------------------------------------------

const wss = new WebSocketServer({
  port: 8080,
})

wss.on('listening', () => {
  console.log('WebSocket server running on ws://localhost:8080')
})

wss.on('connection', (socket) => {
  console.log('Phaser game connected to WebSocket server.')

  socket.send(
    JSON.stringify({
      type: 'server-status',
      connected: true,
      message: 'Connected to LowSeven Arena server.',
    }),
  )

  socket.on('close', () => {
    console.log('Phaser game disconnected from WebSocket server.')
  })

  socket.on('error', (error) => {
    console.error('Browser WebSocket error:', error.message)
  })
})

wss.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Port 8080 is already being used.')
    console.error('Close the other server and run node server.js again.')
    return
  }

  console.error('WebSocket server error:', error)
})

function broadcast(data) {
  const message = JSON.stringify(data)

  let clientsReached = 0

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
      clientsReached += 1
    }
  })

  if (clientsReached === 0) {
    console.log(
      `[WEBSOCKET] No browser game connected for "${data.type}" event.`,
    )
  }
}

// --------------------------------------------------
// TikTok connection
// --------------------------------------------------

const connection = new TikTokLiveConnection(tiktokUsername, {
  enableExtendedGiftInfo: false,
  fetchRoomInfoOnConnect: false,
  processInitialData: false,
})

// --------------------------------------------------
// TikTok connected
// --------------------------------------------------

connection.on(ControlEvent.CONNECTED, (state) => {
  isConnecting = false

  console.log('--------------------------------')
  console.log('CONNECTED TO TIKTOK LIVE')
  console.log(`Username: @${tiktokUsername}`)
  console.log(`Room ID: ${state.roomId}`)
  console.log('--------------------------------')

  broadcast({
    type: 'tiktok-status',
    connected: true,
    username: tiktokUsername,
    roomId: String(state.roomId),
  })
})

// --------------------------------------------------
// TikTok comments
// First comment can be used to join the arena
// --------------------------------------------------

connection.on(WebcastEvent.CHAT, (data) => {
  const username =
    data.user?.uniqueId ||
    data.user?.nickname ||
    data.user?.displayName ||
    'Unknown viewer'

  const nickname =
    data.user?.nickname ||
    data.user?.displayName ||
    username

  const comment =
    data.comment ||
    data.content ||
    data.text ||
    data.message ||
    data.commentText ||
    ''

  console.log(`[COMMENT] ${username}: ${comment}`)

  broadcast({
    type: 'join',
    username,
    nickname,
    comment,
  })
})

// --------------------------------------------------
// TikTok likes
// Sends an event after a viewer reaches 30 likes
// --------------------------------------------------

connection.on(WebcastEvent.LIKE, (data) => {
  const username =
    data.user?.uniqueId ||
    data.user?.nickname ||
    data.user?.displayName ||
    'Unknown viewer'

  const nickname =
    data.user?.nickname ||
    data.user?.displayName ||
    username

  const receivedLikes = Number(
    data.likeCount ??
    data.count ??
    data.likes ??
    1,
  )

  const previousLikes = viewerLikes.get(username) || 0
  const newTotal = previousLikes + receivedLikes

  viewerLikes.set(username, newTotal)

  console.log(
    `[LIKE] ${username}: +${receivedLikes} | Total: ${newTotal}/30`,
  )

  broadcast({
    type: 'like-progress',
    username,
    nickname,
    amount: receivedLikes,
    total: newTotal,
    target: 30,
  })

  if (previousLikes < 30 && newTotal >= 30) {
    console.log(`[LIKE REWARD] ${username} reached 30 likes`)

    broadcast({
      type: 'likes',
      username,
      nickname,
      total: newTotal,
    })
  }
})

// --------------------------------------------------
// TikTok gifts
// Sends the gift name and amount to the game
// --------------------------------------------------

connection.on(WebcastEvent.GIFT, (data) => {
  // Streakable gifts send several temporary events.
  // Wait until the streak finishes before processing.
  if (data.giftType === 1 && !data.repeatEnd) {
    return
  }

  const username =
    data.user?.uniqueId ||
    data.user?.nickname ||
    data.user?.displayName ||
    'Unknown viewer'

  const nickname =
    data.user?.nickname ||
    data.user?.displayName ||
    username

  const giftName =
    data.giftName ||
    data.gift?.name ||
    data.extendedGiftInfo?.name ||
    `Gift ID ${data.giftId}`

  const amount = Number(data.repeatCount || 1)

  console.log(
    `[GIFT] ${username} sent ${giftName} x${amount}`,
  )

  broadcast({
    type: 'gift',
    username,
    nickname,
    gift: giftName,
    giftId: data.giftId ?? null,
    amount,
  })
})

// --------------------------------------------------
// TikTok disconnected
// Automatically attempts to reconnect
// --------------------------------------------------

connection.on(ControlEvent.DISCONNECTED, () => {
  isConnecting = false

  console.log('Disconnected from TikTok LIVE.')

  broadcast({
    type: 'tiktok-status',
    connected: false,
    username: tiktokUsername,
  })

  clearTimeout(reconnectTimer)

  reconnectTimer = setTimeout(() => {
    console.log('Trying to reconnect...')
    connectToTikTok()
  }, 5000)
})

// --------------------------------------------------
// TikTok errors
// --------------------------------------------------

connection.on(ControlEvent.ERROR, (error) => {
  isConnecting = false
  console.error('TikTok connection error:', error)
})

// --------------------------------------------------
// Connect function
// --------------------------------------------------

async function connectToTikTok() {
  if (isConnecting) {
    return
  }

  isConnecting = true

  try {
    console.log(`Connecting to @${tiktokUsername}...`)

    const state = await connection.connect()

    console.log(
      `Successfully connected to room ${state.roomId}`,
    )
  } catch (error) {
    isConnecting = false

    console.error('Could not connect to TikTok LIVE.')
    console.error(
      'Make sure the account is currently LIVE.',
    )
    console.error(error.message || error)

    clearTimeout(reconnectTimer)

    reconnectTimer = setTimeout(() => {
      console.log('Trying to reconnect...')
      connectToTikTok()
    }, 10000)
  }
}

// --------------------------------------------------
// Shut down cleanly with Ctrl + C
// --------------------------------------------------

async function shutDown() {
  console.log('\nShutting down LowSeven Arena server...')

  clearTimeout(reconnectTimer)

  try {
    connection.disconnect()
  } catch {
    // Connection may already be closed
  }

  wss.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })

  setTimeout(() => {
    process.exit(0)
  }, 2000)
}

process.on('SIGINT', shutDown)
process.on('SIGTERM', shutDown)

// Start TikTok connection
connectToTikTok()
const Vec3 = require('vec3')
const { webServer, webServerPort, webServerPassword } = require('@config')
const socketIOClient = require('socket.io-client')
const config = require('@config')
const botconfig = require('@modules/botConfig')

let bot
let socket; let friends = []; let masters = []; let loged = false
function loadBot (_bot) {
  bot = _bot
}

function connect () {
  socket = socketIOClient(`${webServer}:${webServerPort}`)
  socket.on('update', data => console.log(data))
  socket.on('connect_error', data => console.log(data))
  socket.on('connect_failed', data => console.log(data))

  socket.on('connect', () => {
    console.log('Connected to webserver')
    socket.emit('login', webServerPassword)
  })

  socket.on('login', (authenticate) => {
    if (authenticate.auth) {
      loged = true
      socket.emit('addFriend', bot.username)
      bot.emit('webSocketLogin')
    } else {
      loged = false
    }
  })

  socket.on('disconnect', () => {
    console.log('Disconected from webserver')
  })

  socket.on('sendDisconnect', () => {
    process.exit(1)
  })

  socket.on('botsOnline', (botsOnline) => {
    friends = botsOnline
  })

  socket.on('botStatus', data => {
    const botIndex = friends.findIndex(e => e.socketId === data.socketId)
    if (botIndex >= 0) {
      const friendUpdate = [
        ...friends
      ]
      friendUpdate[botIndex][data.type] = data.value
      friends = friendUpdate
    }
  })

  socket.on('mastersOnline', mastersOnline => {
    masters = mastersOnline
  })

  socket.on('changeConfig', (config) => {
    let itemsToBeReady, patrol, index, temp, minerConfig, chests, itemsCanBeEat, findMaster, isEventLoaded, plantAreas, farmAreas, farmAnimal, chestArea
    switch (config.configToChange) {
      case 'job':
        botconfig.setJob(bot.username, config.value)
        break
      case 'pickUpItems':
        botconfig.setPickUpItems(bot.username, config.value)
        break
      case 'helpFriends':
        botconfig.setHelpFriends(bot.username, config.value)
        break
      case 'allowSprinting':
        botconfig.setAllowSprinting(bot.username, config.value)
        break
      case 'canDig':
        botconfig.setCanDig(bot.username, config.value)
        break
      case 'mode':
        botconfig.setMode(bot.username, config.value)
        break
      case 'distance':
        botconfig.setDistance(bot.username, config.value)
        break
      case 'InsertItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(bot.username)
        itemsToBeReady.push({
          item: config.value.item,
          quantity: config.value.quantity
        })
        botconfig.setItemsToBeReady(bot.username, itemsToBeReady)
        break
      case 'DeleteItemToBeReady':
        itemsToBeReady = botconfig.getItemsToBeReady(bot.username)
        itemsToBeReady.splice(config.value, 1)
        botconfig.setItemsToBeReady(bot.username, itemsToBeReady)
        break
      case 'InsertItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        itemsCanBeEat.push(config.value.item)
        botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        break
      case 'deleteItemCanBeEat':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        itemsCanBeEat.splice(config.value, 1)
        botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        break
      case 'moveItemCanBeEatNext':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        index = config.value
        if (itemsCanBeEat.length > (index + 1)) {
          temp = itemsCanBeEat[index]
          itemsCanBeEat[index] = itemsCanBeEat[index + 1]
          itemsCanBeEat[index + 1] = temp
          botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        }
        break
      case 'moveItemCanBeEatPrev':
        itemsCanBeEat = botconfig.getItemsCanBeEat(bot.username)
        index = config.value
        if (index > 0) {
          temp = itemsCanBeEat[index]
          itemsCanBeEat[index] = itemsCanBeEat[index - 1]
          itemsCanBeEat[index - 1] = temp
          botconfig.setItemsCanBeEat(bot.username, itemsCanBeEat)
        }
        break
      case 'addPatrol':
        patrol = botconfig.getPatrol(bot.username)
        patrol.push(config.value)
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'removePatrol':
        patrol = botconfig.getPatrol(bot.username)
        patrol.splice(config.value, 1)
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'clearAllPositions':
        botconfig.setPatrol(bot.username, [])
        break
      case 'copyPatrol':
        findMaster = bot.nearestEntity(e => e.type === 'player' && e.username === config.value && e.mobType !== 'Armor Stand')
        if (!findMaster) {
          return
        }

        isEventLoaded = bot.listeners('customEventPhysicTick').find(event => {
          return event.name === 'bound nextPointListener'
        })

        if (!isEventLoaded) {
          prevPoint = undefined
          bot.on('customEventPhysicTick', nextPointListener.bind(this, findMaster))
          botconfig.setCopingPatrol(bot.username, true)
        } else {
          bot.removeListener('customEventPhysicTick', isEventLoaded)
          botconfig.setCopingPatrol(bot.username, false)
        }
        break
      case 'movePatrolNext':
        patrol = botconfig.getPatrol(bot.username)
        index = config.value
        if (patrol.length > (index + 1)) {
          temp = patrol[index]
          patrol[index] = patrol[index + 1]
          patrol[index + 1] = temp
          botconfig.setPatrol(bot.username, patrol)
        }
        break
      case 'movePatrolPrev':
        patrol = botconfig.getPatrol(bot.username)
        index = config.value
        if (index > 0) {
          temp = patrol[index]
          patrol[index] = patrol[index - 1]
          patrol[index - 1] = temp
          botconfig.setPatrol(bot.username, patrol)
        }
        break
      case 'savePositionHasMaster':
        findMaster = bot.nearestEntity(e => e.type === 'player' && e.username === config.value && e.mobType !== 'Armor Stand')
        if (!findMaster) {
          return
        }
        patrol = botconfig.getPatrol(bot.username)
        patrol.push(new Vec3(Math.round(findMaster.position.x * 10) / 10, Math.round(findMaster.position.y * 10) / 10, Math.round(findMaster.position.z * 10) / 10))
        botconfig.setPatrol(bot.username, patrol)
        break
      case 'changeTunnel':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig.tunel = config.value
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'changeOrientation':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig.orientation = config.value
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'changePosMiner':
        minerConfig = botconfig.getMinerCords(bot.username)
        minerConfig[config.value.coord] = config.value.pos
        botconfig.setMinerCords(bot.username, minerConfig)
        break
      case 'insertNewChest':
        chests = botconfig.getChests(bot.username)
        chests.push({
          name: 'Input chest name',
          type: 'withdraw', // deposit,
          position: {
            x: null,
            y: null,
            z: null
          },
          items: []
        })
        botconfig.setChests(bot.username, chests)
        break
      case 'deleteChest':
        chests = botconfig.getChests(bot.username)
        chests.splice(config.value, 1)
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestType':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].type = config.value
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestName':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].name = config.value
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestPos':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].position[config.coord] = config.pos
        botconfig.setChests(bot.username, chests)
        break
      case 'changeChestPosMaster':
        findMaster = bot.nearestEntity(e => e.type === 'player' && e.username === config.value && e.mobType !== 'Armor Stand')
        if (!findMaster) {
          return
        }
        
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].position = findMaster.position.floored()
        botconfig.setChests(bot.username, chests)
        
        break
      case 'insertItemInChest':
        chests = botconfig.getChests(bot.username)
        chests[config.value.chestId].items.push({
          item: config.value.item,
          quantity: config.value.quantity
        })
        botconfig.setChests(bot.username, chests)
        break
      case 'removeItemFromChest':
        chests = botconfig.getChests(bot.username)
        chests[config.chestId].items.splice(config.itemIndex, 1)
        botconfig.setChests(bot.username, chests)
        break
      case 'moveChestNext':
        chests = botconfig.getChests(bot.username)
        index = config.value
        if (chests.length > (index + 1)) {
          temp = chests[index]
          chests[index] = chests[index + 1]
          chests[index + 1] = temp
          botconfig.setChests(bot.username, chests)
        }
        break
      case 'moveChestPrev':
        chests = botconfig.getChests(bot.username)
        index = config.value
        if (index > 0) {
          temp = chests[index]
          chests[index] = chests[index - 1]
          chests[index - 1] = temp
          botconfig.setChests(bot.username, chests)
        }
        break
      case 'insertNewPlantArea':
        plantAreas = botconfig.getPlantAreas(bot.username)
        plantAreas.push({
          plant: null,
          yLayer: null,
          xStart: null,
          xEnd: null,
          zStart: null,
          zEnd: null
        })
        botconfig.setPlantAreas(bot.username, plantAreas)
        break
      case 'changePlantArea':
        plantAreas = botconfig.getPlantAreas(bot.username)
        plantAreas[config.value.id] = config.value.plantArea
        botconfig.setPlantAreas(bot.username, plantAreas)
        break
      case 'deletePlantArea':
        plantAreas = botconfig.getPlantAreas(bot.username)
        plantAreas.splice(config.value, 1)
        botconfig.setPlantAreas(bot.username, plantAreas)
        break
      case 'insertNewFarmArea':
        farmAreas = botconfig.getFarmAreas(bot.username)
        farmAreas.push({
          yLayer: null,
          xStart: null,
          xEnd: null,
          zStart: null,
          zEnd: null
        })
        botconfig.setFarmAreas(bot.username, farmAreas)
        break
      case 'changeFarmArea':
        farmAreas = botconfig.getFarmAreas(bot.username)
        farmAreas[config.value.id] = config.value.farmArea
        botconfig.setFarmAreas(bot.username, farmAreas)
        break
      case 'deleteFarmArea':
        farmAreas = botconfig.getFarmAreas(bot.username)
        farmAreas.splice(config.value, 1)
        botconfig.setFarmAreas(bot.username, farmAreas)
        break
      case 'changeAnimalValue':
        farmAnimal = botconfig.getFarmAnimal(bot.username)
        farmAnimal[config.value.animal] = parseInt(config.value.value)
        botconfig.setFarmAnimal(bot.username, farmAnimal)
        break
      case 'randomFarmArea':
        botconfig.setRandomFarmArea(bot.username, config.value)
        break
      case 'insertNewChestArea':
        chestArea = botconfig.getChestArea(bot.username)
        chestArea.push({
          yLayer: null,
          xStart: null,
          xEnd: null,
          zStart: null,
          zEnd: null
        })
        botconfig.setChestArea(bot.username, chestArea)
        break
      case 'changeChestArea':
        chestArea = botconfig.getChestArea(bot.username)
        chestArea[config.value.id] = config.value.chestArea
        botconfig.setChestArea(bot.username, chestArea)
        break
      case 'deleteChestArea':
        chestArea = botconfig.getChestArea(bot.username)
        chestArea.splice(config.value, 1)
        botconfig.setChestArea(bot.username, chestArea)
        break
    }

    sendConfig()
  })

  socket.on('getConfig', () => {
    sendConfig()
  })
}

function getLoged () {
  return loged
}

function sendConfig () {
  socket.emit('sendAction', {
    action: 'sendConfig',
    value: botconfig.getAll(bot.username)
  })

  // console.log(botconfig.getAll(bot.username))
}

function sendAction (action, value) {
  socket.emit('sendAction', { action, value })
}

function emit (chanel, data) {
  if (!loged) { return }
  socket.emit(chanel, data)
}

function emitHealth (health) {
  const data = {
    type: 'health',
    value: health
  }
  emit('botStatus', data)
}

function emitCombat (combat) {
  const data = {
    type: 'combat',
    value: combat
  }
  emit('botStatus', data)
}

function emitFood (health) {
  const data = {
    type: 'food',
    value: health
  }
  emit('botStatus', data)
}

function emitEvents (events) {
  const data = {
    type: 'events',
    value: events
  }
  emit('botStatus', data)
}

function log (data) {
  if (!loged) { return }
  socket.emit('logs', data)
}

function on (listener, cb) {
  socket.on(listener, cb)
}

function getFriends () {
  return friends
}

function getMasters () {
  const allMasters = masters.concat(config.masters) // Gef offline + online config
  return allMasters
}

let prevPoint
function nextPointListener (master) {
  if (prevPoint === undefined || master.position.distanceTo(prevPoint) > 3) {
    const patrol = botconfig.getPatrol(bot.username)
    patrol.push(new Vec3(Math.round(master.position.x * 10) / 10, Math.round(master.position.y * 10) / 10, Math.round(master.position.z * 10) / 10))
    prevPoint = master.position.clone()
    botconfig.setPatrol(bot.username, patrol)
    sendConfig()
  }
}

module.exports = {
  loadBot,
  connect,
  getLoged,
  on,
  emit,
  log,
  emitHealth,
  emitFood,
  emitCombat,
  emitEvents,
  getFriends,
  getMasters,
  sendAction
}

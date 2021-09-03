const botWebsocket = require('@modules/botWebsocket')
module.exports = class BehaviorcCheckItemsInChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorcCheckItemsInChest'
    this.isEndFinished = false
    this.canOpenChest = false

    this.chest = false
  }

  onStateEntered () {
    this.isEndFinished = false
    this.canOpenChest = false

    this.timeLimit = setTimeout(() => {
      botWebsocket.log('Time exceded for open chest')
      this.isEndFinished = true
    }, 5000)

    this.bot.openContainer(this.targets.sorterJob.chest).then((container, i) => {
      const slots = container.slots.slice(0, container.inventoryStart)
      const chestIndex = this.targets.sorterJob.chests.findIndex(c => {
        if (c.position.equals(this.targets.sorterJob.chest.position)) return true
        if (this.targets.sorterJob.chest.secondBlock && c.position.equals(this.targets.sorterJob.chest.secondBlock.position)) return true
        return false
      })
      if (chestIndex >= 0) {
        this.targets.sorterJob.chests[chestIndex].slots = slots
      } else {
        this.targets.sorterJob.chest.slots = slots
        this.targets.sorterJob.chests.push(this.targets.sorterJob.chest)
      }

      setTimeout(() => {
        container.close()
        this.canOpenChest = true
        this.isEndFinished = true
      }, 500)
    })
  }

  onStateExited () {
    this.isEndFinished = false
    clearTimeout(this.timeLimit)
  }

  isFinished () {
    return this.isEndFinished
  }

  getCanOpenChest () {
    return this.canOpenChest
  }
}

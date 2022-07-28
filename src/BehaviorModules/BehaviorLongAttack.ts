
//@ts-nocheck

import { Bot, LegionStateMachineTargets } from "@/types"

module.exports = class BehaviorLongAttack {
  readonly bot: Bot
  readonly targets: LegionStateMachineTargets
  stateName: string
  playerIsFound: boolean
  playername?: string

  constructor(bot: Bot, targets: LegionStateMachineTargets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLongAttack'

    this.playerIsFound = false
    this.lastAttack = Date.now()

    this.inventory = require('@modules/inventoryModule')(this.bot)

    this.preparingShot = false
    this.prevTime = false
    this.infoShot = false
  }

  onStateEntered() {
    this.shot()
  }

  shot() {
    if (!this.preparingShot) {
      this.bot.activateItem()
      this.preparingShot = true
      this.prevTime = Date.now()
    }

    if (!this.checkBowEquipped()) {
      this.equipBow()
      this.preparingShot = false
    }

    if (this.infoShot) {
      this.bot.look(this.infoShot.yaw, this.infoShot.pitch)

      const currentTime = Date.now()
      if (this.preparingShot && currentTime - this.prevTime > 1200) {
        this.bot.deactivateItem()
        this.preparingShot = false
      }
    }
  }

  setInfoShot(infoShot) {
    this.infoShot = infoShot
  }

  equipBow() {
    const itemEquip = this.bot.inventory.items().find(item => item.name.includes('bow'))
    if (itemEquip) {
      this.bot.equip(itemEquip, 'hand', (error) => {
        if (error !== undefined) {
          botWebsocket.log('Error equip bow: ' + error)
        }
      })
    }
  }

  checkBow() {
    const bow = this.bot.inventory.items().find(item => item.name.includes('bow'))
    if (bow === undefined) {
      return false
    } else {
      return true
    }
  }

  checkArrows() {
    const arrows = this.bot.inventory.items().find(item => item.name.includes('arrow'))
    if (arrows === undefined) {
      return false
    } else {
      return true
    }
  }

  checkBowEquipped() {
    return this.inventory.checkItemEquiped('bow')
  }

  checkBowAndArrow() {
    if (this.checkBow() && this.checkArrows()) {
      return true
    } else {
      return false
    }
  }
}

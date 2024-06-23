import { LegionStateMachineTargets, MineCordsConfig } from "base-types"
import mineflayerPathfinder from 'mineflayer-pathfinder'
import { botWebsocket } from '@/modules'
import { Vec3 } from 'vec3'
import { StateBehavior } from "mineflayer-statemachine";
import { Block } from "prismarine-block";
import { Bot } from "mineflayer";
import { Logger } from 'winston';
export class BehaviorMinerCheckLayer implements StateBehavior {
  active: boolean;
  readonly bot: Bot;
  readonly targets: LegionStateMachineTargets;
  stateName: string;

  isEndFinished: boolean;
  isLayerFinished: boolean;

  foundLavaOrWater: boolean;
  minerCords: MineCordsConfig | undefined;
  blocksToFind: Array<string>;
  floorBlocksToFind: Array<string>;

  yCurrent: number | undefined
  zCurrent: number | undefined
  xCurrent: number | undefined

  yStart: number | undefined
  zStart: number | undefined
  xStart: number | undefined

  yEnd: number | undefined
  zEnd: number | undefined
  xEnd: number | undefined

  x?: number
  y?: number
  logger: Logger
  
  constructor(bot: Bot, targets: LegionStateMachineTargets,logger:Logger) {
    this.active = false
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorMinerCheckLayer'

    this.isEndFinished = false
    this.isLayerFinished = false
    this.foundLavaOrWater = false

    this.blocksToFind = ['lava', 'water', 'bubble_column', 'seagrass', 'tall_seagrass', 'kelp', 'kelp_plant']
    this.floorBlocksToFind = ['air', 'cave_air']
    this.logger=logger
  }

  isFinished() {
    this.logger.debug(this.bot.username+ " is running" +"isFinished")
    return this.isEndFinished
  }

  getFoundLavaOrWater() {
    this.logger.debug("getFoundLavaOrWater execution")
    return this.foundLavaOrWater
  }

  onStateEntered() {
    this.logger.debug("onStateEntered execution")
    this.foundLavaOrWater = false
    this.isEndFinished = false

    this.checkArea()
  }

  onStateExited() {
    this.logger.debug("onStateExited execution")
    this.bot.pathfinder.setGoal(null)
    this.bot.removeAllListeners('customEventPhysicTick')

    // Reset positions for cehck again all blocks
    const stone = this.checkStoneInInventory()
    if (stone === undefined) {
      botWebsocket.log('No blocks for place into lava or water')
      this.targets.item = undefined
      this.isEndFinished = true
      return
    }

    this.targets.item = stone

    this.startBlock()
  }

  checkStoneInInventory() {
    this.logger.debug("checkStoneInInventory execution")
    return this.bot.inventory.items().find(item => this.targets.minerJob.blockForPlace.includes(item.name))
  }

  checkArea(): Promise<void> {
    this.logger.debug("checkArea execution")
    return new Promise(async (resolve) => {
      if (this.minerCords === undefined || this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined) {
        throw new Error('No setted: this.minerCords === undefined || this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined')
      }

      do {
        if (
          this.yCurrent === this.yEnd &&
          this.zCurrent === this.zEnd &&
          this.xCurrent === this.xEnd
        ) {
          this.isEndFinished = true
          resolve()
          return
        }

        this.next()

        if (
          this.minerCords.tunnel === 'vertically' &&
          (
            (this.xCurrent === this.xEnd && this.zCurrent === this.zEnd) ||
            (this.xCurrent === this.xStart && this.zCurrent === this.zStart) ||
            (this.xCurrent === this.xEnd && this.zCurrent === this.zStart) ||
            (this.xCurrent === this.xStart && this.zCurrent === this.zEnd)
          )
        ) {
          continue
        }

        let block = this.getBlockType()
        if (!block) {
          botWebsocket.log(`Block: ${this.xCurrent} ${this.yCurrent} ${this.zCurrent} It is very far! I can't see the block, approaching the block to check it`)
          botWebsocket.log('Area less than 200 blocks radius distance is recommended')
          await this.moveToSeeBlock(this.xCurrent, this.yCurrent, this.zCurrent)
          this.bot.removeAllListeners('customEventPhysicTick')
          block = this.getBlockType()
        }

        if (block === null) {
          throw new Error('Block is null')
        }

        if (this.checkValidBlock(block)) {
          resolve()
          return
        }
      } while (true)
    })
  }

  next() {
    this.logger.debug("next execution")
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }

    if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
      this.zNext()
    }
    if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
      this.xNext()
    }
  }

  xNext() {
    this.logger.debug("xNext execution")
    if (this.minerCords === undefined || this.xStart === undefined || this.xEnd === undefined || this.xCurrent === undefined) {
      throw new Error('No setted: this.minerCords === undefined || this.xStart === undefined || this.xEnd === undefined || this.xCurrent === undefined')
    }

    if (this.xCurrent === this.xEnd) {
      const temp = this.xEnd
      this.xEnd = this.xStart
      this.xStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.yNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.zNext()
      }
    } else {
      if (this.xStart < this.xEnd) {
        this.xCurrent++
      } else {
        this.xCurrent--
      }
    }
  }

  yNext() {
    this.logger.debug("yNext execution")
    if (this.yCurrent === undefined) {
      throw new Error('No setted: this.yCurrent === undefined')
    }

    this.yCurrent--
  }

  zNext() {
    this.logger.debug("zNext execution")
    if (this.minerCords === undefined || this.zStart === undefined || this.zEnd === undefined || this.zCurrent === undefined) {
      throw new Error('No setted: this.minerCords === undefined || this.zStart === undefined || this.zEnd === undefined || this.zCurrent === undefined')
    }

    if (this.zCurrent === this.zEnd) {
      const temp = this.zEnd
      this.zEnd = this.zStart
      this.zStart = temp
      if (this.minerCords.orientation === 'z-' || this.minerCords.orientation === 'z+') {
        this.xNext()
      }
      if (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-') {
        this.yNext()
      }
    } else {
      if (this.zStart < this.zEnd) {
        this.zCurrent++
      } else {
        this.zCurrent--
      }
    }
  }

  getBlockType() {
    this.logger.debug("getBlockType execution")
    if (this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined) {
      throw new Error('No setted: this.xCurrent === undefined || this.yCurrent === undefined || this.zCurrent === undefined')
    }

    const position = new Vec3(this.xCurrent, this.yCurrent, this.zCurrent)
    return this.bot.blockAt(position)
  }

  setMinerCords(minerCords: MineCordsConfig) {
    this.logger.debug(`setMinerCords execution with param minecords:${JSON.stringify(minerCords)}`)
    this.isLayerFinished = false
    this.minerCords = minerCords
    this.startBlock()
  }

  startBlock() {
    this.logger.debug("startBlock execution")
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }

    this.yStart = this.minerCords.yStart > this.minerCords.yEnd ? this.minerCords.yStart : this.minerCords.yEnd
    this.yEnd = this.minerCords.yStart > this.minerCords.yEnd ? this.minerCords.yEnd : this.minerCords.yStart

    this.yStart++
    if (this.minerCords.tunnel === 'horizontally') {
      this.yEnd--
    }

    this.xStart = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd
    this.xEnd = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart

    switch (true) {
      case this.minerCords.orientation === 'x+':
        this.xStart = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd
        this.xEnd = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart
        this.zStart = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zStart : this.minerCords.zEnd
        this.zEnd = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zEnd : this.minerCords.zStart
        break
      case this.minerCords.orientation === 'x-':
        this.xStart = this.minerCords.xStart < this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd
        this.xEnd = this.minerCords.xStart < this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart
        this.zStart = this.minerCords.zStart < this.minerCords.zEnd ? this.minerCords.zStart : this.minerCords.zEnd
        this.zEnd = this.minerCords.zStart < this.minerCords.zEnd ? this.minerCords.zEnd : this.minerCords.zStart
        break
      case this.minerCords.orientation === 'z+':
        this.xStart = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd
        this.xEnd = this.minerCords.xStart > this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart
        this.zStart = this.minerCords.zStart < this.minerCords.zEnd ? this.minerCords.zStart : this.minerCords.zEnd
        this.zEnd = this.minerCords.zStart < this.minerCords.zEnd ? this.minerCords.zEnd : this.minerCords.zStart
        break
      case this.minerCords.orientation === 'z-':
        this.xStart = this.minerCords.xStart < this.minerCords.xEnd ? this.minerCords.xStart : this.minerCords.xEnd
        this.xEnd = this.minerCords.xStart < this.minerCords.xEnd ? this.minerCords.xEnd : this.minerCords.xStart
        this.zStart = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zStart : this.minerCords.zEnd
        this.zEnd = this.minerCords.zStart > this.minerCords.zEnd ? this.minerCords.zEnd : this.minerCords.zStart
        break
      default:
        throw new Error('Wrong this.minerCords.orientation value')
    }

    let temp

    if (this.minerCords.reverse && this.minerCords.tunnel === 'vertically' && (this.minerCords.orientation === 'x+' || this.minerCords.orientation === 'x-')) {
      temp = this.xStart
      this.xStart = this.xEnd
      this.xEnd = temp
    }

    if (this.minerCords.reverse && this.minerCords.tunnel === 'vertically' && (this.minerCords.orientation === 'z+' || this.minerCords.orientation === 'z-')) {
      temp = this.zStart
      this.zStart = this.zEnd
      this.zEnd = temp
    }

    if (this.minerCords.tunnel === 'vertically') {
      if (this.xStart > this.xEnd) {
        this.xStart++
        this.xEnd--
      } else {
        this.xStart--
        this.xEnd++
      }

      if (this.zStart > this.zEnd) {
        this.zStart++
        this.zEnd--
      } else {
        this.zStart--
        this.zEnd++
      }
    }

    this.yCurrent = this.yStart
    this.xCurrent = this.xStart
    this.zCurrent = this.zStart
  }

  checkValidBlock(block: Block) {
    this.logger.debug(`checkValidBlock execution with param block:${JSON.stringify(block)}`)
    
    if (this.minerCords === undefined) {
      throw new Error('No setted: this.minerCords === undefined')
    }

    if (this.blocksToFind.includes(block.name) ||
      (
        this.floorBlocksToFind.includes(block.name) &&
        this.minerCords.tunnel === 'horizontally' &&
        (this.minerCords.yStart - 1) === this.yCurrent
      )
    ) {
      this.targets.position = block.position
      this.foundLavaOrWater = true
      return true
    }

    return false
  }

  moveToSeeBlock(x: number, y: number, z: number): Promise<void> {
    this.logger.debug(`moveToSeeBlock execution with params x:${x} y:${y} z:${z}`)
    return new Promise((resolve) => {
      const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z)
      this.bot.pathfinder.setMovements(this.targets.movements)
      this.bot.pathfinder.setGoal(goal)

      this.bot.on('customEventPhysicTick', () => {
        const block = this.getBlockType()
        if (block) {
          this.bot.pathfinder.setGoal(null)
          resolve()
        }
      })
    })
  }
}

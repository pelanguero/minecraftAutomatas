import botConfigLoader from '@/modules/botConfig'
import { Config, MineCordsConfig } from '@/types'
import { Jobs } from '@/types/defaultTypes'
const botConfig = botConfigLoader()
import { bot } from '../hooks'

describe('01 Mining in water', function () {

  before(async () => {
    await bot.test.resetState()
    bot.chat(`/give flatbot minecraft:iron_pickaxe`)
    bot.chat(`/give flatbot minecraft:diamond_shovel`)
    bot.chat(`/give flatbot minecraft:dirt 256`)
    bot.chat(`/fill -1 -60 4 10 -56 14 minecraft:glass`)
    bot.chat(`/fill 0 -60 5 9 -56 13 water`)
    bot.chat(`/teleport -1 -55 4`)

    bot.creative.stopFlying()
    bot.test.becomeSurvival()

    const minerCords: MineCordsConfig = {
      xStart: 2,
      yStart: -56,
      zStart: 7,
      xEnd: 7,
      yEnd: -58,
      zEnd: 11,
      orientation: "x+",
      reverse: false,
      tunel: "vertically",
      world: "minecraft:overworld"
    }

    const config: Config = {
      ...botConfig.defaultConfig,
      job: Jobs.miner,
      itemsToBeReady: [
        {
          name: "iron_pickaxe",
          quantity: 1
        }
      ],
      minerCords
    }

    botConfig.saveFullConfig(bot.username, config)
    bot.emit('reloadBotConfig')
  })

  it('Making a Hole in water', (): Promise<void> => {
    return new Promise((resolve) => {
      bot.once('finishedJob', () => resolve())
    })
  })

})

const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')

function farmerJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Patrol'
  getReady.x = 525
  getReady.y = 113

  const goChests = require('./goChestsFunctions')(bot, targets)
  goChests.x = 525
  goChests.y = 313

  const farming = require('./farmingFunction')(bot, targets)
  farming.stateName = 'Farming'
  farming.x = 728
  farming.y = 313

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 728
  eatFood.y = 113

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: getReady,
      name: 'Loading configuration',
      onTransition: () => {
        targets.entity = undefined
        getReady.setItemsToBeReady(loadConfig.getItemsToBeReady())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'Go to chests',
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      shouldTransition: () => !getReady.getIsReady() || bot.inventory.items().length >= 34
    }),

    new StateTransition({
      parent: getReady,
      child: eatFood,
      shouldTransition: () => getReady.getIsReady() && bot.inventory.items().length < 34
    }),

    new StateTransition({
      parent: eatFood,
      child: farming,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: farming,
      child: goChests,
      shouldTransition: () => farming.isFinished()
    })
  ]

  const farmerJobFunction = new NestedStateMachine(transitions, start)
  farmerJobFunction.stateName = 'Farmer Job'
  return farmerJobFunction
}

module.exports = farmerJobFunction

const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

function farmingTreesFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 725
  exit.y = 113

  const selectTree = new BehaviorIdle(targets)
  selectTree.stateName = 'Select Tree'
  selectTree.x = 325
  selectTree.y = 113

  const checkFarmingAreas = new BehaviorIdle(targets)
  checkFarmingAreas.stateName = 'Next Area'
  checkFarmingAreas.x = 525
  checkFarmingAreas.y = 113

  const plant = require('@NestedStateModules/farmerJob/plantFunction')(bot, targets)
  plant.stateName = 'Plant'
  plant.x = 725
  plant.y = 313

  const harvest = require('@NestedStateModules/farmerJob/harvestFunction')(bot, targets)
  harvest.stateName = 'Harvest'
  harvest.x = 325
  harvest.y = 313

  const findItemsAndPickup = require('@NestedStateModules/findItemsAndPickup')(bot, targets)
  findItemsAndPickup.stateName = 'Find Items'
  findItemsAndPickup.x = 525
  findItemsAndPickup.y = 313

  let xStart, xEnd, xCurrent, zStart, zEnd, zCurrent, finished

  const nextTree = () => {
    xCurrent += 2
    if (xCurrent > xEnd) {
      xCurrent = xStart
      zCurrent += 2
    }

    if (zCurrent > zEnd) {
      finished = true
    }

    targets.farmerJob.plantArea.xStart = xCurrent
    targets.farmerJob.plantArea.xEnd = xCurrent
    targets.farmerJob.plantArea.zStart = zCurrent
    targets.farmerJob.plantArea.zEnd = zCurrent
  }

  const transitions = [

    new StateTransition({
      parent: start,
      child: selectTree,
      onTransition: () => {
        xStart = targets.farmerJob.plantArea.xStart < targets.farmerJob.plantArea.xEnd ? targets.farmerJob.plantArea.xStart : targets.farmerJob.plantArea.xEnd
        xEnd = targets.farmerJob.plantArea.xStart > targets.farmerJob.plantArea.xEnd ? targets.farmerJob.plantArea.xStart : targets.farmerJob.plantArea.xEnd
        zStart = targets.farmerJob.plantArea.zStart < targets.farmerJob.plantArea.zEnd ? targets.farmerJob.plantArea.zStart : targets.farmerJob.plantArea.zEnd
        zEnd = targets.farmerJob.plantArea.zStart > targets.farmerJob.plantArea.zEnd ? targets.farmerJob.plantArea.zStart : targets.farmerJob.plantArea.zEnd
        xCurrent = xStart
        zCurrent = zStart
        finished = false

        targets.farmerJob.plantArea.xStart = xCurrent
        targets.farmerJob.plantArea.xEnd = xCurrent
        targets.farmerJob.plantArea.zStart = zCurrent
        targets.farmerJob.plantArea.zEnd = zCurrent
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: selectTree,
      child: exit,
      shouldTransition: () => finished || bot.inventory.items().length >= 33
    }),

    new StateTransition({
      parent: selectTree,
      child: harvest,
      shouldTransition: () => !finished && bot.inventory.items().length < 33
    }),

    new StateTransition({
      parent: harvest,
      child: findItemsAndPickup,
      shouldTransition: () => harvest.isFinished()
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: plant,
      shouldTransition: () => findItemsAndPickup.isFinished()
    }),

    new StateTransition({
      parent: plant,
      child: selectTree,
      onTransition: () => {
        nextTree()
      },
      shouldTransition: () => plant.isFinished()
    })

  ]

  const farmingTreesFunction = new NestedStateMachine(transitions, start, exit)
  farmingTreesFunction.stateName = 'farmingTreesFunction'
  return farmingTreesFunction
}

module.exports = farmingTreesFunction

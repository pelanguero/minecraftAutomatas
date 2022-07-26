const {
  StateTransition,
  BehaviorIdle,
  BehaviorFollowEntity,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorEquip = require('@BehaviorModules/BehaviorEquip')
const BehaviorInteractEntity = require('@BehaviorModules/BehaviorInteractEntity')
const animalType = require('@modules/animalType')

function feedAnimalFunction (bot, targets) {
  const mcData = require('minecraft-data')(bot.version)

  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const exit = new BehaviorIdle(targets)
  exit.stateName = 'Exit'
  exit.x = 350
  exit.y = 313

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip'
  equip.x = 350
  equip.y = 113

  const interactEntity = new BehaviorInteractEntity(bot, targets)
  interactEntity.stateName = 'Interact'
  interactEntity.x = 575
  interactEntity.y = 313

  const followAnimal = new BehaviorFollowEntity(bot, targets)
  followAnimal.stateName = 'Follow Animal'
  followAnimal.x = 575
  followAnimal.y = 113
  followAnimal.movements = targets.movements

  const transitions = [
    new StateTransition({
      parent: start,
      child: equip,
      onTransition: () => {
        targets.breederJob.breededAnimals = []
        // Select item to give food
        const validFoods = animalType[targets.breederJob.feedEntity.name].foods
        const validFood = bot.inventory.items().find(item => validFoods.includes(item.name))
        if (validFood) {
          targets.item = mcData.itemsByName[validFood.name]
        } else {
          targets.item = null
        }
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: equip,
      child: followAnimal,
      onTransition: () => {
        targets.entity = targets.breederJob.feedEntity
      },
      shouldTransition: () => equip.isFinished() && equip.isWasEquipped()
    }),

    new StateTransition({
      parent: equip,
      child: exit,
      shouldTransition: () => equip.isFinished() && !equip.isWasEquipped()
    }),

    new StateTransition({
      parent: followAnimal,
      child: exit,
      onTransition: () => {
        const animalId = targets.breederJob.breededAnimals.findIndex(b => {
          return b.id === targets.breederJob.feedEntity.id
        })
        if (animalId >= 0) {
          targets.breederJob.breededAnimals.splice(animalId, 1)
        }
      },
      shouldTransition: () => {
        return !targets.entity || !targets.entity.isValid
      }
    }),

    new StateTransition({
      parent: followAnimal,
      child: interactEntity,
      onTransition: () => {
        targets.interactEntity = targets.breederJob.feedEntity
      },
      shouldTransition: () => targets.entity && followAnimal.distanceToTarget() < 2 && targets.entity.isValid
    }),

    new StateTransition({
      parent: interactEntity,
      child: exit,
      onTransition: () => {
        const animalId = targets.breederJob.breededAnimals.findIndex(b => {
          return b.id === targets.breederJob.feedEntity.id
        })

        if (animalId >= 0) {
          targets.breederJob.breededAnimals[animalId].breededDate = Date.now()
        }

        targets.interactEntity = null
      },
      shouldTransition: () => interactEntity.isFinished()
    })

  ]

  const feedAnimalFunction = new NestedStateMachine(transitions, start, exit)
  feedAnimalFunction.stateName = 'feedAnimalFunction'
  return feedAnimalFunction
}

module.exports = feedAnimalFunction

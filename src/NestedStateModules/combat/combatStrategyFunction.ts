import {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} from 'mineflayer-statemachine'
//@ts-ignore
import BehaviorEatFood from '@/BehaviorModules/BehaviorEatFood'
import { Bot, LegionStateMachineTargets } from '@/types'
import CombatFunction from '@/NestedStateModules/combat/combatFunction'

function combatStrategyFunction(bot: Bot, targets: LegionStateMachineTargets) {
  const start = new BehaviorIdle()
  start.stateName = 'Start'
  //@ts-ignore
  start.x = 125
  //@ts-ignore
  start.y = 113

  const exit = new BehaviorIdle()
  exit.stateName = 'Exit'
  //@ts-ignore
  exit.x = 125
  //@ts-ignore
  exit.y = 313

  const combatFunction = CombatFunction(bot, targets)
  //@ts-ignore
  combatFunction.x = 125
  //@ts-ignore
  combatFunction.y = 213

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 325
  eatFood.y = 213

  const transitions = [

    new StateTransition({
      parent: start,
      child: combatFunction,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFood,
      shouldTransition: () => bot.health < 15 && bot.food !== 20 && eatFood.checkFoodInInventory().length > 0
    }),

    new StateTransition({
      parent: eatFood,
      child: combatFunction,
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: exit,
      onTransition: () => {
        bot.emit('beatMob')
      },
      shouldTransition: () => combatFunction.isFinished()
    })
  ]

  const nestedState = new NestedStateMachine(transitions, start, exit)
  nestedState.stateName = 'Combat Strategy'
  return nestedState
}

export default combatStrategyFunction

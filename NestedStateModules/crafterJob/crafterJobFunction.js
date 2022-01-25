const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");

function crafterJobFunction(bot, targets) {
  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const searchAndCraft =
    require("@NestedStateModules/crafterJob/searchAndCraftFunction")(
      bot,
      targets
    );
  // sorterJob.x = 535
  // sorterJob.y = 213

  const transitions = [
    new StateTransition({
      parent: start,
      child: searchAndCraft,
      onTransition: () => {
        targets.crafterJob.craftItem = {
          item: 'iron_block',
          quantit: 1,
        };
      },
      shouldTransition: () => true,
    }),
  ];

  const crafterJobFunction = new NestedStateMachine(transitions, start);
  crafterJobFunction.stateName = "Crafter Job";
  return crafterJobFunction;
}

module.exports = crafterJobFunction;

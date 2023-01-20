import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

const testInput = "Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.\n\
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian."

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const RESOURCES = {
    ORE: 0,
    CLAY: 1,
    OBSIDIAN: 2,
    GEODE: 3,
}

const solution = (input) => {
    const blueprints = parseInput(input);
    // const blueprints = parseInput(testInput);
    console.time(1);
    const blueprintOutputs = blueprints.slice(0, 3).map(blueprint => bestBlueprintOutput(blueprint, {
        timer: 32,
        resources: [0, 0, 0, 0],
        robots: [1, 0, 0, 0],
    }));
    console.timeEnd(1);
    // ! PART 1
    // const result = blueprintOutputs.reduce((quality, result, ID) => {
    //     return quality + result * (ID + 1);
    // }, 0);
    // ! PART 2
    const result = blueprintOutputs.reduce((quality, result) => {
        return quality * result;
    }, 1);
    return result
}

const parseInput = input => input.split(/\n+/).map(line => {
    let robot = 0;
    return line.match(/(?:(\d+\s+\w+)(?:\s*))|(\.)/g).reduce((resourceMap, data) => {
        if (data == ".") {
            robot++;
            return resourceMap
        };
        const [amount, resource] = data.split(" ");
        resourceMap[robot][RESOURCES[resource.toUpperCase()]] = parseInt(amount);
        return resourceMap
    }, new Array(4).fill(0).map(_ => new Array(4)))
}
)

const bestBlueprintOutput = (blueprint, start) => {
    // const VALUE_BIT_LIMIT = 8;
    const startID = getID(start);
    const totalScore = { [startID]: estimate(start) }, robotLimit = getRobotLimit(blueprint);
    const consideredStates = [start];

    // todo - turn costs,robots,resources etc to bitmaps/integers

    // TODO Optmization options
    // # if I build a geode-bot - deposit geode immediately instead of creating a bot: should collapse state-space 
    // # if I have more resources than I could possibly spend in time left - dont build these robot types
    // # if I have more resources than I could possibly spend in time left - store that resource as Infinity, should collapse space-state
    // ? improve estimate formula - maybe calculate how quickly can you make your first geode robot?
    // # can't get enough geodes in time to beat max score in time - skip
    // ? if this state is a worse version of the one visited already(timer2<timer1&&robots2<=robots2&res2<=res1)
    // ? update max only on "final" state when no robot will be built anymore

    let max = 0;
    while (consideredStates.length) {
        const current = consideredStates.pop();
        const { timer, robots } = current;
        if (getScore(totalScore, current) < max) continue;

        robots.forEach((quantity, robot) => {
            // Don't build a new robot if we don't need that much
            if (!shouldBuild(quantity, robotLimit[robot])) return null;
            const waitingTime = timeToBuildStart(current, blueprint[robot]) + 1;
            // No point building a robot if it wouldn't have time to produce anything
            if (waitingTime >= timer) return null;
            const nextState = waitAndBuild(current, robot, blueprint[robot], waitingTime);
            const ID = getID(nextState);
            // If we've already been there - skip it
            if (totalScore[ID] + 1) return null;

            totalScore[ID] = nextState.resources[RESOURCES.GEODE] + estimate(nextState);
            if (totalScore[ID] > max) {
                max = Math.max(max, nextState.resources[RESOURCES.GEODE] + nextState.timer * nextState.robots[RESOURCES.GEODE]);
                consideredStates.push(nextState);
            };
        });
    };

    return max;
}

const estimate = state => {
    const { timer, robots } = state;
    return (2 * robots[RESOURCES.GEODE] + timer - 1) * timer / 2
}

const getID = state => {
    const { timer, resources, robots } = state;
    return `${timer},${robots},${resources}`
}
const getScore = (scoreMap, state) => scoreMap[getID(state)] || 0;
const timeToBuildStart = ({ resources, robots }, cost) => cost.reduce((result, amount, resource) =>
    Math.max(result, Math.ceil((amount - resources[resource]) / robots[resource])), 0);
const shouldBuild = (amount, limit) => amount < (limit || Infinity);
const getRobotLimit = blueprint => blueprint.slice(0, -1).map((_, resource) =>
    blueprint.reduce((limit, _, robot) => Math.max(blueprint[robot][resource] || 0, limit), 0));
const waitAndBuild = ({ resources, robots, timer }, robot, cost, waitDuration) => ({
    resources: resources.map((amount, resource) => amount + waitDuration * robots[resource] - (cost[resource] || 0) + ((robot == RESOURCES.GEODE && resource == RESOURCES.GEODE) ? timer - waitDuration : 0)),
    robots: robots.map((amount, resource) => amount + (resource == robot && resource != RESOURCES.GEODE)),
    timer: timer - waitDuration
});
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
    }, estimateAlpha));
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

const bestBlueprintOutput = (blueprint, start, estimate) => {
    // const VALUE_BIT_LIMIT = 8;
    const startID = getID(start);
    const score = { [startID]: estimate(start, blueprint) }, robotLimit = getRobotLimit(blueprint);
    const consideredStates = [start];

    let max = 0;
    while (consideredStates.length) {
        const current = consideredStates.pop();
        const { timer, robots } = current;
        if (getScore(score, current) < max) continue;

        robots.forEach((quantity, robot) => {
            // Don't build a new robot if we don't need that much
            if (quantity >= robotLimit[robot]) return null;
            const waitingTime = timeToBuildStart(current, blueprint[robot]) + 1;
            // No point building a robot if it wouldn't have time to produce anything
            if (waitingTime >= timer) return null;
            const nextState = waitAndBuild(current, robot, blueprint[robot], waitingTime, robotLimit);
            if (nextState.resources[robot] == Infinity) return null;
            const ID = getID(nextState);
            // If we've already been there - skip it
            if (score[ID] != undefined) return null;

            score[ID] = nextState.resources[RESOURCES.GEODE] + estimate(nextState, blueprint);
            if (score[ID] > max) {
                max = Math.max(max, nextState.resources[RESOURCES.GEODE] + nextState.timer * nextState.robots[RESOURCES.GEODE]);
                consideredStates.push(nextState);
            };
        });
    };
    return max;
}

const estimateBeta = ({ timer, robots }) => {
    return (2 * robots[RESOURCES.GEODE] + timer - 1) * timer / 2
}
const estimateAlpha = ({ timer, resources, robots }, blueprint) => {
    resources = resources.map(_ => [...resources]);
    robots = [...robots];
    for (let time = timer; time > 0; time--) {
        resources.forEach((robotResource, robot) => {
            resources[robot] = robotResource.map((amount, resource) => amount + robots[resource])
        });
        resources.forEach((robotResource, robot) => {
            const { [robot]: cost } = blueprint;
            if (cost.every((amount, resource) => robotResource[resource] >= amount)) {
                cost.forEach((amount, resource) => {
                    resources[robot][resource] -= amount;
                });
                robots[robot]++;
            };
        });
    }
    return resources[0][RESOURCES.GEODE];
}

const getID = state => {
    const { timer, resources, robots } = state;
    return `${timer},${robots},${resources}`
}
const getScore = (scoreMap, state) => scoreMap[getID(state)] || 0;
const timeToBuildStart = ({ resources, robots }, cost) => cost.reduce((result, amount, resource) =>
    Math.max(result, Math.ceil((amount - resources[resource]) / robots[resource])), 0);
const getRobotLimit = blueprint => blueprint.map((_, resource) => resource == RESOURCES.GEODE
    ? Infinity
    : blueprint.reduce((limit, _, robot) => Math.max(blueprint[robot][resource] || 0, limit), 0));
const waitAndBuild = ({ resources, robots, timer }, robot, cost, waitDuration, buildLimit) => {
    const remainingTime = timer - waitDuration;
    const abundantResourceLimit = buildLimit.map(limit => Math.max(2, remainingTime - 2) * limit);
    const abundantResources = resources.map((amount, resource) => (amount + waitDuration * robots[resource]) >= abundantResourceLimit[resource] ? true : false)
    return robot == RESOURCES.GEODE
        ? ({
            resources: resources.map((amount, resource) => abundantResources[resource] ? Infinity : (amount + waitDuration * robots[resource] - (cost[resource] || 0) + ((resource == RESOURCES.GEODE) ? remainingTime : 0))),
            robots: [...robots],
            timer: remainingTime
        })
        : ({
            resources: resources.map((amount, resource) => abundantResources[resource] ? Infinity : (amount + waitDuration * robots[resource] - (cost[resource] || 0))),
            robots: robots.map((amount, resource) => amount + (resource == robot)),
            timer: remainingTime
        });
}
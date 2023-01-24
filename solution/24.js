import * as fs from "fs/promises";
import { lcm, priorityQueue } from "../utils.js"

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const testing = process.argv[2] == "testing";

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    input = testing ? testInput : input;
    const [windList, blankValley, cycleDuration] = parseInput(input);
    const valleyStates = generateValleyStates(blankValley, windList, cycleDuration);
    const [start, finish] = getStartAndFinish(blankValley);
    console.time(1);
    const bestTime = findShortestPath(valleyStates, cycleDuration, [start, 0], [finish, blankValley.length - 1]);
    console.timeEnd(1);
    const result = bestTime;
    return result;
}
// ! NEVER FORGET - STATE REPEATS EVERY lcm(M,N) MINUTES


const findShortestPath = (valleyStates, cycleDuration, start, finish) => {
    const boundary = [valleyStates[0][0].length - 1, valleyStates[0].length - 1];
    start = { position: start, time: 0, goals: [...finish, ...start, ...finish] };
    const queue = new priorityQueue([start], (a, b) => getScore(totalScore, b) - getScore(totalScore, a));
    const tallyScore = { [getID(start)]: 0 }, totalScore = { [getID(start)]: estimate(start, start.goals) };
    const neighbours = [[0, 0], ...Object.values(WIND_TYPES)];
    while (queue.getElements().length) {
        const current = queue.popHead();
        const { position: cPos, time: cTime, goals: cGoal } = current;
        if (cPos.every((pos, axis) => pos == cGoal.slice(-2)[axis])) {
            if (cGoal.length == 2) return getScore(tallyScore, current);
            const cScore = getScore(tallyScore, current);
            cGoal.pop(); cGoal.pop();
            const ID = getID(current);
            tallyScore[ID] = cScore;
            totalScore[ID] = cScore + estimate(current, cGoal);
            queue.empty();
        };
        neighbours.forEach(next => {
            next = { time: (cTime + 1) % cycleDuration, position: cPos.map((pos, axis) => pos + next[axis]), goals: [...cGoal] };
            const { position: nPos, time: nTime } = next;
            const nScore = getScore(tallyScore, current) + 1;
            if (nScore >= getScore(tallyScore, next)
                || nPos.some((pos, axis) => pos < 0 || pos > boundary[axis])
                || valleyStates[nTime % cycleDuration][nPos[1]][nPos[0]]) return null;
            const ID = getID(next);
            tallyScore[ID] = nScore;
            totalScore[ID] = nScore + estimate(next, next.goals);
            queue.addValue(next);
        })
    }
    return -1;
}
function generateValleyStates(valley, windList, cycleDuration) {
    const getXY = ([x, y]) => [1 + ((((x - 1) % xLimit) + xLimit) % xLimit), 1 + ((((y - 1) % yLimit) + yLimit) % yLimit)];
    const valleyStates = [];
    const [xLimit, yLimit] = [valley[0].length - 2, valley.length - 2]
    for (let cycle = 0; cycle < cycleDuration; cycle++) {
        const current = structuredClone(valley);
        windList.forEach(({ x, y, move }) => {
            const [dx, dy] = getXY([x + cycle * move[0], y + cycle * move[1]]);
            current[dy][dx] = TILE_TYPES.WIND;
        });
        valleyStates.push(current);
    }
    return valleyStates
}
function estimate({ position: [x, y] }, goals) {
    const [dx, dy] = goals.slice(-2);
    const goalsDistance = goals.reduce((distance, goal, i) => {
        return distance + (Math.abs(goal - goals[i + 2]) || 0)
    }, 0)
    return goalsDistance + ((Math.abs(x - dx) + Math.abs(y - dy)) || 0);
}
function getScore(scoreMap, state) { return scoreMap[getID(state)] ?? Infinity };
function getID({ position, time, goals }) { return `${position},${time},${goals.length}` };
function getStartAndFinish(valley) {
    return [
        valley[0].findIndex(tile => tile == TILE_TYPES.EMPTY),
        valley[valley.length - 1].findIndex(tile => tile == TILE_TYPES.EMPTY)]
}
function parseInput(input) {
    const iniValley = input.split(/\n+/).map(line => line.split("").map(s => ({
        "#": TILE_DESCRIPTIONS.WALL,
        ".": TILE_DESCRIPTIONS.EMPTY,
        "^": TILE_DESCRIPTIONS.UP_WIND,
        "v": TILE_DESCRIPTIONS.DOWN_WIND,
        ">": TILE_DESCRIPTIONS.RIGHT_WIND,
        "<": TILE_DESCRIPTIONS.LEFT_WIND,
    }[s])));
    const windList = [], blankValley = iniValley.map(row => new Array(row.length).fill(TILE_TYPES.EMPTY));
    iniValley.forEach((row, y) => row.forEach((tile, x) => {
        if (tile.type == TILE_TYPES.WALL) blankValley[y][x] = TILE_TYPES.WALL;
        if (tile.type == TILE_TYPES.WIND) windList.push({ x, y, move: tile.move });
    }));
    const cycleDuration = lcm(iniValley[0].length - 2, iniValley.length - 2);
    return [windList, blankValley, cycleDuration];
}
const TILE_TYPES = {
    "EMPTY": 0,
    "WALL": 1,
    "WIND": 2,
};
const WIND_TYPES = {
    "UP": [0, -1],
    "DOWN": [0, 1],
    "RIGHT": [1, 0],
    "LEFT": [-1, 0],
};
const TILE_DESCRIPTIONS = {
    "WALL": { type: TILE_TYPES.WALL },
    "EMPTY": { type: TILE_TYPES.EMPTY },
    "UP_WIND": { type: TILE_TYPES.WIND, move: WIND_TYPES.UP },
    "DOWN_WIND": { type: TILE_TYPES.WIND, move: WIND_TYPES.DOWN },
    "RIGHT_WIND": { type: TILE_TYPES.WIND, move: WIND_TYPES.RIGHT },
    "LEFT_WIND": { type: TILE_TYPES.WIND, move: WIND_TYPES.LEFT },
}
const testInput = "#.######\n\
#>>.<^<#\n\
#.<..<<#\n\
#>v.><>#\n\
#<^v^^>#\n\
######.#";
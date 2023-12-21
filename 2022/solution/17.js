import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

const testInput = ">>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>";

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const jetStream = parseInput(input);
    // const jetStream = parseInput(testInput);
    const result = rockFall(jetStream, rocks, 7, 1_000_000_000_000);
    // const result = rockFall(jetStream, rocks, 7, 2022);
    return result
}

const parseInput = input => input.split("").map(e => ({ "<": -1, ">": 1 })[e]);

const rocks = [
    { height: 1, shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
    { height: 3, shape: [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }] },
    { height: 3, shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }] },
    { height: 4, shape: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] },
    { height: 2, shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
];

const rockFall = (jetStream, rocks, width, duration) => {
    // 0 - AIR, 1 - WALL/ROCK, 2 - FALLING ROCK 
    let highestPoint = 0, rock = 0, timer = 0;
    const cave = [new Array(width).fill(0)];
    const stateMap = {};

    for (let rock = 0; rock < duration; rock++) {
        const fallingRock = getRock(rocks, rock % rocks.length, highestPoint);
        while (cave.length < 3 + highestPoint + fallingRock.height) {
            cave.push(new Array(width).fill(0));
        }
        timer = singleRockFall(cave, fallingRock, jetStream, timer);
        highestPoint = Math.max(highestPoint, fallingRock.position.y + fallingRock.height)
        timer %= jetStream.length;
        const { floor } = new Floor(cave);
        if (!floor) continue;

        const existingEntry = stateMap[`${rock % rocks.length},${timer},${floor.path}`];
        if (existingEntry == undefined) {
            stateMap[`${rock % rocks.length},${timer},${floor.path}`] = {
                rock: rock,
                height: highestPoint,
            };
            continue;
        }

        const loopHeight = highestPoint - existingEntry.height;
        const loopDuration = rock - existingEntry.rock;
        const loops = Math.floor((duration - existingEntry.rock) / loopDuration);
        const remainder = (duration - existingEntry.rock) % loopDuration;
        const baseHighestPoint = highestPoint;
        for (let stone = 1; stone <= remainder; stone++) {
            const fallingRock = getRock(rocks, (rock + stone) % rocks.length, highestPoint);
            while (cave.length < 3 + highestPoint + fallingRock.height) {
                cave.push(new Array(width).fill(0));
            }
            timer = singleRockFall(cave, fallingRock, jetStream, timer);
            highestPoint = Math.max(highestPoint, fallingRock.position.y + fallingRock.height)
            timer %= jetStream.length;
        }
        const remainderHighestPoint = highestPoint - baseHighestPoint;
        // IT GIVES OUT A NUMBER WHICH IS 1 OR 2 HIGHER THAN THE CORRECT ANSWER AND I DON'T KNOW WHY
        return loopHeight * loops + remainderHighestPoint + existingEntry.height;
    }
    // gives correct answer(found no loops)
    return highestPoint
}

const getRock = (rocks, rock, highestPoint) => ({
    position: { x: 2, y: highestPoint + 3 },
    shape: rocks[rock].shape,
    height: rocks[rock].height,
});

const singleRockFall = (cave, rock, jetStream, timer) => {
    while (true) {
        rockMove(cave, rock, { y: 0, x: jetStream[timer % jetStream.length] })
        timer++;
        if (!rockMove(cave, rock, { y: -1, x: 0 })) break;
    }
    const { x, y } = rock.position;
    rock.shape.forEach(tile => {
        const { x: dx, y: dy } = tile;
        cave[y + dy][x + dx] = 1;
    })
    return timer;
}

const rockMove = (cave, rock, move) => {
    const { x: dx, y: dy } = move;
    const width = cave[0].length;
    const newX = dx + rock.position.x;
    const newY = dy + rock.position.y;
    let didMove = false;
    if (rock.shape.every(tile => {
        const x = newX + tile.x;
        const y = newY + tile.y;
        return y > -1 && cave[y][x] != 1 && x > -1 && x < width
            ? true
            : false
    })) {
        didMove = true;
        rock.position = { x: newX, y: newY };
    }
    return didMove;
};

class Floor {
    static facing = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 };
    static direction = { FORWARD: 0, RIGHT: 1, BACKWARD: 2, LEFT: 3 };
    static move = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    constructor(cave) {
        this.facing = Floor.facing.UP;
        this.floor = this.getFloor(cave);
        return this.floor;
    };
    getFloor = (cave) => {
        const width = cave[0].length;
        const floor = { height: 0 };
        for (let y = cave.length - 1; y >= 0; y--) {
            if (cave[y][0]) {
                floor.height = y + 1;
                break;
            }
        };
        let move = [0, floor.height], stopped = true, direction;
        floor.path = 0;
        for (let i = 0; i <= 25; i++) {
            ({ move, stopped, direction } = this.computeMove(move, cave, width));
            if (stopped) break;
            floor.path += (4 ** i) * direction;
        }
        return stopped ? { floor } : {}
    }
    computeMove = (position, cave, width) => {
        return this.move("RIGHT", position, cave, width) || this.move("FORWARD", position, cave, width)
            || (position[0] >= width - 1
                ? { stopped: true }
                : this.move("LEFT", position, cave, width) || this.move("BACKWARD", position, cave, width));
    }
    getMovement = (direction) => Floor.move[(Floor.direction[direction] + this.facing) % 4];
    move = (direction, [x, y], cave, width) => {
        const [dx, dy] = this.getMovement(direction);
        const moveTo = [x + dx, y + dy];
        if (Floor.checkMoveValidity(moveTo, cave, width)) {
            this.facing = (this.facing + Floor.direction[direction]) % 4;
            return { direction: Floor.direction[direction], move: moveTo };
        }
        return false;
    }
    static checkMoveValidity = ([x, y], cave, width) => {
        return y > -1 && cave[y][x] != 1 && x > -1 && x < width
    };
}
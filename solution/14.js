import * as fs from "fs/promises";
import { WebSocketServer } from 'ws';

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const parsedInput = parseInput(input);
    drawCave(parsedInput);
    const result = 1;
    return result
}

const parseInput = input => input.split(/\n+/)
    .map(line => line.split(" -> ")
        .map(point => point.split(",")
            .map(value => parseInt(value))));

const setCaveState = (rockList) => {
    // 0 - AIR, 1 - ROCK, 2 - SAND
    const [width, height] = rockList.reduce((size, rock) => rock.reduce((rowSize, point) =>
        [Math.max(rowSize[0], point[0] + 1), Math.max(rowSize[1], point[1] + 2)], [size[0], size[1]]),
        [0, 0]);

    const cave = new Array(height).fill(0).map(_ => new Array(width).fill(0));

    rockList.forEach(rock => {
        rock.forEach((_, i) => {
            const coordinateList = getRockLine(rock[i], rock[i + 1]);
            coordinateList.forEach((coordinate) => {
                const [x, y] = coordinate;
                cave[y][x] = 1;
            })
        });
    });
    return cave
}

const getRockLine = (first, second) => {
    if (!second) return []
    const direction = (first[0] + first[1] - second[0] - second[1]) <= 0 ? 1 : -1;
    return first[0] == second[0]
        ? new Array(Math.abs(first[1] - second[1]) + 1).fill(1).map((_, i) => [first[0], first[1] + direction * i])
        : new Array(Math.abs(first[0] - second[0]) + 1).fill(1).map((_, i) => [first[0] + direction * i, first[1]])
}

const drawCave = parsedInput => {
    const canvasWebSocketServer = new WebSocketServer({ port: 3000 });
    canvasWebSocketServer.on('connection', (ws) => {
        console.log("Canvas connected");
        let sand = [defaultSand()];
        const cave = setCaveState(parsedInput);
        let state = { step: 0 };

        ws.send(JSON.stringify(caveToWSMessage(cave)));
        let shouldHalt = updateCave(cave, sand, state);

        ws.on('message', (e) => {
            const message = JSON.parse(e);
            switch (message?.type) {
                case 1:
                    if (!shouldHalt) {
                        ws.send(JSON.stringify(sandToWSMessage(sand)));
                        sand = sand.filter(grain => grain.state);
                        shouldHalt = true;
                        shouldHalt = updateCave(cave, sand, state);
                    } else {
                        console.log(cave.reduce((sum, row) => sum + row.reduce((rowSum, cell) =>
                            rowSum + (cell == 2), 0), 0));
                    }
                    break;
            }
        })
    })
}

const updateCave = (cave, sand, state) => {

    if (!sand.length) return true;

    const shouldHalt = sand.some((grain, i) => {
        const { x, y } = grain;
        if (grain.state) {
            switch (true) {
                case !cave[y + 1]:
                    cave[y][x] = 2;
                    sand[i] = { state: false, x, y, value: 2 }; return false;
                case cave[y + 1][x] == 0:
                    sand[i] = { state: true, x, y: y + 1, value: 3 }; return false;
                case cave[y + 1][x - 1] == 0:
                    sand[i] = { state: true, x: x - 1, y: y + 1, value: 3 }; return false;
                case cave[y + 1][x + 1] == 0:
                    sand[i] = { state: true, x: x + 1, y: y + 1, value: 3 }; return false;
                case !cave[y + 1][x - 1]:
                    if ((y + 1) == cave.length) {
                        cave[y][x] = 2;
                        sand[i] = { state: false, x, y, value: 2 }; return false;
                    } else {
                        sand[i] = { state: true, x: x - 1, y: y + 1, value: 3 }; return false;
                    }
                case !cave[y + 1][x + 1]:
                    if ((y + 1) == cave.length) {
                        cave[y][x] = 2;
                        sand[i] = { state: false, x, y, value: 2 }; return false;
                    } else {
                        sand[i] = { state: true, x: x + 1, y: y + 1, value: 3 }; return false;
                    }
            }
        }
        cave[y][x] = 2;
        sand[i] = { state: false, x, y, value: 2 };
        return false;
    });

    if (state.step) sand.push(defaultSand());
    state.step = 1 - state.step;
    return shouldHalt;
}


const caveToWSMessage = cave => ({
    type: 1,
    height: cave.length,
    width: cave[0].length,
    cave: cave.reduce((pointList, row, y) => {
        pointList.push(...row.reduce((rowPointList, point, x) => {
            rowPointList.push({ x, y, value: point })
            return rowPointList
        }, []))
        return pointList;
    }, [])
});

const sandToWSMessage = sand => ({
    type: 2,
    sand
})

const defaultSand = () => ({ state: true, x: 500, y: 0, value: 3 })
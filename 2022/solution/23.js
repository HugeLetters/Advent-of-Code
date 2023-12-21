import * as fs from "fs/promises";
import { WebSocketServer } from "ws";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const testing = process.argv[2] == "testing";

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    input = testing ? testInput : input;
    const elves = parseInput(input);
    simulateElves(elves, 10);
    const result = 1;
    return result
}

const simulateElves = (originalElves, rounds) => {
    const webSocketServer = new WebSocketServer({ port: 3000 });
    webSocketServer.on('connection', (ws) => {
        console.log("Canvas connected");
        const elves = structuredClone(originalElves);
        let move = 0;
        ws.send(JSON.stringify(elves));
        ws.on('message', () => {
            if ((move >= rounds && false) || simulateStep(elves, move)) {
                ws.close();
                const boundaryRect = Object.values(elves).reduce((boundary, elf) => {
                    boundary.min = boundary.min.map((value, axis) => Math.min(value, elf[axis]));
                    boundary.max = boundary.max.map((value, axis) => Math.max(value, elf[axis]));
                    return boundary;
                }, { min: [Infinity, Infinity], max: [-Infinity, -Infinity] });
                const totalArea = (boundaryRect.max[0] - boundaryRect.min[0] + 1) * (boundaryRect.max[1] - boundaryRect.min[1] + 1)
                console.log(totalArea - Object.keys(elves).length);
                console.log(move+1);
            };
            ws.send(JSON.stringify(elves));
            move++;
        });
    })
    return originalElves;
}
const simulateStep = (elves, firstMove) => {
    const proposedMoves = {};
    Object.values(elves).forEach(elf => {
        const [moves, isAlone] = checkProximity(elf, elves);
        if (isAlone) { elf.move = false; return null };
        moves.some((_, move) => {
            move = (move + firstMove) % 4;
            if (moves[move]) {
                const d = MOVE_PRIORITY[move];
                const destination = elf.map((pos, axis) => pos + d[axis]);
                elf.move = destination;
                proposedMoves[destination] = proposedMoves[destination] != undefined ? false : true;
                return true;
            }
            return false;
        })
    });
    let isStopped = true;
    Object.values(elves).forEach(elf => {
        if (elf.move && proposedMoves[elf.move]) {
            isStopped = false;
            elves[elf.move] = elf.move;
            delete elves[elf];
        }
    })
    return isStopped;
};
const checkProximity = (elf, elves) => {
    const moves = MOVE_PRIORITY.map(move =>
        [-1, 0, 1].every((step) => {
            const d = move.map(axis => axis ? axis : axis + step);
            const destination = elf.map((pos, axis) => pos + d[axis]);
            return elves[`${destination}`] ? false : true;
        })
    )
    return [moves, moves.every(e => e == true)]
}
const parseInput = input => {
    const elfMap = {};
    input.split(/\n+/).map((line, y) => line.split("").forEach((s, x) => {
        if (s == "#") elfMap[`${x},${y}`] = [x, y];
    }));
    return elfMap;
}

const MOVE_PRIORITY = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const testInput = ["....#..\n\
..###.#\n\
#...#.#\n\
.#...##\n\
#.###..\n\
##.#.##\n\
.#..#..", ".....\n\
..##.\n\
..#..\n\
.....\n\
..##.\n\
....."][0]
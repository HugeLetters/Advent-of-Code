import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const moveList = getMoveList(input);

    let head = { x: 0, y: 0, tail: {} };
    let currentKnot = head;
    for (let i = 0; i < 8; i++) {
        currentKnot.tail = { x: 0, y: 0, tail: {} };
        currentKnot = currentKnot.tail;
    }
    currentKnot.tail = { x: 0, y: 0 };

    const tailPath = moveList.reduce((path, move) => {
        const delta = getDeltaXY(move[0]);
        for (let i = 0; i < move[1]; i++) {
            head = performHeadMove(head, delta);
            let currentKnot = head;
            while (currentKnot.tail) {
                currentKnot.tail = checkProximity(currentKnot.tail, currentKnot)
                    ? currentKnot.tail
                    : performTailMove(currentKnot.tail, currentKnot);
                currentKnot = currentKnot.tail;
            }
            path[`${currentKnot.x}|${currentKnot.y}`] = true;
        }
        return path;
    }, {});
    const result = tailPath;
    return Object.keys(result).length
}

const getMoveList = input => input.split(/\n+/).map(move => move.split(/\s+/)).map(move => [move[0], parseInt(move[1])]);
const getDeltaXY = move => ({
    U: { x: 0, y: 1 },
    D: { x: 0, y: -1 },
    R: { x: 1, y: 0 },
    L: { x: -1, y: 0 },
}[move])

const performHeadMove = (head, delta) => ({ ...head, x: head.x + delta.x, y: head.y + delta.y })
const performTailMove = (tail, knot) => {
    const delta = {
        x: knot.x - tail.x,
        y: knot.y - tail.y,
    }
    return {
        ...tail,
        x: tail.x + (delta.x / Math.abs(delta.x) || 0),
        y: tail.y + (delta.y / Math.abs(delta.y) || 0),
    }
}
const checkProximity = (tailOrigin, headOrigin) => Math.abs(tailOrigin.x - headOrigin.x) <= 1 & Math.abs(tailOrigin.y - headOrigin.y) <= 1

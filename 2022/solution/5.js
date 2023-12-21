import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const [inputStack, inputMoves] = getStacksAndMoves(input);
    const stackInfo = splitStackInfo(inputStack);
    const stackArray = getStackArray(stackInfo.slice(0, -1), ...stackInfo.slice(-1));
    const movesArray = getMovesArray(inputMoves);
    const finalStack = movesArray.reduce((curStack, move) => performMove(curStack, move), stackArray);
    const result = getTopCrates(finalStack);
    return result
}

const getStacksAndMoves = input => input.split(/\n{2,}/);
const splitStackInfo = inputStack => inputStack
    .split(/\n/)
    .map(e => e.split(""));

const getStackArray = (stackRows, colNumers) => {
    const stackArray = new Array(parseInt(colNumers.findLast(e => e != " "))).fill(1).map(e => []);
    stackRows.forEach((row) => {
        row.forEach((crate, index) => {
            if (colNumers[index] != " " & crate != " ") {
                stackArray[parseInt(colNumers[index]) - 1].unshift(crate)
            }
        })
    });
    return stackArray;
}

const getMovesArray = inputMoves => inputMoves
    .split(/\n+/)
    .map(e => e
        .replace(/(move )|( from )|( to )/g, match => match == "move " ? "" : ",")
        .split(",")
        .map(e => parseInt(e)));

const performMove = (stack, move) => {
    // In stack top crates are last in array
    const newStack = structuredClone(stack);
    const [quantity, _from, _to] = move;
    const [from, to] = [_from - 1, _to - 1];
    const movedCrates = [];
    for (let count = 1; count <= quantity; count++) {
        movedCrates.unshift(newStack[from].pop())
    }
    newStack[to].push(...movedCrates);
    return newStack
}

const getTopCrates = stack => stack.map(e => e.slice(-1)[0]).join("")
import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const grid = getGrid(input);
    const { start, end } = getInfoGrid(grid);
    const shortestPath = findClosestStart(start, end, pathEstimate);
    const gridWithPath = showGridPath(grid, shortestPath.path);
    const result = shortestPath;
    fs.writeFile(`./output/${fileName}.txt`, gridWithPath)
    return result
}

const getGrid = input => input.split(/\n+/).map(line => line.split(""));

const getInfoGrid = grid => {
    const directions = {
        LEFT: { x: -1, y: 0 },
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        RIGHT: { x: 1, y: 0 },
    }

    const infoGrid = grid.map((row, r) => row.map((_, c) => ({ x: c, y: r, id: `${c}|${r}`, neighbours: [] })));
    let start = [], end;
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            switch (cell) {
                case "S":
                case "a": start.push(infoGrid[r][c]); break;
                case "E": end = infoGrid[r][c];
            }
            Object.entries(directions).forEach(d => {
                if (getCellValue(cell) >= getCellValue(grid[r + d[1].y]?.[c + d[1].x]) - 1) {
                    infoGrid[r][c].neighbours.push(infoGrid[r + d[1].y]?.[c + d[1].x]);
                }
            })
        });
    })
    return { start, end }
}

const getCellValue = cell => ({ S: "a", E: "w" }[cell] || cell || "~").charCodeAt(0)

const findShortestPath = (start, end, estimate) => {
    const consideredNodes = new priorityQueue([start], (a, b) => getScore(totalScore, a) - getScore(totalScore, b))
    const originNode = {}, interimScore = { [start.id]: 0 }, totalScore = { [start.id]: estimate(start, end) };

    while (consideredNodes.getElements().length != 0) {
        const current = consideredNodes.popHead();
        if (current.x == end.x && current.y == end.y) {
            return { score: getScore(totalScore, current), path: getPath(originNode, end) }
        }
        const currentScore = getScore(interimScore, current) + 1;
        current.neighbours.forEach(neighbour => {
            if (currentScore < getScore(interimScore, neighbour)) {
                originNode[neighbour.id] = current;
                interimScore[neighbour.id] = currentScore;
                totalScore[neighbour.id] = currentScore + estimate(neighbour, end);
                if (!consideredNodes.getElements().includes(neighbour)) {
                    consideredNodes.addValue(neighbour);
                }
            }
        })
    }

    return { score: "Failed", path: [] }
}

const findClosestStart = (start, end, estimate) => {
    const originNode = {}, interimScore = {}, totalScore = {};
    const consideredNodes = new priorityQueue(start, (a, b) => getScore(totalScore, a) - getScore(totalScore, b))
    consideredNodes.getElements().forEach(node => {
        interimScore[node.id] = 0;
        totalScore[node.id] = estimate(node, end);
    }
    )

    while (consideredNodes.getElements().length != 0) {
        const current = consideredNodes.popHead();

        if (current.x == end.x && current.y == end.y) {
            return { score: getScore(totalScore, current), path: getPath(originNode, end) }
        }
        const currentScore = getScore(interimScore, current) + 1;
        current.neighbours.forEach(neighbour => {
            if (currentScore < getScore(interimScore, neighbour)) {
                originNode[neighbour.id] = current;
                interimScore[neighbour.id] = currentScore;
                totalScore[neighbour.id] = currentScore + estimate(neighbour, end);
                if (!consideredNodes.getElements().includes(neighbour)) {
                    consideredNodes.addValue(neighbour);
                }
            }
        })
    }

    return { score: "Failed", path: [] }
}

const getScore = (scoreMap, entity) => scoreMap[entity.id] === undefined ? Infinity : scoreMap[entity.id]
const pathEstimate = (start, end) => Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
const getPath = (originMap, end) => {
    const path = [];
    let current = end;
    while (current) {
        const { x, y } = current;
        path.unshift({ x, y });
        current = originMap[current.id];
    }
    return path;
}

const showGridPath = (grid, path) => {
    const newGrid = grid.map(row => row.map(cell => cell));
    path.forEach(step => {
        const { x, y } = step;
        newGrid[y][x] = newGrid[y][x].toUpperCase();
    })
    return newGrid.map(row => row.join("") + "\n").join("")
}

class priorityQueue {
    constructor(data, compareFunc) {
        this.compareFunc = (a, b) => -compareFunc(a, b);
        this.queue = this.#createQueue(data);
    }
    #createQueue = (data) => {
        const queue = [...data].sort(this.compareFunc);
        return queue
    }
    popHead = () => this.queue.pop();
    getHead = () => this.queue[this.queue.length - 1];
    getNthElement = (n) => this.queue[n];
    getElements = () => this.queue;
    addValue = (value) => {
        let l = 0, r = this.queue.length - 1;
        let insertPoint = r + 1;

        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            const compareResult = this.compareFunc(this.getNthElement(m), value);
            switch (true) {
                case compareResult < 0: l = m + 1; break;
                case compareResult > 0: r = m - 1; insertPoint = r + 1; break;
                case compareResult == 0:
                    l = r + 1;
                    insertPoint = m + 1;
            }
        }

        this.queue.splice(insertPoint, 0, value);
        return this
    }
}
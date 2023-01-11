import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const treeGrid = getGrid(input);
    const sides = ["top", "bottom", "left", "right"];
    const sizes = [...Array(10).keys()];
    const infoGrid = getInfoGrid(treeGrid, sides, sizes);
    const scenicScores = getTreeScenicScore(infoGrid, sides, sizes);
    const result = scenicScores.reduce((max, treeRow) => Math.max(
        max,
        treeRow.reduce((maxRow, tree) => Math.max(maxRow, tree))), -1);
    return result
}

const getGrid = input => input.split(/\n+/).map(e => e.split("").map(e => parseInt(e)));
const getInfoGrid = (grid, sides, sizes) => {
    grid = grid.map(treeRow => treeRow.map(tree => ({ value: tree })));
    sides.forEach(side => {
        // grid = getSideBoundary(grid, side)
        grid = getSideVisibility(grid, side, sizes)
    })
    return grid
}

const getSideBoundary = (grid, side) => {
    const { lineLength, gridLength, currentCell } = side == "top" | side == "bottom"
        ? { lineLength: i => grid[i].length, gridLength: grid.length, currentCell: (l, c) => grid[l][c] }
        : { lineLength: () => grid.length, gridLength: grid[0].length, currentCell: (l, c) => grid[c][l] };

    const { start, end, inc } = side == "top" | side == "left"
        ? { start: 0, end: gridLength, inc: 1 }
        : { start: gridLength - 1, end: -1, inc: -1 };

    for (let cellIndex = 0; cellIndex < lineLength(start); cellIndex++) {
        currentCell(start, cellIndex)[side] = -1
    }

    for (let lineIndex = start + inc; inc * lineIndex < inc * end; lineIndex += inc) {
        for (let cellIndex = 0; cellIndex < lineLength(lineIndex); cellIndex++) {
            currentCell(lineIndex, cellIndex)[side] = Math.max(
                currentCell(lineIndex - inc, cellIndex).value,
                currentCell(lineIndex - inc, cellIndex)[side]);
        }
    }
    return grid;
}

const countVisibleTrees = (grid, sides) => grid
    .reduce((gridSum, rowTree) => gridSum + rowTree
        .reduce((rowSum, tree) => rowSum + sides
            .some(side => tree.value > tree[side]), 0), 0)

const getSideVisibility = (grid, side, sizes) => {
    const { lineLength, gridLength, currentCell } = side == "top" | side == "bottom"
        ? { lineLength: i => grid[i].length, gridLength: grid.length, currentCell: (l, c) => grid[l][c] }
        : { lineLength: () => grid.length, gridLength: grid[0].length, currentCell: (l, c) => grid[c][l] };

    const { start, end, inc } = side == "top" | side == "left"
        ? { start: 0, end: gridLength, inc: 1 }
        : { start: gridLength - 1, end: -1, inc: -1 };

    for (let cellIndex = 0; cellIndex < lineLength(start); cellIndex++) {
        currentCell(start, cellIndex)[side] = {};
        sizes.forEach(size => {
            currentCell(start, cellIndex)[side][size] = 0;
        })
    }

    for (let lineIndex = start + inc; inc * lineIndex < inc * end; lineIndex += inc) {
        for (let cellIndex = 0; cellIndex < lineLength(lineIndex); cellIndex++) {
            currentCell(lineIndex, cellIndex)[side] = {};
            sizes.forEach(size => {
                currentCell(lineIndex, cellIndex)[side][size] = 1 + currentCell(lineIndex - inc, cellIndex)[side][size]
            });
            currentCell(lineIndex, cellIndex)[side][currentCell(lineIndex - inc, cellIndex).value] = 1;
        }
    }
    return grid;
}

const getTreeScenicScore = (grid, sides, sizes) => grid.map(treeRow => treeRow.map(tree => {
    const filteredSize = sizes.filter(size => size >= tree.value);
    const scenicScore = sides.reduce((scenicScore, side) => scenicScore * filteredSize.reduce((minDistance, size) => Math.min(minDistance, tree[side][size]), tree[side][filteredSize[0]]), 1);
    return scenicScore
}))
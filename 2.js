import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(fileName + ".txt", "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const winCondition = { A: "C", B: "A", C: "B" };
    const loseCondition = { A: "B", B: "C", C: "A" };
    const choicePoints = { A: 1, B: 2, C: 3 };
    const resultPoints = { WIN: 6, DRAW: 3, LOSE: 0 };

    const inputList = listFromInput(input);
    const matchList = inputList.map(e => [e[0], calculateMove(e, winCondition, loseCondition)]);
    const matchResults = matchList.map(e => getResultPoints(e, resultPoints, winCondition) + getChoicePoints(e, choicePoints));
    const result = matchResults.reduce((sum, e) => sum + e)
    return result
}

const listFromInput = input => input
    .split(/\n{1,}/)
    .map(e => e
        .split(/\s+/)
        .map(e => ({ X: "LOSE", Y: "DRAW", Z: "WIN" }[e] || e)));

const getResultPoints = (match, pointsMap, winMap) => winMap[match[1]] == match[0]
    ? pointsMap.WIN
    : match[1] == match[0]
        ? pointsMap.DRAW
        : pointsMap.LOSE

const getChoicePoints = (match, pointsMap) => pointsMap[match[1]]

const calculateMove = (match, winMap, loseMap) => match[1] == "DRAW"
    ? match[0]
    : match[1] == "WIN"
        ? loseMap[match[0]]
        : winMap[match[0]]
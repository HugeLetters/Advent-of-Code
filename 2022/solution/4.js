import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const inputList = inputToList(input);
    const isOverlappedList = inputList.map(e => isOverlapped(e));
    const result = isOverlappedList.reduce((sum, val) => val ? sum + 1 : sum)
    return result
}

const inputToList = input => input.split(/\n{1,}/)
    .map(e => e
        .split(/\,/)
        .map(e => e
            .split(/-/)
            .map(e => parseInt(e))))

const isContained = rangePair => {
    const [first, second] = rangePair;
    const [start, end] = [first[0] - second[0], second[1] - first[1]];
    return start * end >= 0 ? true : false
}

const isOverlapped = rangePair => {
    const [first, second] = rangePair;
    return !((first[0] > second[1]) || (first[1] < second[0]))
}
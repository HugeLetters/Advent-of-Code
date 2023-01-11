import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(fileName + ".txt", "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const inputList = getElfListFromInput(input);
    const parsedList = parseElfList(inputList);
    const sumList = getElfSums(parsedList);
    return getTopThree(sumList);
}

// BOTH
const getElfListFromInput = input => input.split(/\n{2,}/).map(e => e.split(/\n/))
const parseElfList = array => array.map(elf => elf.map(e => parseInt(e)))
const getElfSums = array => array.map(elf => elf.reduce((acc, val) => acc + val))

// PART ONE
const getMax = array => array.reduce((max, val) => Math.max(max, val))

// PART TWO
const getTopThree = array => array.reduce((top, val) => updateTopThree(top, val), [-Infinity, -Infinity, -Infinity])
const updateTopThree = (top, value) => {
    const insertIndex = top.reduce((replacedIndex, el, i) => {
        return value > el ? i : replacedIndex
    }, -1)
    const result = [...top];
    result.splice(insertIndex + 1, 0, value);
    return result.slice(1)
}
import { reverse } from "dns";
import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const testing = process.argv[2] == "testing";

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    input = testing ? testInput : input;
    const SNAFUfuelReqs = parseInput(input);
    const decFuelReqs = SNAFUfuelReqs.map(req => SNAFUtoDec(req));
    const totalFuelReqs = decFuelReqs.reduce((sum, req) => sum + req)
    const result = decToSNAFU(totalFuelReqs);
    return result
}

const parseInput = (input) => input.split(/\n+/).map(line => line.split(""));
const SNAFUtoDec = (snafu) => [...snafu].reverse().reduce((result, s, i) => result + (5 ** i) * (({ "-": -1, "=": -2, }[s]) ?? parseInt(s)), 0);
const decToSNAFU = (x) => {
    const quinary = x.toString(5).split("").map(e => parseInt(e)).reverse();
    quinary.forEach((digit, i) => {
        if (digit > 2) {
            quinary[i] = digit - 5;
            quinary[i + 1] += 1;
        }
    });
    return quinary.reverse().map(n=>({"-2":"=","-1":"-"}[n])??`${n}`).join("")
}
const testInput = "1=-0-2\n\
12111\n\
2=0=\n\
21\n\
2=01\n\
111\n\
20012\n\
112\n\
1=-1=\n\
1-12\n\
12\n\
1=\n\
122";
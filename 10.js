import { sign } from "crypto";
import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const commandList = getCommandList(input)
    const signal = getSignal(commandList);
    const result = signal;
    return result
}

const getCommandList = input => input.split(/\n+/).map(e => e.split(" ")).map(
    e => e[0] == "noop"
        ? e
        : [e[0], parseInt(e[1])]);

const getSignal = commands => {
    let x = 1, cycle = 1, render = [];
    commands.forEach(command => {
        switch (command[0]) {
            case "addx":
                ({ render, cycle } = nextCyclewithRender(cycle, x, render));
                ({ render, cycle } = nextCyclewithRender(cycle, x, render));
                x += command[1];
                break;
            default:
                ({ render, cycle } = nextCyclewithRender(cycle, x, render));
                break;
        }
    });
    return render.join("");
};

const nextCyclewithSignal = (cycle, x, signal) => (cycle - 20) % 40
    ? { signal, cycle: cycle + 1 }
    : { signal: signal + cycle * x, cycle: cycle + 1 }

const nextCyclewithRender = (cycle, x, render) => {
    const renderPosition = cycle % 40;
    render.push((x <= renderPosition & x + 2 >= renderPosition) ? "#" : ".");
    if (!renderPosition) { render.push("\n") }
    return { render, cycle: cycle + 1 }
}
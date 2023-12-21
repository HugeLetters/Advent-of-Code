import * as fs from "fs/promises";
import { lcm } from "../utils.js"

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const monkeyList = getMonkeyList(input);
    const newMonkeyList = executeRounds(monkeyList, 10000);
    // console.log(newMonkeyList);
    const result = getMonkeyBusiness(newMonkeyList);
    return result
}

const getMonkeyList = input => {
    const inputList = input.split(/\n{2,}/).map(monkey => monkey.split(/\n/).map(line => line.trim()));
    const monkeyList = [];
    const lineInterpreter = {
        "Starting items": args => args.split(/,|\s/).filter(e => e).map(e => parseInt(e)),
        Operation: args => (old) => eval(args.match(/=(.+)/)[1]),
        Test: args => parseInt(args.match(/\d+/g)[0]),
        "If true": args => parseInt(args.match(/\d+/g)[0]),
        "If false": args => parseInt(args.match(/\d+/g)[0]),
    }

    inputList.forEach(monkey => {
        const monkeyNum = parseInt(monkey[0].match(/Monkey (.+):/)[1]);
        monkeyList[monkeyNum] = { inspected: 0 };
        const currentMonkey = monkeyList[monkeyNum];
        monkey.slice(1).forEach(line => {
            const [_, command, args] = line.match(/(.+):(.+)/);
            currentMonkey[command] = lineInterpreter[command](args);
        })
    });

    return monkeyList
}

const executeRounds = (monkeyList, rounds) => {
    const worryManager = lcm(...monkeyList.map(e => e.Test));
    for (let i = 0; i < rounds; i++) {
        monkeyList.forEach(monkey => {
            const { "Starting items": items, "Operation": operation, "Test": test, "If true": ifTrue, "If false": ifFalse } = monkey;
            items.forEach(item => {
                const worryLevel = operation(item) % worryManager;
                monkey.inspected++;
                monkeyList[!(worryLevel % test) ? ifTrue : ifFalse]["Starting items"].push(worryLevel)
            });
            monkey["Starting items"] = [];
        })
    }
    return monkeyList
}

const getMonkeyBusiness = monkeyList => monkeyList.reduce((max, monkey) => {
    return monkey.inspected > max[0]
        ? [monkey.inspected, max[1]].sort((a, b) => a - b)
        : max
}
    , [monkeyList[0].inspected, monkeyList[1].inspected].sort((a, b) => a - b)).reduce((prod, val) => prod *= val)
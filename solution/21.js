import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    // input = testInput;
    const monkeys = parseInput(input);
    let guess = 0, direction = 1, step = 1;;
    for (let proximity = monkeys.root(guess); proximity;) {
        guess += step * direction;
        const newProximity = monkeys.root(guess);
        step = Math.ceil(newProximity / (Math.ceil(Math.abs(newProximity - proximity) / step)));
        if (proximity < newProximity) {
            direction *= -1;
        } else {
            proximity = newProximity;
        };
    }
    const result = guess - step * direction;
    return result
}

const parseInput = input => {
    const monkeyList = input.split(/\n+/).map(line => line.split(/[\s:]+/));
    const monkeyObject = {};
    monkeyList.forEach(monkey => {
        const jobDescription = monkey.slice(1);
        monkeyObject[monkey[0]] = jobDescription;
    });
    monkeyList.forEach(monkey => {
        monkey = monkey[0];
        const jobDescription = monkeyObject[monkey]
        if (monkey == "root") {
            const [monkey1, , monkey2] = jobDescription;
            monkeyObject[monkey] = (guess) => Math.abs(monkeyObject[monkey1](guess) - monkeyObject[monkey2](guess))
            return null;
        }
        if (monkey == "humn") {
            monkeyObject[monkey] = (guess) => guess;
            return null;
        }
        if (jobDescription.length > 1) {
            const [monkey1, operator, monkey2] = jobDescription;
            monkeyObject[monkey] = (guess) => eval("monkeyObject[monkey1](guess)" + operator + "monkeyObject[monkey2](guess)")
        }
        else { monkeyObject[monkey] = () => parseInt(jobDescription[0]) }
    });
    monkeyList.forEach(monkey => {
        monkey = monkey[0];
        const result = monkeyObject[monkey]();
        if (Math.abs(result + 1)) {
            monkeyObject[monkey] = () => result;
        }
    })
    return monkeyObject;
}


const testInput = "root: pppw + sjmn\n\
dbpl: 5\n\
cczh: sllz + lgvd\n\
zczc: 2\n\
ptdq: humn - dvpt\n\
dvpt: 3\n\
lfqf: 4\n\
humn: 5\n\
ljgn: 2\n\
sjmn: drzm * dbpl\n\
sllz: 4\n\
pppw: cczh / lfqf\n\
lgvd: ljgn * ptdq\n\
drzm: hmdt - zczc\n\
hmdt: 32"
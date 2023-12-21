import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const testInput = "1\n\
2\n\
-3\n\
3\n\
-2\n\
0\n\
4"

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const cipher = parseInput(input);
    // const cipher = parseInput(testInput);
    const orderList = cipher.map((_, i) => i);
    const length = orderList.length - 1;
    for (let _ = 0; _ < 10; _++) {
        for (let i = 0; i <= length; i++) {
            if (!cipher[i]) continue;
            const index = orderList.indexOf(i);
            orderList.splice(index, 1);
            const newIndex = modShift(index + cipher[i], length);
            orderList.splice(modShift(newIndex, length), 0, i);
        }
    }
    const decipher = orderList.map(i => cipher[i]);
    const offset = decipher.indexOf(0);
    const result = decipher[modShift(offset + 1000, decipher.length)] + decipher[modShift(offset + 2000, decipher.length)] + decipher[modShift(offset + 3000, decipher.length)];
    return result
}

const parseInput = input => input.split(/\n/).map(x => 811589153 * parseInt(x));
const modShift = (index, length) => 1 + (((index - 1) % length) + length) % length;
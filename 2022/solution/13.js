import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const packets = parseInputAlt(input);
    packets.push([[2]], [[6]]);
    packets.sort(comparePair);
    const result = (1 + binarySearch(packets, [[2]], comparePair)) * (1 + binarySearch(packets, [[6]], comparePair));
    // PART ONE COUNT
    // const result = packets.reduce((sum, pair, i) => sum + (comparePair(pair[0], pair[1]) < 0 ? i + 1 : 0), 0);
    return result;
}

const parseInput = input => input.split(/\n{2,}/)
    .map(pair => pair.split(/\n+/).map(packet => new parsedPacket(packet)));

const parseInputAlt = input => input.split(/\n+/)
    .map(packet => new parsedPacket(packet));

class parsedPacket {
    #parsedResult = [];
    #current = this.#parsedResult;
    #parents = [];
    #currentInteger = [];

    #parseInteger = () => {
        this.#current.push(parseInt(this.#currentInteger.join("")));
        this.#currentInteger = [];
    }
    #parseOpenBracket = () => {
        this.#parents.push(this.#current);
        this.#current = this.#current[this.#current.push([]) - 1];
    }
    #parseClosedBracket = () => {
        if (this.#currentInteger.length > 0) this.#parseInteger()
        this.#current = this.#parents.pop();
    }
    #parseComma = () => {
        if (this.#currentInteger.length > 0) this.#parseInteger()
    }
    #methodMap = {
        "[": this.#parseOpenBracket,
        "]": this.#parseClosedBracket,
        ",": this.#parseComma,
    }

    constructor(packet) {
        for (let symbol of packet) {
            (this.#methodMap[symbol] || (() => { this.#currentInteger.push(symbol) }))()
        }
        return this.#parsedResult[0];
    }

}

const comparePair = (left, right) => {
    let i = 0;
    while (true) {
        let [leftValue, rightValue] = [left[i], right[i]];

        if (leftValue == undefined | rightValue == undefined) {
            if (leftValue == undefined & rightValue == undefined) return 0;
            else if (leftValue == undefined) return -1
            else if (rightValue == undefined) return 1
        }

        if (typeof leftValue == "number" && typeof rightValue == "number") {
            if (leftValue < rightValue) return -1
            else if (leftValue > rightValue) return 1
        } else {
            if (typeof leftValue != typeof rightValue)
                [leftValue, rightValue] = [convertPairValue(leftValue), convertPairValue(rightValue)];
            const result = comparePair(leftValue, rightValue);
            if (result != 0) return result
        }

        i++;
    }
}

const convertPairValue = value => typeof value == "number" ? [value] : value

const binarySearch = (sortedList, value, compareFN) => {
    let l = 0, r = sortedList.length - 1;
    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        const compareResult = compareFN(sortedList[m], value);
        switch (true) {
            case compareResult < 0: l = m + 1; break;
            case compareResult > 0: r = m - 1; break;
            case compareResult == 0: return m;
        }
    }
    return -1;
}
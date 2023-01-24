export class priorityQueue {
    constructor(data, compareFunc) {
        this.compareFunc = (a, b) => compareFunc(a, b);
        this.queue = this.#createQueue(data);
    }
    #createQueue = (data) => {
        const queue = [...data].sort(this.compareFunc);
        return queue
    }
    popHead = () => this.queue.pop();
    getElements = () => this.queue;
    addValue = (value) => {
        let l = 0, r = this.queue.length - 1;
        let insertPoint = r + 1;

        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            const compareResult = this.compareFunc(this.queue[m], value);
            switch (true) {
                case compareResult < 0: l = m + 1; break;
                case compareResult > 0: r = m - 1; insertPoint = r + 1; break;
                case compareResult == 0:
                    l = r + 1;
                    insertPoint = m + 1;
            }
        }

        this.queue.splice(insertPoint, 0, value);
        return this
    }
}

export const gcd = (a, b) => {
    while (a * b) {
        return gcd(a % b, b % a)
    }
    return a + b
}

export const lcm = (...args) => {
    return args.reduce((lcm, value) => Math.abs(lcm) * (Math.abs(value) / gcd(lcm, value)))
}
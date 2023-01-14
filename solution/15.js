import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const searchedRow = 2_000_000;
    const boundary = [0, 4_000_000];

    const inputList = parseInput(input);
    const sensors = parseSensorList(inputList);
    const size = sensors.reduce((size, sensor) => {
        const { x, y } = sensor.sensor;
        const { radius } = sensor;
        return [
            Math.min(size[0], x - radius),
            Math.max(size[1], x + radius),
            Math.min(size[2], y - radius),
            Math.max(size[3], y + radius)]
    },
        [Infinity, -Infinity, Infinity, -Infinity]);

    const filteredSensors = sensors.filter(sensor =>
        (sensor.sensor.y + sensor.radius) >= searchedRow
        & (sensor.sensor.y - sensor.radius) <= searchedRow);

    const beacon = findBeacon(sensors, boundary);

    const result = beacon;

    return result
}

const parseInput = input => input.split(/\n+/)
    .map(line => line.match(/-?\d+/g).map(xy => parseInt(xy)));

const parseSensorList = list => list.map(e => ({
    sensor: { x: e[0], y: e[1] },
    beacon: { x: e[2], y: e[3] },
    radius: Math.abs(e[0] - e[2]) + Math.abs(e[1] - e[3])
}))

// I know this is a shit solution 😠
const countMarkedOffPoints = (sensors, row, size) => {
    const [xMin, xMax, yMin, yMax] = size;
    return new Array(xMax - xMin + 1).fill(false)
        .reduce((sum, _, col) => sum + sensors.some(sensor => {
            const { x, y } = sensor.sensor;
            const { radius } = sensor;
            return ((Math.abs(col + xMin - x) + Math.abs(row - y)) <= radius)
                & !(row == sensor.beacon.y & (col + xMin) == sensor.beacon.x)
        }), 0)
}

const findBeacon = (sensors, boundary) => {
    const [min, max] = boundary;

    for (let row = min; row <= max; row++) {
        const usedRanges = sensors.reduce((usedRanges, sensor) => {
            const { x, y } = sensor.sensor;
            const { radius } = sensor;
            const horizontalDelta = radius - Math.abs(y - row);
            const range = [
                Math.max(min, x - horizontalDelta),
                Math.min(max, x + horizontalDelta)];
            if (range[1] > range[0]) usedRanges.push(range);
            return usedRanges
        }, []).sort((a, b) => a[0] - b[0]);

        const parsedRanges = usedRanges.reduce((usedRange, range, i) => {
            if (!range.length | i == 0) return usedRange;
            const last = usedRange[usedRange.length - 1];
            if (1 + range[1] >= last[0] & range[0] <= last[1] + 1) {
                last[0] = Math.min(range[0], last[0]);
                last[1] = Math.max(range[1], last[1]);
            } else {
                usedRange.push(range)
            }
            return usedRange;
        }, [usedRanges[0]]);

        if (parsedRanges.length > 1) return max * (parsedRanges[0][1] + 1) + row
    }

    return "Oh no...";
}
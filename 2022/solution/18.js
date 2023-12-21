import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const sampleInput = "2, 2, 2\n\
1, 2, 2\n\
3, 2, 2\n\
2, 1, 2\n\
2, 3, 2\n\
2, 2, 1\n\
2, 2, 3\n\
2, 2, 4\n\
2, 2, 6\n\
1, 2, 5\n\
3, 2, 5\n\
2, 1, 5\n\
2, 3, 5";

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const coordinateList = parseInput(input);
    // const coordinateList = parseInput(sampleInput);
    const result = countSides(coordinateList);
    return result
}

const parseInput = input => input.split(/\n+/).map(line => line.split(",").map(x => parseInt(x)));
const countSides = (coordinateList) => {
    const dimensions = coordinateList[0].length;
    const defaultSideCount = dimensions * 2;
    const neighbours = getNeighbourShapes(defaultSideCount);
    const [occupiedShapes, boundary, totalSideCount] = parseCoordinateList(coordinateList, neighbours);
    const cavityList = parseBoundaryShape(boundary, occupiedShapes, neighbours);
    const [, , cavitiesSideCount] = parseCoordinateList(cavityList, neighbours);
    return totalSideCount - cavitiesSideCount;
}

const countSidesWithCavities = (coordinateList) => {
    const dimensions = coordinateList[0].length;
    const defaultSideCount = dimensions * 2;
    const neighbours = getNeighbourShapes(defaultSideCount);
    const occupiedShapes = {};
    return coordinateList.reduce((sides, coordinate) => {
        coordinate = coordinate;
        if (occupiedShapes[coordinate]) return sides;
        occupiedShapes[coordinate] = true;
        return sides + defaultSideCount - 2 * neighbours.reduce((touchingSides, neighbour) => {
            const neighbourCoordinate = coordinate.map((e, i) => e + neighbour[i]);
            return touchingSides + (occupiedShapes[neighbourCoordinate] ? 1 : 0)
        }, 0);
    }, 0)
}

const getNeighbourShapes = (sideCount) => new Array(sideCount).fill(null).map((_, i) => {
    const neighbour = new Array(Math.floor(sideCount / 2)).fill(0);
    neighbour[i >> 1] = i % 2 ? 1 : -1;
    return neighbour
})

const parseCoordinateList = (coordinateList, neighbours) => {
    const dimensions = coordinateList[0].length;
    const defaultSideCount = dimensions * 2,
        boundary = new Array(dimensions).fill(1).map(_ => [Infinity, -Infinity]),
        occupiedShapes = {};
    let totalSideCount = 0
    coordinateList.forEach((coordinate) => {
        coordinate.forEach((coordinate, axis) => {
            boundary[axis] = [Math.min(boundary[axis][0], coordinate), Math.max(boundary[axis][1], coordinate)];
        })
        if (occupiedShapes[coordinate]) return null;
        occupiedShapes[coordinate] = true;
        totalSideCount += defaultSideCount - 2 * neighbours.reduce((touchingSides, neighbour) => {
            const neighbourCoordinate = coordinate.map((e, i) => e + neighbour[i]);
            return touchingSides + (occupiedShapes[neighbourCoordinate] ? 1 : 0);
        }, 0);
    });
    return [occupiedShapes, boundary, totalSideCount];
}

const parseBoundaryShape = (boundary, occupiedShapes, neighbours) => {
    const dimensions = boundary.length;
    let boundaryPoint = new Array(dimensions).fill(0).map((_, i) => boundary[i][0]);
    const _count = boundary.reduce((prod, axis) => prod * (axis[1] - axis[0] + 1), 1);
    const emptyShapes = [], outerShapesQueue = [], visitedOuterShapes = {};
    for (let _ = 0; _ < _count; _++, boundaryPoint = incrementCoordinate(boundaryPoint, boundary)) {
        if (occupiedShapes[boundaryPoint]) continue;
        emptyShapes.push(boundaryPoint);
        if (isOuter(boundaryPoint, boundary)) {
            visitedOuterShapes[boundaryPoint] = true;
            outerShapesQueue.push(boundaryPoint)
        };
    }
    while (outerShapesQueue.length) {
        const current = outerShapesQueue.pop();
        neighbours.forEach(neighbour => {
            const neighbourCoordinate = current.map((e, i) => e + neighbour[i]);
            if (occupiedShapes[neighbourCoordinate]
                || visitedOuterShapes[neighbourCoordinate]
                || isOutofBounds(neighbourCoordinate, boundary)) return null;
            visitedOuterShapes[neighbourCoordinate] = true;
            outerShapesQueue.push(neighbourCoordinate);
        });
    }
    const cavities = emptyShapes.filter(shape => !visitedOuterShapes[shape])
    return cavities;
}

const incrementCoordinate = (point, boundary) => {
    point = [...point];
    for (let axis = 0; axis < point.length; axis++) {
        point[axis]++;
        point[axis] = (point[axis] - boundary[axis][0]) % boundary[axis][1];
        point[axis] += boundary[axis][0];
        if (point[axis] - boundary[axis][0]) break;
    }
    return point;
}

const isOuter = (point, boundary) => point.some((axis, i) => {
    return axis == boundary[i][0] || axis == boundary[i][1]
})

const isOutofBounds = (point, boundary) => point.some((axis, i) => {
    return axis < boundary[i][0] || axis > boundary[i][1]
})
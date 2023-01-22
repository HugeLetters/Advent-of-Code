import * as fs from "fs/promises";
import { argv } from "process";
import { WebSocketServer } from "ws";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");
const testing = false* 1;

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    input = [input, testInput][testing];
    const map = parseInput(input);
    return walkPath(map);
}

const parseInput = input => {
    const lines = input.split(/\n+/);
    const path = lines.pop().match(/(\d+)|([RL])/g).map(e => parseInt(e) || e);
    const field = lines.map(line => {
        const tiles = line.split("");
        return tiles.map(e => ({ " ": TILES.OUTSIDE, "#": TILES.WALL, ".": TILES.EMPTY }[e]));
    });
    return { path, field };
};
const getPassword = ([col, row, face]) => 1000 * row + 4 * col + face;
const walkPath = ({ field, path }) => {
    const webSocketServer = new WebSocketServer({ port: 3000 });
    webSocketServer.on('connection', (ws) => {
        console.log("Canvas connected");
        let direction = DIRECTION.RIGHT;
        let position = [field[0].indexOf(TILES.EMPTY), 0];
        if (position[0] == -1) throw "TOP ROW IS NOT EMPTY";
        const size = {
            height: field.length,
            width: field.reduce((width, row) => Math.max(width, row.length), 0)
        };
        ws.send(JSON.stringify({ type: 0, field, ...size }));
        let i = 0
        ws.on('message', (e) => {
            let move = path[i];
            i++;
            if (move == undefined) {
                position[0]++;
                position[1]++;
                ws.close();
                return console.log(getPassword([...position, direction]));;
            }
            direction %= MOVE.length;
            if (!(move > -1)) {
                direction += { "L": 3, "R": 1 }[move];
            } else {
                [position, direction] = moveForward(field, position, direction, move);
            }
            ws.send(JSON.stringify({ type: 1, position: { x: position[0], y: position[1] } }));
        });
    });

}
const moveForward = (field, position, direction, move) => {
    let nx, ny, wrapDirection;
    for (let step = 0; step < move; step++) {
        const [dx, dy] = MOVE[direction];
        [nx, ny, wrapDirection] = loopPosition(field, position, [dx, dy], direction)
        if (field[ny][nx] == TILES.WALL) {
            return [position, direction];
        }
        direction = wrapDirection;
        position = [nx, ny];
    }
    return [position, direction];
}
const loopPosition = (field, [x, y], [dx, dy], direction) => {
    if (field[y + dy]?.[x + dx] != TILES.OUTSIDE) return [x + dx, y + dy, direction]
    const positionFace = getFaceNo([x, y]);
    const [wrapFace, wrapDirection] = CUBE_CONNECTIONS[positionFace][direction];
    const sideRelativePosition = getWrapRelativePosition(direction, wrapDirection, [x, y]);
    const absolutePosition = sideRelativePosition.map((coordinate, axis) => CUBE_FACES[wrapFace][axis] + coordinate)
    return [...absolutePosition, wrapDirection];
}

const getFaceNo = ([x, y]) => {
    return CUBE_FACES.reduce((result, face, index) => {
        return (x >= face[0] && x < face[0] + SIDE_SIZE) && (y >= face[1] && y < face[1] + SIDE_SIZE) ? index : result
    }, -1)
}
const getWrapRelativePosition = (direction, wrapDirection, [x, y]) => {
    let preservedAxis = [DIRECTION.DOWN, DIRECTION.UP].includes(direction)
        ? x % SIDE_SIZE
        : y % SIDE_SIZE;
    if (direction != wrapDirection && DIRECT_AXIS[direction] != wrapDirection) {
        preservedAxis = SIDE_SIZE - 1 - preservedAxis;
    }
    return {
        [DIRECTION.UP]: [preservedAxis, SIDE_SIZE - 1],
        [DIRECTION.RIGHT]: [0, preservedAxis],
        [DIRECTION.DOWN]: [preservedAxis, 0],
        [DIRECTION.LEFT]: [SIDE_SIZE - 1, preservedAxis],
    }[wrapDirection]
}
const DIRECTION = { RIGHT: 0, DOWN: 1, LEFT: 2, UP: 3 };
const MOVE = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const TILES = { OUTSIDE: undefined, EMPTY: 1, WALL: 0 };
const DIRECT_AXIS = {
    [DIRECTION.UP]: DIRECTION.RIGHT,
    [DIRECTION.RIGHT]: DIRECTION.UP,
    [DIRECTION.DOWN]: DIRECTION.LEFT,
    [DIRECTION.LEFT]: DIRECTION.DOWN,
}
const SIDE_SIZE = [50, 4][testing];
const CUBE_FACES = [[
    [SIDE_SIZE, 0],
    [SIDE_SIZE * 2, 0],
    [SIDE_SIZE, SIDE_SIZE],
    [0, SIDE_SIZE * 2],
    [SIDE_SIZE, SIDE_SIZE * 2],
    [0, SIDE_SIZE * 3],
], [
    [SIDE_SIZE * 2, 0],
    [0, SIDE_SIZE],
    [SIDE_SIZE, SIDE_SIZE],
    [SIDE_SIZE * 2, SIDE_SIZE],
    [SIDE_SIZE * 2, SIDE_SIZE * 2],
    [SIDE_SIZE * 3, SIDE_SIZE * 2],
]
][testing];
const CUBE_CONNECTIONS = [[
    { [DIRECTION.UP]: [5, DIRECTION.RIGHT], [DIRECTION.RIGHT]: [1, DIRECTION.RIGHT], [DIRECTION.DOWN]: [2, DIRECTION.DOWN], [DIRECTION.LEFT]: [3, DIRECTION.RIGHT] },
    { [DIRECTION.UP]: [5, DIRECTION.UP], [DIRECTION.RIGHT]: [4, DIRECTION.LEFT], [DIRECTION.DOWN]: [2, DIRECTION.LEFT], [DIRECTION.LEFT]: [0, DIRECTION.LEFT] },
    { [DIRECTION.UP]: [0, DIRECTION.UP], [DIRECTION.RIGHT]: [1, DIRECTION.UP], [DIRECTION.DOWN]: [4, DIRECTION.DOWN], [DIRECTION.LEFT]: [3, DIRECTION.DOWN] },
    { [DIRECTION.UP]: [2, DIRECTION.RIGHT], [DIRECTION.RIGHT]: [4, DIRECTION.RIGHT], [DIRECTION.DOWN]: [5, DIRECTION.DOWN], [DIRECTION.LEFT]: [0, DIRECTION.RIGHT] },
    { [DIRECTION.UP]: [2, DIRECTION.UP], [DIRECTION.RIGHT]: [1, DIRECTION.LEFT], [DIRECTION.DOWN]: [5, DIRECTION.LEFT], [DIRECTION.LEFT]: [3, DIRECTION.LEFT] },
    { [DIRECTION.UP]: [3, DIRECTION.UP], [DIRECTION.RIGHT]: [4, DIRECTION.UP], [DIRECTION.DOWN]: [1, DIRECTION.DOWN], [DIRECTION.LEFT]: [0, DIRECTION.DOWN] },
], [
    { [DIRECTION.UP]: [1, DIRECTION.DOWN], [DIRECTION.RIGHT]: [5, DIRECTION.LEFT], [DIRECTION.DOWN]: [3, DIRECTION.DOWN], [DIRECTION.LEFT]: [2, DIRECTION.DOWN] },
    { [DIRECTION.UP]: [0, DIRECTION.DOWN], [DIRECTION.RIGHT]: [2, DIRECTION.RIGHT], [DIRECTION.DOWN]: [4, DIRECTION.UP], [DIRECTION.LEFT]: [5, DIRECTION.UP] },
    { [DIRECTION.UP]: [0, DIRECTION.RIGHT], [DIRECTION.RIGHT]: [3, DIRECTION.RIGHT], [DIRECTION.DOWN]: [4, DIRECTION.RIGHT], [DIRECTION.LEFT]: [1, DIRECTION.LEFT] },
    { [DIRECTION.UP]: [0, DIRECTION.UP], [DIRECTION.RIGHT]: [5, DIRECTION.DOWN], [DIRECTION.DOWN]: [4, DIRECTION.DOWN], [DIRECTION.LEFT]: [2, DIRECTION.LEFT] },
    { [DIRECTION.UP]: [3, DIRECTION.UP], [DIRECTION.RIGHT]: [5, DIRECTION.RIGHT], [DIRECTION.DOWN]: [1, DIRECTION.UP], [DIRECTION.LEFT]: [2, DIRECTION.UP] },
    { [DIRECTION.UP]: [3, DIRECTION.LEFT], [DIRECTION.RIGHT]: [0, DIRECTION.LEFT], [DIRECTION.DOWN]: [1, DIRECTION.RIGHT], [DIRECTION.LEFT]: [4, DIRECTION.LEFT] },
]
][testing];

const testInput = "        ...#\n\
        .#..\n\
        #...\n\
        ....\n\
...#.......#\n\
........#...\n\
..#....#....\n\
..........#.\n\
        ...#....\n\
        .....#..\n\
        .#......\n\
        ......#.\n\
\n\
10R5L5R10L4R5L5"
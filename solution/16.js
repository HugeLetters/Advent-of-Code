import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    console.time(1);

    const graph = parseInput(input);
    const distanceMap = transformDistanceMap(graph, FWPath(graph));
    const clearGraph = parseGraph(graph, distanceMap, "AA")
    // const result = findBestPath(clearGraph, 30, "START", clearGraph["START"].refs);
    const result = findBestPathDuo(testGraph, [100, 100], ["START", "START"], testGraph["START"].refs);

    console.timeEnd(1);
    return result
}

const parseInput = input => {
    const output = {};
    input.split(/\n+/).forEach(line => {
        const data = line.match(/(?:(?<=Valve )\w+)|\d+|(?:(?<=valves? ).+)/g);
        output[data[0]] = {
            value: parseInt(data[1]),
            refs: data[2].split(", ")
        }
    });

    return output;
}

const FWPath = graph => {
    const nodeList = Object.keys(graph);
    const distanceMap = {};
    nodeList.forEach(node => {
        distanceMap[node] = { [node]: 0 };
        graph[node].refs.forEach(ref => {
            distanceMap[node][ref] = 1;
        })
    })

    nodeList.forEach(k => {
        nodeList.forEach(i => {
            nodeList.forEach(j => {
                const newDistance = getFWDistance(distanceMap, i, k) + getFWDistance(distanceMap, k, j);
                if (getFWDistance(distanceMap, i, j) > newDistance)
                    distanceMap[i][j] = newDistance
            })
        })
    })
    return distanceMap;
}

const getFWDistance = (distanceMap, start, end) => distanceMap[start]?.[end] != undefined ? distanceMap[start][end] : Infinity

const transformDistanceMap = (graph, distanceMap) => {
    const nodeList = Object.keys(graph);
    const filteredMap = {};
    nodeList.forEach(start => {
        filteredMap[start] = {};
        Object.keys(distanceMap[start]).forEach(end => {
            if (graph[end]?.value && start != end) filteredMap[start][end] = distanceMap[start][end] + 1
        })
    })
    return filteredMap;
}

const parseGraph = (graph, distanceMap, start) => {
    const newGraph = graph[start].value
        ? {
            [start]: { value: graph[start].value, refs: distanceMap[start] },
            "START": { value: 0, refs: { ...distanceMap[start], [start]: 1 } },
        }
        : {
            "START": { value: 0, refs: distanceMap[start] },
        };
    const nodeList = Object.keys(distanceMap[start]);
    nodeList.forEach(node => {
        if (graph[node].value || node == start)
            newGraph[node] = {
                value: graph[node].value,
                refs: distanceMap[node]
            }
    })
    return newGraph;
}

const findBestPath = (graph, limit, start, unvisited) => {
    const nodeList = Object.keys(unvisited);

    return nodeList.reduce((max, node) => {
        const timer = limit - graph[start].refs[node];
        if (timer >= 0) {
            const { [node]: _, ...restUnvisited } = unvisited;
            const pressure = timer * graph[node].value +
                (restUnvisited != {} ? findBestPath(graph, timer, node, restUnvisited) : 0);
            max = Math.max(max, pressure);
        }
        return max
    }, 0);
}

const findBestPathDuo = (graph, limit, start, unvisited) => {
    let max = 0;
    const nodeList = Object.keys(unvisited);
    const [limit1, limit2] = limit;
    const [start1, start2] = start;
    nodeList.forEach(node1 => {
        const timer1 = limit1 - graph[start1].refs[node1];
        if (timer1 >= 0) {

            const { [node1]: _, ...restUnvisited1 } = unvisited;
            const nodeList1 = Object.keys(restUnvisited1);

            const pressure1 = timer1 * graph[node1].value +
                (restUnvisited1 != {} ? findBestPathDuo(graph, [timer1, limit2], [node1, start2], restUnvisited1) : 0);;

            const pressure2 = nodeList1.reduce((max2, node2) => {
                const timer2 = limit2 - graph[start2].refs[node2];
                if (timer2 >= 0) {
                    const { [node2]: _, ...restUnvisited2 } = restUnvisited1;
                    const pressure2 = timer2 * graph[node2].value +
                        (restUnvisited2 != {} ? findBestPathDuo(graph, [timer1, timer2], [node1, node2], restUnvisited2) : 0);
                    max2 = Math.max(max2, pressure2);
                }
                return max2
            }, 0);
            max = Math.max(max, pressure1 + pressure2)
        }
    })
    return max;
}

const testGraph = {
    "START": { value: 0, refs: { "A": 99, "B": 1, "C": 2 } },
    "A": { value: 10000, refs: { "B": 100, "C": 101 } },
    "B": { value: 10, refs: { "A": 100, "C": 1 } },
    "C": { value: 10, refs: { "A": 101, "B": 1, } },
}
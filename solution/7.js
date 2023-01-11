import { dir } from "console";
import * as fs from "fs/promises";

const fileName = import.meta.url.match(/\/([^\/]+?)\.js$/)[1];
const input = fs.readFile(`./input/${fileName}.txt`, "utf-8");

input
    .then(input => { console.log(solution(input)) })
    .catch(error => { console.error(`Error occured\n${error}`); });

const solution = (input) => {
    const inputList = getInputList(input);
    const root = getFileStructure(inputList);
    const filteredDirs = getDirsbyCondition(root, dir => dir.files < 100000);
    const result = findDirtoDelete(root, 70_000_000, 30_000_000)
    return result
}

const getInputList = input => input.split(/\n+/).map(e => e.split(" ")).filter(e => e[1] != "ls")

const getFileStructure = terminalOutput => {
    const cdSpecialArg = { "/": () => root }
    const lineInterpreter = {
        $: {
            cd: arg => { currentDir = (cdSpecialArg[arg] || (() => currentDir[arg]))() },
        },
        dir: name => {
            if (!currentDir[name]) {
                currentDir[name] = { files: 0 };
                currentDir[name][".."] = currentDir;
            }
        },
        file: (_, size) => {
            let tempDir = currentDir;
            while (tempDir !== tempDir[".."]) {
                tempDir.files += parseInt(size);
                tempDir = tempDir[".."];
            }
            root.files += parseInt(size);
        }
    };

    const root = { files: 0 };
    root[".."] = root;

    let currentDir = root;
    terminalOutput.forEach(line => {
        line[0] == "$"
            ? lineInterpreter["$"][line[1]](line[2])
            : (lineInterpreter[line[0]] || (lineInterpreter.file))(line[1], line[0])
    });
    return root;
}

const getDirsbyCondition = (dir, condition) => {
    const dirList = [];
    if (condition(dir)) { dirList.push(dir) };
    const subDirs = Object.keys(dir).filter(e => e != ".." & e != "files");
    dirList.push(...subDirs.reduce((filteredDirs, subDir) => {
        filteredDirs.push(...getDirsbyCondition(dir[subDir], condition));
        return filteredDirs
    }, []));
    return dirList;
}

const findDirtoDelete = (dir, totalSpace, requiredSpace) => {
    const target = requiredSpace - (totalSpace - dir.files);
    const candidates = getDirsbyCondition(dir, dir => dir.files > target);
    const bestCandidate = candidates.reduce((min, e) => ({ files: Math.min(min.files, e.files) }))
    return bestCandidate.files
}

const getDirswithoutParents = dir => dir.map(e => {
    const { "..": _, ...rest } = e;
    return rest
})
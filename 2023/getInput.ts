import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import { env } from 'node:process';

export function getInput(day: number) {
  return readFile(`./input/${day}.txt`, { encoding: 'utf-8' }).catch(() => {
    const session = env.SESSION;
    if (!session) {
      throw new Error('Session env variable is not set.');
    }
    return fetch(`https://adventofcode.com/2023/day/${day}/input`, {
      headers: { Cookie: `session=${session}` },
    })
      .then((r) => {
        if (!r.ok) {
          r.text().then(console.error);
          throw new Error("This endpoint isn't available yet");
        }
        return r.text();
      })
      .then((data) => {
        const text = data.at(-1) === '\n' ? data.slice(0, -1) : data;
        writeFile(`./input/${day}.txt`, text);
        return text;
      });
  });
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw new Error('No id present');

  return getInput(+id);
});

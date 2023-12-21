type Letters = {
  A: ["█▀█ ", "█▀█ ", "▀ ▀ "];
  B: ["█▀▄ ", "█▀▄ ", "▀▀  "];
  C: ["█▀▀ ", "█ ░░", "▀▀▀ "];
  E: ["█▀▀ ", "█▀▀ ", "▀▀▀ "];
  H: ["█ █ ", "█▀█ ", "▀ ▀ "];
  I: ["█ ", "█ ", "▀ "];
  M: ["█▄░▄█ ", "█ ▀ █ ", "▀ ░░▀ "];
  N: ["█▄░█ ", "█ ▀█ ", "▀ ░▀ "];
  P: ["█▀█ ", "█▀▀ ", "▀ ░░"];
  R: ["█▀█ ", "██▀ ", "▀ ▀ "];
  S: ["█▀▀ ", "▀▀█ ", "▀▀▀ "];
  T: ["▀█▀ ", "░█ ░", "░▀ ░"];
  Y: ["█ █ ", "▀█▀ ", "░▀ ░"];
  W: ["█ ░░█ ", "█▄▀▄█ ", "▀ ░ ▀ "];
  " ": ["░", "░", "░"];
  ":": ["#", "░", "#"];
  "*": ["░", "#", "░"];
};

type StringTrio = [string, string, string];

type MergeTrio<A extends StringTrio, B extends StringTrio> = [
  `${A[0]}${B[0]}`,
  `${A[1]}${B[1]}`,
  `${A[2]}${B[2]}`
];

type AsciiArray<
  S extends string,
  $S extends StringTrio[] = [["", "", ""]]
> = S extends `${infer F extends keyof Letters}${infer R}`
  ? AsciiArray<R, $S extends [...infer B, infer E extends StringTrio] ? [...B, MergeTrio<E, Letters[F]>] : $S>
  : S extends `\n${infer R}`
  ? AsciiArray<R, [...$S, ["", "", ""]]>
  : $S;

type Flatten<A, $A extends any[] = []> = A extends [infer F extends any[], ...infer R]
  ? Flatten<R, [...$A, ...F]>
  : $A;

type ToAsciiArt<I extends string> = Flatten<AsciiArray<Uppercase<I>>>;

type TupleIndex<Tuple extends any[]> = keyof Tuple & `${number}` extends `${infer Number extends number}`
  ? Number
  : never;

type Connect4Chip = "🔴" | "🟡";
type Connect4EmptyCell = "  ";
type Connect4Cell = Connect4Chip | Connect4EmptyCell;
type Connect4Win<Chip extends Connect4Chip> = `${Chip} Won`;
type Connect4State = Connect4Chip | Connect4Win<Connect4Chip> | "Draw";
type Connect4Row = [
  Connect4Cell,
  Connect4Cell,
  Connect4Cell,
  Connect4Cell,
  Connect4Cell,
  Connect4Cell,
  Connect4Cell
];
type Connect4Board = [Connect4Row, Connect4Row, Connect4Row, Connect4Row, Connect4Row, Connect4Row];
type Connect4RowIndex = TupleIndex<Connect4Board>;
type Connect4ColIndex = TupleIndex<Connect4Row>;
type Connect4Game = {
  board: Connect4Board;
  state: Connect4State;
};

type EmptyRow<$Row = Connect4Row> = { [Col in keyof $Row]: Connect4EmptyCell };
type EmptyBoard<$Board = Connect4Board> = { [Row in keyof $Board]: EmptyRow };
type NewGame = {
  board: EmptyBoard;
  state: "🟡";
};

type UpdateRow<Row extends Connect4Row, Col extends Connect4ColIndex, Value extends Connect4Cell> = {
  [C in keyof Row]: C extends `${Col}` ? Value : Row[C];
};
type PlaceChip<
  Board extends Connect4Row[],
  Col extends Connect4ColIndex,
  Value extends Connect4Cell,
  $NewBoard extends Connect4Row[] = []
> = Board extends [...infer Top extends Connect4Row[], infer Bottom extends Connect4Row]
  ? Bottom[Col] extends Connect4EmptyCell
    ? [...Top, UpdateRow<Bottom, Col, Value>, ...$NewBoard]
    : PlaceChip<Top, Col, Value, [Bottom, ...$NewBoard]>
  : $NewBoard;

type TupleOfLength<
  Length extends number,
  $Acc extends number[] = [],
  $Length extends number = $Acc["length"]
> = $Length extends Length ? $Acc : TupleOfLength<Length, [...$Acc, $Length]>;

type Range<Lower extends number, Higher extends number> = TupleOfLength<Higher> extends [
  ...TupleOfLength<Lower>,
  ...infer Rest extends number[]
]
  ? [...Rest, Higher]
  : [];

type AddThree<A extends number> = [...TupleOfLength<A>, ...TupleOfLength<3>]["length"] & number;

type FourRange<R extends number> = Range<R, AddThree<R>>;
type AssertRange<Range extends number[], Boundary extends number> = Range[number] extends Boundary
  ? Range
  : never;
type Connect4FourRange<Boundary extends number, Value extends Boundary = Boundary> = Value extends Value
  ? AssertRange<FourRange<Value>, Boundary>
  : never;
type Connect4WinRowRange = Connect4FourRange<Connect4ColIndex>;
type Connect4WinColRange = Connect4FourRange<Connect4RowIndex>;
type DistributedTuple<T> = T extends T ? [T] : never;
type Connect4Line<
  $Row extends Array<Connect4RowIndex>,
  $Col extends Array<Connect4ColIndex>
> = $Row extends $Row ? ($Col extends $Col ? [[$Row[number], $Col[number]]] : never) : never;
type Connect4WinRow = Connect4Line<DistributedTuple<Connect4RowIndex>, Connect4WinRowRange>;
type Connect4WinCol = Connect4Line<Connect4WinColRange, DistributedTuple<Connect4ColIndex>>;

type ConcatPairs<A extends any[], B extends any[]> = [A, B] extends [
  [infer FA, ...infer RA],
  [infer FB, ...infer RB]
]
  ? [FA, FB] | ConcatPairs<RA, RB>
  : never;
type Reverse<Arr extends unknown[], $Rev extends Arr[number][] = []> = Arr extends [...infer R, infer F]
  ? Reverse<R, [...$Rev, F]>
  : $Rev;
type Connect4Diagonal<
  $Row extends Connect4RowIndex[] = Connect4WinColRange,
  $Col extends Connect4ColIndex[] = Connect4WinRowRange
> = $Row extends $Row ? ($Col extends $Col ? [ConcatPairs<$Row, $Col>] : never) : never;
type Connect4CrossDiagonal = Connect4Diagonal<Reverse<Connect4WinColRange>>;

type Connect4WinLine = Connect4WinRow | Connect4WinCol | Connect4Diagonal | Connect4CrossDiagonal;

type GetValue<
  Board extends Connect4Board,
  Coordinate extends [Connect4RowIndex, Connect4ColIndex]
> = Coordinate extends Coordinate ? Board[Coordinate[0]][Coordinate[1]] : never;
type IsWin<
  Board extends Connect4Board,
  Chip extends Connect4Chip,
  $Line extends Connect4WinLine = Connect4WinLine
> = true extends ($Line extends $Line ? (GetValue<Board, $Line[0]> extends Chip ? true : false) : never)
  ? true
  : false;

type GameResult<Board extends Connect4Board, State extends Connect4Chip> = {
  board: Board;
  state: IsWin<Board, State> extends true
    ? Connect4Win<State>
    : Connect4EmptyCell extends Board[Connect4RowIndex][Connect4ColIndex]
    ? Exclude<Connect4Chip, State>
    : "Draw";
};

type Connect4<Game extends Connect4Game, Col extends Connect4ColIndex> = GameResult<
  PlaceChip<Game["board"], Col, Game["state"] & Connect4Chip>,
  Game["state"] & Connect4Chip
>;

type PipeMoves<Game extends Connect4Game, Moves extends Connect4ColIndex[]> = Moves extends [
  infer F extends Connect4ColIndex,
  ...infer R extends Connect4ColIndex[]
]
  ? PipeMoves<Connect4<Game, F>, R>
  : Game;

// !----------------------------

import { Expect, Equal } from "type-testing";

type test_move1_actual = Connect4<NewGame, 0>;
//   ^?
type test_move1_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "]
  ];
  state: "🔴";
};
type test_move1 = Expect<Equal<test_move1_actual, test_move1_expected>>;

type test_move2_actual = Connect4<test_move1_actual, 0>;
//   ^?
type test_move2_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "]
  ];
  state: "🟡";
};
type test_move2 = Expect<Equal<test_move2_actual, test_move2_expected>>;

type test_move3_actual = Connect4<test_move2_actual, 0>;
//   ^?
type test_move3_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "]
  ];
  state: "🔴";
};
type test_move3 = Expect<Equal<test_move3_actual, test_move3_expected>>;

type test_move4_actual = Connect4<test_move3_actual, 1>;
//   ^?
type test_move4_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "🔴", "  ", "  ", "  ", "  ", "  "]
  ];
  state: "🟡";
};
type test_move4 = Expect<Equal<test_move4_actual, test_move4_expected>>;

type test_move5_actual = Connect4<test_move4_actual, 2>;
//   ^?
type test_move5_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "🔴", "🟡", "  ", "  ", "  ", "  "]
  ];
  state: "🔴";
};
type test_move5 = Expect<Equal<test_move5_actual, test_move5_expected>>;

type test_move6_actual = Connect4<test_move5_actual, 1>;
//   ^?
type test_move6_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "🔴", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "🔴", "🟡", "  ", "  ", "  ", "  "]
  ];
  state: "🟡";
};
type test_move6 = Expect<Equal<test_move6_actual, test_move6_expected>>;

type test_red_win_actual = Connect4<
  {
    board: [
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🔴", "🔴", "🔴", "  ", "  ", "  ", "  "],
      ["🟡", "🔴", "🟡", "🟡", "  ", "  ", "  "]
    ];
    state: "🔴";
  },
  3
>;

type test_red_win_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "🔴", "🔴", "🔴", "  ", "  ", "  "],
    ["🟡", "🔴", "🟡", "🟡", "  ", "  ", "  "]
  ];
  state: "🔴 Won";
};

type test_red_win = Expect<Equal<test_red_win_actual, test_red_win_expected>>;

type test_yellow_win_actual = Connect4<
  {
    board: [
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
      ["🔴", "  ", "🔴", "🔴", "  ", "  ", "  "],
      ["🟡", "  ", "🟡", "🟡", "  ", "  ", "  "]
    ];
    state: "🟡";
  },
  1
>;

type test_yellow_win_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🟡", "  ", "  ", "  ", "  ", "  ", "  "],
    ["🔴", "  ", "🔴", "🔴", "  ", "  ", "  "],
    ["🟡", "🟡", "🟡", "🟡", "  ", "  ", "  "]
  ];
  state: "🟡 Won";
};

type test_yellow_win = Expect<Equal<test_yellow_win_actual, test_yellow_win_expected>>;

type test_diagonal_yellow_win_actual = Connect4<
  {
    board: [
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "🟡", "🔴", "  ", "  ", "  "],
      ["🔴", "🟡", "🔴", "🔴", "  ", "  ", "  "],
      ["🟡", "🔴", "🟡", "🟡", "  ", "  ", "  "]
    ];
    state: "🟡";
  },
  3
>;

type test_diagonal_yellow_win_expected = {
  board: [
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ["  ", "  ", "  ", "🟡", "  ", "  ", "  "],
    ["  ", "  ", "🟡", "🔴", "  ", "  ", "  "],
    ["🔴", "🟡", "🔴", "🔴", "  ", "  ", "  "],
    ["🟡", "🔴", "🟡", "🟡", "  ", "  ", "  "]
  ];
  state: "🟡 Won";
};

type test_diagonal_yellow_win = Expect<
  Equal<test_diagonal_yellow_win_actual, test_diagonal_yellow_win_expected>
>;

type test_draw_actual = Connect4<
  {
    board: [
      ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "  "],
      ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"],
      ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "🟡"],
      ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"],
      ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "🟡"],
      ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"]
    ];
    state: "🟡";
  },
  6
>;

type test_draw_expected = {
  board: [
    ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "🟡"],
    ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"],
    ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "🟡"],
    ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"],
    ["🟡", "🔴", "🔴", "🟡", "🟡", "🔴", "🟡"],
    ["🔴", "🟡", "🟡", "🔴", "🔴", "🟡", "🔴"]
  ];
  state: "Draw";
};

type test_draw = Expect<Equal<test_draw_actual, test_draw_expected>>;

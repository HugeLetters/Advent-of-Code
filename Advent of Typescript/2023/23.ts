type Numeric = `${number}`;
type TupleIndicies<Tuple extends any[]> = keyof Tuple & Numeric;
type ParseInt<S extends Numeric> = S extends `${infer N extends number}` ? N : never;

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
type Connect4RowIndex = TupleIndicies<Connect4Board>;
type Connect4ColIndex = TupleIndicies<Connect4Row>;
type Connect4Game = {
  board: Connect4Board;
  state: Connect4State;
};

type EmptyRow = Connect4Row extends infer Row ? { [Col in keyof Row]: Connect4EmptyCell } : never;
type EmptyBoard = Connect4Board extends infer Board ? { [Row in keyof Board]: EmptyRow } : never;
type NewGame = {
  board: EmptyBoard;
  state: "🟡";
};

type UpdateRow<Row extends Connect4Row, Col extends Connect4ColIndex, Value extends Connect4Cell> = {
  [C in keyof Row]: C extends Col ? Value : Row[C];
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
  Length extends Numeric,
  $Acc extends Numeric[] = [],
  $Length extends Numeric = `${$Acc["length"]}`
> = $Length extends Length ? $Acc : TupleOfLength<Length, [...$Acc, $Length]>;

type NumericRange<Lower extends Numeric, Higher extends Numeric> = TupleOfLength<Higher> extends [
  ...TupleOfLength<Lower>,
  ...infer Rest extends Numeric[]
]
  ? [...Rest, Higher]
  : [];

type Add<A extends Numeric, B extends Numeric> = [...TupleOfLength<A>, ...TupleOfLength<B>]["length"] &
  number;

type FourRange<R extends Numeric> = NumericRange<R, `${Add<R, "3">}`>;
type AssertRange<Range extends Numeric[], Boundary extends Numeric> = Range[number] extends Boundary
  ? Range
  : never;
type Connect4FourRange<Boundary extends Numeric, Value extends Boundary = Boundary> = Value extends Value
  ? AssertRange<FourRange<Value>, Boundary>
  : never;
type Connect4WinRowRange = Connect4FourRange<Connect4ColIndex>;
type Connect4WinColRange = Connect4FourRange<Connect4RowIndex>;
type Connect4WinRow<
  $Row extends Connect4RowIndex = Connect4RowIndex,
  $Col extends Connect4WinRowRange = Connect4WinRowRange
> = $Row extends $Row ? ($Col extends $Col ? [[$Row, $Col[number]]] : never) : never;
type Connect4WinCol<
  $Row extends Connect4WinColRange = Connect4WinColRange,
  $Col extends Connect4RowIndex = Connect4RowIndex
> = $Row extends $Row ? ($Col extends $Col ? [[$Row[number], $Col]] : never) : never;

type ConcatPairs<A extends any[], B extends any[]> = [A, B] extends [
  [infer FA, ...infer RA],
  [infer FB, ...infer RB]
]
  ? [FA, FB] | ConcatPairs<RA, RB>
  : never;

type Connect4Diagonal<
  $Row extends Connect4RowIndex[] = Connect4WinColRange,
  $Col extends Connect4ColIndex[] = Connect4WinRowRange
> = $Row extends $Row ? ($Col extends $Col ? [ConcatPairs<$Row, $Col>] : never) : never;

type Reverse<Arr extends unknown[], $Rev extends Arr[number][] = []> = Arr extends [...infer R, infer F]
  ? Reverse<R, [...$Rev, F]>
  : $Rev;

type Connect4CrossDiagonal = Connect4Diagonal<Reverse<Connect4WinColRange>>;
type Connect4WinDiagonal = Connect4Diagonal | Connect4CrossDiagonal;
type Connect4WinLine = Connect4WinRow | Connect4WinCol | Connect4WinDiagonal;

type GetValue<
  Board extends Connect4Board,
  Coordinate extends [Connect4RowIndex, Connect4ColIndex]
> = Coordinate extends Coordinate ? Board[Coordinate[0]][Coordinate[1]] : never;
type IsWin<
  Board extends Connect4Board,
  Chip extends Connect4Chip,
  $Line extends Connect4WinLine = Connect4WinLine
> = true extends ($Line extends $Line ? (GetValue<Board, $Line["0"]> extends Chip ? true : false) : never)
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

type Connect4<Game extends Connect4Game, Col extends ParseInt<Connect4ColIndex>> = GameResult<
  PlaceChip<Game["board"], `${Col}`, Game["state"] & Connect4Chip>,
  Game["state"] & Connect4Chip
>;

type PipeMoves<Game extends Connect4Game, Moves extends ParseInt<Connect4ColIndex>[]> = Moves extends [
  infer F extends ParseInt<Connect4ColIndex>,
  ...infer R extends ParseInt<Connect4ColIndex>[]
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

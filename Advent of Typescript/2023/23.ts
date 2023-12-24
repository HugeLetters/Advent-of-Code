type TupleIndex<Tuple extends any[]> = keyof Tuple & `${number}` extends `${infer Number extends number}`
  ? Number
  : never;
type RangeTuple<
  Length extends number,
  Value = never,
  $Acc extends any[] = [],
  $Length = [Value] extends [never] ? $Acc["length"] : Value
> = [Length] extends [$Acc["length"]] ? $Acc : RangeTuple<Length, Value, [...$Acc, $Length]>;

type Connect4Chip = "🔴" | "🟡";
type Connect4EmptyCell = "  ";
type Connect4Cell = Connect4Chip | Connect4EmptyCell;
type Connect4Win<Chip extends Connect4Chip> = `${Chip} Won`;
type Connect4Draw = "Draw";
type Connect4Row = RangeTuple<7, Connect4Cell>;
type Connect4Board = RangeTuple<6, Connect4Row>;
type Connect4RowIndex = TupleIndex<Connect4Board>;
type Connect4ColIndex = TupleIndex<Connect4Row>;
type Connect4Game = {
  board: Connect4Board;
  state: Connect4Chip | Connect4Win<Connect4Chip> | Connect4Draw;
};

type EmptyRow<$Row = Connect4Row> = { [Col in keyof $Row]: Connect4EmptyCell };
type EmptyBoard<$Board = Connect4Board> = { [Row in keyof $Board]: EmptyRow };
type NewGame = {
  board: EmptyBoard;
  state: "🟡";
};

type AddThree<A extends number> = [...RangeTuple<A>, ...RangeTuple<3>]["length"] & number;
type FourRange<
  Lower extends number,
  Boundary extends number,
  $Higher extends number = AddThree<Lower> & Boundary
> = RangeTuple<$Higher> extends [...any[], ...infer Trio extends [number, number, number]]
  ? [...Trio, $Higher]
  : never;
type Connect4FourRange<Boundary extends number, Value extends Boundary = Boundary> = Value extends Value
  ? FourRange<Value, Boundary>
  : never;
type Connect4WinRowRange = Connect4FourRange<Connect4ColIndex>;
type Connect4WinColRange = Connect4FourRange<Connect4RowIndex>;

type Zip<A extends any[], B extends any[]> = [A, B] extends [[infer FA, ...infer RA], [infer FB, ...infer RB]]
  ? [FA, FB] | Zip<RA, RB>
  : never;
type Connect4MakeLine<$Row extends Connect4RowIndex[], $Col extends Connect4ColIndex[]> = $Row extends $Row
  ? $Col extends $Col
    ? [Zip<$Row, $Col>]
    : never
  : never;
type Tuplify<T> = T extends T ? [T] : never;
type TuplifyValues<T extends any[]> = T extends T ? [T[number]] : never;
type Reverse<Arr extends unknown[], $Rev extends Arr[number][] = []> = Arr extends [...infer R, infer F]
  ? Reverse<R, [...$Rev, F]>
  : $Rev;

type Connect4WinRow = Connect4MakeLine<Tuplify<Connect4RowIndex>, TuplifyValues<Connect4WinRowRange>>;
type Connect4WinCol = Connect4MakeLine<TuplifyValues<Connect4WinColRange>, Tuplify<Connect4ColIndex>>;
type Connect4Diagonal = Connect4MakeLine<Connect4WinColRange, Connect4WinRowRange>;
type Connect4CrossDiagonal = Connect4MakeLine<Reverse<Connect4WinColRange>, Connect4WinRowRange>;
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
    : Connect4Draw;
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

export {};

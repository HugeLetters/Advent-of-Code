type Numeric = `${number}`;
type TupleIndex<T extends any[]> = keyof T & Numeric;
type Alley = "  ";
type Santa = "🎅";
type Tree = "🎄";
type Cookie = "🍪";
type MazeItem = Tree | Santa | Alley | Cookie;
type MazeRow = MazeItem[];
type MazeForest = MazeRow[];
type Direction = "up" | "down" | "left" | "right";
type MazeColumns<Row extends MazeRow> = TupleIndex<Row>;
type MazePosition<Maze extends MazeForest, $Row extends TupleIndex<Maze> = TupleIndex<Maze>> = [
  $Row,
  MazeColumns<Maze[$Row]>
];

type TupleValues<T extends any[]> = { [K in keyof T]: [T[K]] }[number];
type Any<A, B> = true extends (A extends B ? true : false) ? true : false;

type MoveIndex<
  Length extends number,
  Index extends Numeric,
  Direction extends "next" | "prev",
  $Acc extends any[] = [],
  $Inc extends any[] = [0, ...$Acc]
> = `${$Acc["length"]}` extends `${Length}`
  ? never
  : `${(Direction extends "next" ? $Acc : $Inc)["length"]}` extends Index
  ? `${(Direction extends "next" ? $Inc : $Acc)["length"]}`
  : MoveIndex<Length, Index, Direction, $Inc>;

type GetNewPosition<
  Maze extends MazeForest,
  Position extends MazePosition<Maze>,
  Movement extends Direction
> = Extract<
  Movement extends "up"
    ? [MoveIndex<Maze["length"], Position[0], "prev">, Position[1]]
    : Movement extends "down"
    ? [MoveIndex<Maze["length"], Position[0], "next">, Position[1]]
    : Movement extends "left"
    ? [Position[0], MoveIndex<Maze[Position[0]]["length"], Position[1], "prev">]
    : [Position[0], MoveIndex<Maze[Position[0]]["length"], Position[1], "next">],
  MazePosition<Maze>
>;

type FindSantaInRow<Row extends MazeRow> = { [Col in keyof Row]: Row[Col] extends Santa ? Col : never };
type FindSanta<Maze extends MazeForest> = {
  [Row in keyof Maze]: Exclude<[Row, FindSantaInRow<Maze[Row]>[any]], [string, never]>;
}[any];

type UpdateRow<Row extends MazeRow, Position extends MazeColumns<Row>, Value extends MazeItem> = {
  [Col in keyof Row]: Col extends Position ? Value : Row[Col];
};
type UpdatePoint<
  Maze extends MazeForest,
  Position extends MazePosition<Maze>,
  Value extends MazeItem
> = Extract<
  {
    [Row in keyof Maze]: Row extends Position[0] ? UpdateRow<Maze[Row], Position[1], Value> : Maze[Row];
  },
  MazeForest
>;
type MoveSanta<
  Maze extends MazeForest,
  Old extends MazePosition<Maze>,
  New extends MazePosition<Maze>,
  $StepOne extends MazeForest = UpdatePoint<Maze, Old, Alley>
> = UpdatePoint<$StepOne, Extract<New, MazePosition<$StepOne>>, Santa>;

type Move<
  Maze extends MazeForest,
  Movement extends Direction,
  $SantaPosition extends MazePosition<Maze> = FindSanta<Maze>,
  $NextPosition extends MazePosition<Maze> = GetNewPosition<Maze, $SantaPosition, Movement>
> = Maze[$NextPosition[0]][$NextPosition[1]] extends Tree
  ? Maze
  : Any<TupleValues<$NextPosition>, [never]> extends true
  ? UpdatePoint<Maze, MazePosition<Maze>, Cookie>
  : MoveSanta<Maze, $SantaPosition, $NextPosition>;

export {};

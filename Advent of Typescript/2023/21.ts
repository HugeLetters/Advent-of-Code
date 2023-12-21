type TicTacToeChip = "❌" | "⭕";
type TicTacToeEndState = "❌ Won" | "⭕ Won" | "Draw";
type TicTacToeState = TicTacToeChip | TicTacToeEndState;
type TicTacToeEmptyCell = "  ";
type TicTacToeCell = TicTacToeChip | TicTacToeEmptyCell;
type TicTacToeYPosition = "top" | "middle" | "bottom";
type TicTacToeXPosition = "left" | "center" | "right";
type TicTacToePosition = `${TicTacToeYPosition}-${TicTacToeXPosition}`;
type TicTacToeRow = [TicTacToeCell, TicTacToeCell, TicTacToeCell];
type TicTacToeBoard = [TicTacToeRow, TicTacToeRow, TicTacToeRow];
type TicTacToeXCoordinate = TupleIndicies<TicTacToeRow>;
type TicTacToeYCoordinate = TupleIndicies<TicTacToeBoard>;
type TicTacToeCoordinate = [TicTacToeYCoordinate, TicTacToeXCoordinate];
type TicTacToeGame = {
  board: TicTacToeBoard;
  state: TicTacToeState;
};

type TupleIndicies<Tuple extends any[]> = keyof Tuple & `${number}`;

type UpdateRow<
  Row extends TicTacToeRow,
  Coordinate extends TicTacToeCoordinate,
  Chip extends TicTacToeChip,
  CurrentRow extends TicTacToeYCoordinate = never
> = {
  [Col in keyof Row]: [CurrentRow, Col] extends Coordinate ? Chip : Row[Col];
};

type UpdateBoard<
  Board extends TicTacToeBoard,
  Coordinate extends TicTacToeCoordinate,
  Chip extends TicTacToeChip
> = Extract<
  {
    [Row in keyof Board]: UpdateRow<Board[Row], Coordinate, Chip, Row & TicTacToeYCoordinate>;
  },
  TicTacToeBoard
>;
type CreatePatterns<
  Coordinate extends TicTacToeCoordinate,
  Chip extends TicTacToeChip
> = Coordinate extends Coordinate ? UpdateBoard<NeverBoard, Coordinate, Chip> : never;

type ColumnCoordinate<Col = TicTacToeXCoordinate> = Col extends Col ? [TicTacToeYCoordinate, Col] : never;

type RowCoordinate<Row = TicTacToeYCoordinate> = Row extends Row ? [Row, TicTacToeYCoordinate] : never;

type TicTacToeWinPattern<Chip extends TicTacToeChip> =
  | UpdateBoard<NeverBoard, ["0", "0"] | ["1", "1"] | ["2", "2"], Chip>
  | UpdateBoard<NeverBoard, ["0", "2"] | ["1", "1"] | ["2", "0"], Chip>
  | CreatePatterns<ColumnCoordinate, Chip>
  | CreatePatterns<RowCoordinate, Chip>;

type EmptyRow = ["  ", "  ", "  "];
type EmptyBoard = [EmptyRow, EmptyRow, EmptyRow];
type NeverBoard = UpdateBoard<EmptyBoard, TicTacToeCoordinate, never>;

type NewGame = {
  board: EmptyBoard;
  state: "❌";
};

type AxisPositionToCoordinate<P extends TicTacToeYPosition | TicTacToeXPosition> = P extends "top" | "left"
  ? "0"
  : P extends "middle" | "center"
  ? "1"
  : P extends "bottom" | "right"
  ? "2"
  : never;

type PositionToCoordinate<Position extends TicTacToePosition> =
  Position extends `${infer Y extends TicTacToeYPosition}-${infer X extends TicTacToeXPosition}`
    ? [AxisPositionToCoordinate<Y>, AxisPositionToCoordinate<X>]
    : never;

type MakeMove<
  Game extends TicTacToeGame,
  Move extends TicTacToePosition,
  $Coordinate extends TicTacToeCoordinate = PositionToCoordinate<Move>
> = Game["board"][$Coordinate[0]][$Coordinate[1]] extends TicTacToeEmptyCell
  ? UpdateBoard<Game["board"], $Coordinate, Game["state"] & TicTacToeCell>
  : Game["board"];

type IsMatchedByAny<V, M> = true extends (M extends V ? true : false) ? true : false;

type GameResult<Board extends TicTacToeBoard, State extends TicTacToeState> = {
  board: Board;
  state: IsMatchedByAny<Board, TicTacToeWinPattern<State & TicTacToeChip>> extends true
    ? `${State} Won`
    : TicTacToeEmptyCell extends Board[TicTacToeYCoordinate][TicTacToeXCoordinate]
    ? Exclude<TicTacToeChip, State>
    : "Draw";
};

type TicTacToe<
  Game extends TicTacToeGame,
  Move extends TicTacToePosition,
  $Move extends TicTacToeBoard = MakeMove<Game, Move>
> = $Move extends Game["board"] ? Game : GameResult<$Move, Game["state"]>;

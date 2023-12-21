type Toys = ["🛹", "🚲", "🛴", "🏄"];
type TupleOfLength<L extends number, V, $A extends V[] = []> = $A["length"] extends L
  ? $A
  : TupleOfLength<L, V, [V, ...$A]>;

type Rebuild<A, $T = Toys> = [A, $T] extends [[infer F extends number, ...infer R], [infer $F, ...infer $R]]
  ? [...TupleOfLength<F, $F>, ...Rebuild<R, [...$R, $F]>]
  : [];

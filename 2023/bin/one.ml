module CharSet = Set.Make (Char)

let digit_set = String.to_seq "0123456789" |> CharSet.of_seq
let is_digit ch = CharSet.mem ch digit_set

let ( |= ) string n =
  let len = String.length string in
  let n = n mod len in
  Char.escaped (String.get string (if n >= 0 then n else n + len))

let filter_string predicate =
  String.fold_left
    (fun acc ch -> if predicate ch then acc ^ Char.escaped ch else acc)
    ""

let part_one () =
  Utils.read_input_lines 1
  |> List.map (filter_string is_digit)
  |> List.map (fun x -> (x |= 0) ^ (x |= -1) |> int_of_string)
  |> Utils.sum |> print_int

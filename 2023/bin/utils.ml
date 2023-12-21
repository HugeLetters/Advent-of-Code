let read_input_lines day =
  Printf.sprintf "input/%i.txt" day |> open_in |> In_channel.input_lines

let string_of_chars x = List.fold_left (fun acc x -> acc ^ Char.escaped x) "" x

let time fn c =
  let t = Sys.time () in
  for _ = 1 to c do
    fn ()
  done;
  Printf.printf "\nFunction ran in %fms\n"
    ((Sys.time () -. t) *. 1000. /. float_of_int c)

let sum = List.fold_left ( + ) 0

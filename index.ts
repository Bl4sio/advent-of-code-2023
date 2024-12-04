import * as fs from "fs";
import day1 from "./solutions/day1";
import day2 from "./solutions/day2";
import day3 from "./solutions/day3";
import day4 from "./solutions/day4";
import day5 from "./solutions/day5";
import day6 from "./solutions/day6";
import day7 from "./solutions/day7";
import day8 from "./solutions/day8";
import day8_brute_force from "./solutions/day8_brute_force";
import day9 from "./solutions/day9";
import day10 from "./solutions/day10";
import day11 from "./solutions/day11";
import day12 from "./solutions/day12";
import day13 from "./solutions/day13";
import day14 from "./solutions/day14";
import day15 from "./solutions/day15";
import day16 from "./solutions/day16";
import day17 from "./solutions/day17";
import day18 from "./solutions/day18";
import day19 from "./solutions/day19";
import day20 from "./solutions/day20";
import day21 from "./solutions/day21";
import day22 from "./solutions/day22";
import day23 from "./solutions/day23";
import day24 from "./solutions/day24";
import day25 from "./solutions/day25";

const run = () => {
  const start = Date.now();
  const data = fs.readFileSync("./data/day25.txt").toString();

  const result = day25(data);

  console.log(result);
  console.log((Date.now() - start) / 1000, " s");
};

run();

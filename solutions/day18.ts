interface Move {
  dir: string;
  steps: number;
}

const ColorToDir = {
  "0": "R",
  "1": "D",
  "2": "L",
  "3": "U",
};

const transformColor = (color: string): Move => {
  const steps = parseInt(color.slice(1, -1), 16);
  const dir = ColorToDir[color.slice(-1)];
  return {
    steps,
    dir,
  };
};

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const moves: Move[] = [];

  rows.forEach((row) => {
    const [dir, steps, color] = row.split(" ");
    // moves.push({ dir, steps: parseInt(steps) });
    moves.push(transformColor(color.slice(1, -1)));
  });

  return calculateAreas(moves) + 1;
};

const calculateAreas = (moves: Move[]) => {
  let x = 0;
  let area = 0;

  for (let i = 0; i < moves.length; i += 2) {
    if (!["R", "L"].includes(moves[i].dir) || !["D", "U"].includes(moves[i + 1].dir)) {
      throw Error("not consistent moves");
    }

    const dx = moves[i].steps * (moves[i].dir === "R" ? 1 : -1);
    const dy = moves[i + 1].steps * (moves[i + 1].dir === "D" ? 1 : -1);
    area += Math.abs(dx) + Math.abs(dy);

    x += dx;
    area += dy * x;
    if (dx > 0) area -= dx;
    if (dy < 0) area += dy;
  }
  return area;
};

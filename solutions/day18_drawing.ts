type Direction = "R" | "D" | "L" | "U";

interface Move {
  dir: string;
  steps: number;
  color: string; // rgb code
}

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const moves: Move[] = [];

  rows.forEach((row) => {
    const [dir, steps, color] = row.split(" ");
    moves.push({ dir, steps: parseInt(steps), color: color.slice(1, -1) });
  });

  const { width, height, x0, y0 } = getDimensions(moves);

  const map = createMap(width, height);

  const wallLength = digWalls(map, moves, x0, y0);

  const undigged = colorOutside(map);

  const mapSize = width * height;
  const secondLayer = mapSize - undigged - wallLength;

  return wallLength + secondLayer;
};

const getDimensions = (moves: Move[]) => {
  let maxX = 0;
  let minX = 0;
  let maxY = 0;
  let minY = 0;
  let x = 0;
  let y = 0;

  moves.forEach(({ dir, steps }) => {
    if (dir === "R") {
      x += steps;
      maxX = Math.max(maxX, x);
    }
    if (dir === "L") {
      x -= steps;
      minX = Math.min(minX, x);
    }
    if (dir === "U") {
      y -= steps;
      minY = Math.min(minY, y);
    }
    if (dir === "D") {
      y += steps;
      maxY = Math.max(maxY, y);
    }
  });

  return { width: maxX - minX + 3, height: maxY - minY + 3, x0: -minX + 1, y0: -minY + 1 };
};

const createMap = (width: number, height: number) => {
  return Array.from({ length: height }, () => new Array(width).fill(0));
};

const digWalls = (map: number[][], moves: Move[], startX: number, startY: number) => {
  let digs = 0;
  const pos = { x: startX, y: startY };
  moves.forEach(({ dir, steps }) => {
    digs += steps;

    if (dir === "R") {
      for (let i = 0; i < steps; i++) map[pos.y][pos.x + i] = 1;
      pos.x += steps;
    }
    if (dir === "L") {
      for (let i = 0; i < steps; i++) map[pos.y][pos.x - i] = 1;
      pos.x -= steps;
    }
    if (dir === "U") {
      for (let i = 0; i < steps; i++) map[pos.y - i][pos.x] = 1;
      pos.y -= steps;
    }
    if (dir === "D") {
      for (let i = 0; i < steps; i++) map[pos.y + i][pos.x] = 1;
      pos.y += steps;
    }
  });

  return digs;
};

const colorOutside = (map: number[][]) => {
  const height = map.length;
  const width = map[0].length;

  const nodes = [{ x: 0, y: 0 }];
  let fieldCount = 0;

  while (nodes.length > 0) {
    const { x, y } = nodes.pop();

    if (map[y][x] !== 0) continue;

    fieldCount++;
    map[y][x] = -1;

    if (x - 1 >= 0) {
      nodes.push({ x: x - 1, y });
    }

    if (x + 1 < width) {
      nodes.push({ x: x + 1, y });
    }

    if (y - 1 > 0) {
      nodes.push({ x, y: y - 1 });
    }

    if (y + 1 < height) {
      nodes.push({ x, y: y + 1 });
    }
  }
  return fieldCount;
};

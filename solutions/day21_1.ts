export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const MAX_STEPS = 64;
  const dimX = rows[0].length;
  const dimY = rows.length;

  const map = createArray(dimY, dimX);
  const start = { x: -1, y: -1, steps: 0 };

  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === "S") {
        start.x = x;
        start.y = y;
      }

      if (char === "#") map[y][x] = 9;
    });
  });

  let counter = 0;
  const nodes = [start];

  while (nodes.length > 0) {
    const node = nodes.shift();
    const { x, y, steps } = node;

    if (x < 0 || x >= dimX || y < 0 || y >= dimY || steps > MAX_STEPS) continue;

    const value = map[y][x];
    if (value === 9 || value === 1) continue;

    map[y][x] = steps % 2 + 1;

    if (steps % 2 === MAX_STEPS % 2) counter++;

    nodes.push({ x: x + 1, y: y, steps: steps + 1 });
    nodes.push({ x: x - 1, y: y, steps: steps + 1 });
    nodes.push({ x: x, y: y + 1, steps: steps + 1 });
    nodes.push({ x: x, y: y - 1, steps: steps + 1 });
  }

  return counter;
};

const createArray = (dimY: number, dimX: number) => {
  return Array.from({ length: dimY }, () => new Array(dimX).fill(0));
};

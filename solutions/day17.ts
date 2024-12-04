enum DIRECTION {
  UP = "up",
  DOWN = "down",
  RIGHT = "right",
  LEFT = "left",
}

interface Node {
  x: number;
  y: number;
  heat: number;
  dir: DIRECTION | "";
  dirCounter: number;
  path: DIRECTION[];
}

const minSteps = 4;
const maxSteps = 10;

interface BestHeatValue {
  value: number;
  path: DIRECTION[];
}

class BestHeat {
  [DIRECTION.DOWN]: Record<number, BestHeatValue>;
  [DIRECTION.UP]: Record<number, BestHeatValue>;
  [DIRECTION.LEFT]: Record<number, BestHeatValue>;
  [DIRECTION.RIGHT]: Record<number, BestHeatValue>;

  constructor() {
    this[DIRECTION.DOWN] = this.createEmptySteps();
    this[DIRECTION.UP] = this.createEmptySteps();
    this[DIRECTION.LEFT] = this.createEmptySteps();
    this[DIRECTION.RIGHT] = this.createEmptySteps();
  }

  private createEmptySteps(): Record<number, BestHeatValue> {
    const emptySteps = {};
    for (let i = 1; i <= maxSteps; i++) {
      emptySteps[i] = { value: Infinity, path: [] };
    }
    return emptySteps;
  }
}

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const dimX = rows[0].length;
  const dimY = rows.length;

  const bestHeats = new Map<string, BestHeat>();
  const nodeQueue: Node[] = [
    {
      x: 1,
      y: 0,
      heat: 0,
      dir: DIRECTION.RIGHT,
      dirCounter: 1,
      path: [DIRECTION.RIGHT],
    },
    {
      x: 0,
      y: 1,
      heat: 0,
      dir: DIRECTION.DOWN,
      dirCounter: 1,
      path: [DIRECTION.DOWN],
    },
  ];

  while (nodeQueue.length > 0) {
    const node = nodeQueue.shift();
    const key = `${node.x}|${node.y}`;
    const currentBestHeat: BestHeat = bestHeats.get(key) ?? new BestHeat();
    const heat = parseInt(rows[node.y][node.x]) + node.heat;

    if (node.x === (dimX - 1) && node.y === (dimY - 1)) console.log(heat);

    const availableMoves = getAvailableMoves(node, dimX, dimY);
    let better = false;
    availableMoves.forEach(({ dir, steps }) => {
      steps.forEach((step) => {
        if (currentBestHeat[dir][step].value > heat) {
          better = true;
          currentBestHeat[dir][step].value = heat;
          currentBestHeat[dir][step].path = node.path;
        }
      });
    });
    if (!better) continue;

    bestHeats.set(key, currentBestHeat);

    availableMoves
      .filter(({ steps }) => steps.length > 0)
      .forEach(({ dir }) => {
        const dirCounter = node.dir === dir ? node.dirCounter + 1 : 1;
        const x = dir === DIRECTION.RIGHT ? node.x + 1 : dir === DIRECTION.LEFT ? node.x - 1 : node.x;
        const y = dir === DIRECTION.UP ? node.y - 1 : dir === DIRECTION.DOWN ? node.y + 1 : node.y;
        nodeQueue.push({
          x: x,
          y: y,
          dir,
          dirCounter,
          heat,
          path: [...node.path, dir],
        });
      });

    // if (node.dir !== DIRECTION.LEFT && node.x + 1 < dimX) {
    //   const dirCounter = node.dir === DIRECTION.RIGHT ? node.dirCounter + 1 : 1;
    //   if (
    //     (node.dir === DIRECTION.RIGHT && node.dirCounter + 1 <= maxSteps) ||
    //     (node.dir !== DIRECTION.RIGHT && node.dirCounter >= minSteps)
    //   ) {
    //     nodeQueue.push({
    //       x: node.x + 1,
    //       y: node.y,
    //       dir: DIRECTION.RIGHT,
    //       dirCounter,
    //       heat,
    //       path: [...node.path, DIRECTION.RIGHT],
    //     });
    //   }
    // }
    // if (node.dir !== DIRECTION.RIGHT && node.x - 1 >= 0) {
    //   const dirCounter = node.dir === DIRECTION.LEFT ? node.dirCounter + 1 : 1;

    //   if (
    //     (node.dir === DIRECTION.LEFT && node.dirCounter + 1 <= maxSteps) ||
    //     (node.dir !== DIRECTION.LEFT && node.dirCounter >= minSteps)
    //   ) {
    //     nodeQueue.push({
    //       x: node.x - 1,
    //       y: node.y,
    //       dir: DIRECTION.LEFT,
    //       dirCounter,
    //       heat,
    //       path: [...node.path, DIRECTION.LEFT],
    //     });
    //   }
    // }
    // if (node.dir !== DIRECTION.DOWN && node.y - 1 >= 0) {
    //   const dirCounter = node.dir === DIRECTION.UP ? node.dirCounter + 1 : 1;

    //   if (
    //     (node.dir === DIRECTION.UP && node.dirCounter + 1 <= maxSteps) ||
    //     (node.dir !== DIRECTION.UP && node.dirCounter >= minSteps)
    //   ) {
    //     nodeQueue.push({
    //       x: node.x,
    //       y: node.y - 1,
    //       dir: DIRECTION.UP,
    //       dirCounter,
    //       heat,
    //       path: [...node.path, DIRECTION.UP],
    //     });
    //   }
    // }
    // if (node.dir !== DIRECTION.UP && node.y + 1 < dimY) {
    //   const dirCounter = node.dir === DIRECTION.DOWN ? node.dirCounter + 1 : 1;

    //   if (
    //     (node.dir === DIRECTION.DOWN && node.dirCounter + 1 <= maxSteps) ||
    //     (node.dir !== DIRECTION.DOWN && node.dirCounter >= minSteps)
    //   ) {
    //     nodeQueue.push({
    //       x: node.x,
    //       y: node.y + 1,
    //       dir: DIRECTION.DOWN,
    //       dirCounter,
    //       heat,
    //       path: [...node.path, DIRECTION.DOWN],
    //     });
    //   }
    // }
    nodeQueue.sort((node1, node2) => node1.heat - node2.heat);
  }

  const targetBestHeats = bestHeats.get(`${dimX - 1}|${dimY - 1}`);
  const min = Object.values(targetBestHeats).reduce(
    (min, bestHeat: Record<number, BestHeatValue>) =>
      Math.min(min, Math.min(...Object.values(bestHeat).map((x) => x.value))),
    Infinity
  );
  return min;
};

interface AvailableMove {
  dir: DIRECTION;
  steps: number[];
}

const createArray = (max: number, min: number) => {
  const validMin = Math.max(1, min);
  if (max < validMin) return [];
  return Array.from({ length: max - validMin + 1 }, (value, index) => validMin + index);
};

const getAvailableMoves = (node: Node, dimX: number, dimY: number): AvailableMove[] => {
  const { x, y, dir, dirCounter } = node;

  const upMoves: AvailableMove = { dir: DIRECTION.UP, steps: [] };
  const downMoves: AvailableMove = { dir: DIRECTION.DOWN, steps: [] };
  const leftMoves: AvailableMove = { dir: DIRECTION.LEFT, steps: [] };
  const rightMoves: AvailableMove = { dir: DIRECTION.RIGHT, steps: [] };

  if (dir === DIRECTION.UP) {
    upMoves.steps = createArray(Math.min(maxSteps - dirCounter, y), minSteps - dirCounter);
    if (dirCounter >= minSteps) {
      leftMoves.steps = createArray(Math.min(maxSteps, x), minSteps);
      rightMoves.steps = createArray(Math.min(maxSteps, dimX - 1 - x), minSteps);
    }
  }
  if (dir === DIRECTION.DOWN) {
    downMoves.steps = createArray(Math.min(maxSteps - dirCounter, dimY - 1 - y), minSteps - dirCounter);
    if (dirCounter >= minSteps) {
      leftMoves.steps = createArray(Math.min(maxSteps, x), minSteps);
      rightMoves.steps = createArray(Math.min(maxSteps, dimX - 1 - x), minSteps);
    }
  }

  if (dir === DIRECTION.RIGHT) {
    rightMoves.steps = createArray(Math.min(maxSteps - dirCounter, dimX - 1 - x), minSteps - dirCounter);
    if (dirCounter >= minSteps) {
      upMoves.steps = createArray(Math.min(maxSteps, y), minSteps);
      downMoves.steps = createArray(Math.min(maxSteps, dimY - 1 - y), minSteps);
    }
  }

  if (dir === DIRECTION.LEFT) {
    leftMoves.steps = createArray(Math.min(maxSteps - dirCounter, x), minSteps - dirCounter);
    if (dirCounter >= minSteps) {
      upMoves.steps = createArray(Math.min(maxSteps, y), minSteps);
      downMoves.steps = createArray(Math.min(maxSteps, dimY - 1 - y), minSteps);
    }
  }

  return [upMoves, downMoves, leftMoves, rightMoves];
};

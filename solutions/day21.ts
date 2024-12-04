const MAX_STEPS = 26501365;

interface Position {
  x: number;
  y: number;
  steps: number;
}

export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const start = { x: -1, y: -1, steps: 0 };

  rows.find((row, y) => {
    const x = row.indexOf("S");
    if (x !== -1) {
      start.x = x;
      start.y = y;
      return true;
    }
    return false;
  });

  const baseDistances = calculateDistances(rows, [start]);

  const baseCount = getBaseCount(baseDistances.coverageByStepCount, baseDistances.maxSteps);
  const cornerCount = getCornerCounts(rows, baseDistances.distanceMap);
  const edgeCount = getEdges(rows, baseDistances);

  return baseCount + cornerCount + edgeCount;
};

const getEdges = (
  rows: string[],
  baseDistances: {
    distanceMap: Map<number, Map<number, number>>;
    coverageByStepCount: Map<number, number>;
    maxSteps: number;
  }
) => {
  const { coverageByStepCount, distanceMap, maxSteps } = baseDistances;
  const maxEvenSteps = maxSteps % 2 === 0 ? maxSteps : maxSteps - 1;
  const maxOddSteps = maxSteps % 2 === 1 ? maxSteps : maxSteps - 1;
  const maxEvenCoverage = coverageByStepCount.get(maxEvenSteps);
  const maxOddCoverage = coverageByStepCount.get(maxOddSteps);

  const dimX = rows[0].length;
  const dimY = rows.length;

  const topCount = getOneEdge(rows, maxEvenCoverage, maxOddCoverage, distanceMap, { y: 0 });
  const bottomCount = getOneEdge(rows, maxEvenCoverage, maxOddCoverage, distanceMap, { y: dimY - 1 });
  const leftCount = getOneEdge(rows, maxEvenCoverage, maxOddCoverage, distanceMap, { x: 0 });
  const rightCount = getOneEdge(rows, maxEvenCoverage, maxOddCoverage, distanceMap, { x: dimX - 1 });

  return topCount + bottomCount + leftCount + rightCount;
};

const getOneEdge = (
  rows: string[],
  maxEvenCoverage: number,
  maxOddCoverage: number,
  distanceMap: Map<number, Map<number, number>>,
  baseLine: { x?: number; y?: number }
): number => {
  const baseNodes = getBaselineNodes(rows, distanceMap, baseLine);
  const { mapIndex, repeatingBaseNodes, relevantDim, currentDistances } = findOffset(rows, baseNodes, baseLine);
  const minSteps = Math.min(...repeatingBaseNodes.map((node) => node.steps));
  const maxSteps = Math.max(...repeatingBaseNodes.map((node) => node.steps));

  const remainingTotalSteps = MAX_STEPS - maxSteps - mapIndex * relevantDim;
  const repeatingFullMapCount = Math.floor(remainingTotalSteps / relevantDim);
  const fullMapCount = repeatingFullMapCount + mapIndex; // todo -1 ?

  let remainingSteps = MAX_STEPS - fullMapCount * relevantDim;
  let counter = 0;
  while (remainingSteps >= minSteps) {
    counter += currentDistances.coverageByStepCount.get(remainingSteps); // todo maybe the previous is not full
    remainingSteps -= relevantDim;
  }

  const isRelativeDimEven = relevantDim % 2 === 0;
  const sameMapCount = isRelativeDimEven ? fullMapCount : Math.floor(fullMapCount / 2);
  const inverseMapCount = isRelativeDimEven ? 0 : Math.ceil(fullMapCount / 2);

  let mapCounter = 0;
  if (MAX_STEPS % 2 === 0) {
    mapCounter = maxEvenCoverage * sameMapCount + maxOddCoverage * inverseMapCount;
  } else {
    mapCounter = maxEvenCoverage * inverseMapCount + maxOddCoverage * sameMapCount;
  }
  return mapCounter + counter;
};

const getBaselineNodes = (
  rows: string[],
  distanceMap: Map<number, Map<number, number>>,
  baseLine: { x?: number; y?: number }
): Position[] => {
  const dimX = rows[0].length;
  const dimY = rows.length;

  if (baseLine.x !== undefined) {
    return Array.from({ length: dimY })
      .fill(0)
      .map((_, y) => {
        return {
          x: dimX - 1 - baseLine.x,
          y: y,
          steps: distanceMap.get(y).get(baseLine.x) + 1,
        };
      });
  }

  if (baseLine.y !== undefined) {
    return Array.from({ length: dimX })
      .fill(0)
      .map((_, x) => {
        return {
          x: x,
          y: dimY - 1 - baseLine.y,
          steps: distanceMap.get(baseLine.y).get(x) + 1,
        };
      });
  }
};

const findOffset = (rows: string[], baseNodes: Position[], baseLine: { x?: number; y?: number }) => {
  const dimX = rows[0].length;
  const dimY = rows.length;
  const relevantDim = baseLine.x === undefined ? dimY : dimX;
  let currentBaseNodes = [...baseNodes];

  let mapIndex = 0;
  let found = false;
  let currentDistances: {
    distanceMap: Map<number, Map<number, number>>;
    coverageByStepCount: Map<number, number>;
    maxSteps: number;
  };

  while (!found) {
    mapIndex++;
    currentDistances = calculateDistances(rows, currentBaseNodes);
    const nextBaseNodes = getBaselineNodes(rows, currentDistances.distanceMap, baseLine);
    nextBaseNodes.forEach((node) => (node.steps -= relevantDim));

    if (nextBaseNodes.every((nextNode, i) => nextNode.steps === currentBaseNodes[i].steps)) {
      found = true;
    }
    currentBaseNodes = nextBaseNodes;
  }

  return { repeatingBaseNodes: currentBaseNodes, mapIndex, relevantDim, currentDistances };
};

const calculateDistances = (rows: string[], startNodes: Position[]) => {
  const dimX = rows[0].length;
  const dimY = rows.length;

  const nodes = [...startNodes];
  const distanceMap = new Map<number, Map<number, number>>(); // shortest dist to x - y pos
  const coverageByStepCount = new Map<number, number>(); // the number of places you can reach with x steps

  while (nodes.length > 0) {
    nodes.sort((a, b) => b.steps - a.steps);
    const node = nodes.pop();
    const { x, y, steps } = node;

    if (x < 0 || x >= dimX || y < 0 || y >= dimY) continue;

    const value = rows[y][x];
    if (value === "#") continue;

    const distanceRow = distanceMap.get(y) ?? new Map<number, number>();
    if (distanceRow.has(x)) continue; // already reached
    distanceRow.set(x, steps);
    distanceMap.set(y, distanceRow);

    const coverage = coverageByStepCount.get(steps) ?? 0;
    coverageByStepCount.set(steps, coverage + 1);

    nodes.push({ x: x + 1, y: y, steps: steps + 1 });
    nodes.push({ x: x - 1, y: y, steps: steps + 1 });
    nodes.push({ x: x, y: y + 1, steps: steps + 1 });
    nodes.push({ x: x, y: y - 1, steps: steps + 1 });
  }

  const minSteps = Math.min(...coverageByStepCount.keys());
  const maxSteps = Math.max(...coverageByStepCount.keys());

  for (let steps = minSteps; steps < maxSteps; steps++) {
    const coverage = coverageByStepCount.get(steps);
    const nextCoverage = coverageByStepCount.get(steps + 2) ?? 0;
    coverageByStepCount.set(steps + 2, coverage + nextCoverage);
  }

  return { distanceMap, coverageByStepCount, maxSteps };
};

const getBaseCount = (coverageByStepCount: Map<number, number>, maxSteps: number) => {
  const evenSpaces = maxSteps % 2 ? coverageByStepCount.get(maxSteps - 1) : coverageByStepCount.get(maxSteps);
  const oddSpaces = maxSteps % 2 ? coverageByStepCount.get(maxSteps) : coverageByStepCount.get(maxSteps - 1);

  if (MAX_STEPS > maxSteps) return MAX_STEPS % 2 ? oddSpaces : evenSpaces;

  return coverageByStepCount.get(MAX_STEPS);
};

const getCornerCounts = (rows: string[], baseDistanceMap: Map<number, Map<number, number>>) => {
  const dimX = rows[0].length;
  const dimY = rows.length;

  const topLeftCounts = getOneCornerCounts(rows, baseDistanceMap, 0, 0);
  const bottomLeftCounts = getOneCornerCounts(rows, baseDistanceMap, dimY - 1, 0);
  const topRightCounts = getOneCornerCounts(rows, baseDistanceMap, 0, dimX - 1);
  const bottomRightCounts = getOneCornerCounts(rows, baseDistanceMap, dimY - 1, dimX - 1);

  return topLeftCounts + bottomLeftCounts + topRightCounts + bottomRightCounts;
};

const getOneCornerCounts = (
  rows: string[],
  baseDistanceMap: Map<number, Map<number, number>>,
  y0: number,
  x0: number
) => {
  const baseDistance = baseDistanceMap.get(y0).get(x0) + 2;
  const isBaseEven = baseDistance % 2 === 0;

  if (baseDistance > MAX_STEPS) return 0;

  const dimX = rows[0].length;
  const dimY = rows.length;
  const isDimXEven = dimX % 2 === 0;
  const isDimYEven = dimY % 2 === 0;

  const cornerDistances = calculateDistances(rows, [
    {
      x: dimX - 1 - x0,
      y: dimY - 1 - y0,
      steps: 0,
    },
  ]);
  const maxSteps = cornerDistances.maxSteps;
  const maxEvenSteps = maxSteps % 2 === 0 ? maxSteps : maxSteps - 1;
  const maxOddSteps = maxSteps % 2 === 1 ? maxSteps : maxSteps - 1;
  const maxEvenCoverage = cornerDistances.coverageByStepCount.get(maxEvenSteps);
  const maxOddCoverage = cornerDistances.coverageByStepCount.get(maxOddSteps);

  if (dimX + dimY < maxSteps) throw new Error("Potential hole!");

  const remainingTotalSteps = MAX_STEPS - baseDistance;
  const mapCountsX = Math.ceil((remainingTotalSteps + 1) / dimX);
  const mapCountsY = Math.ceil((remainingTotalSteps + 1) / dimY);

  let mapPosY = 1;
  let mapPosX = mapCountsX;
  let remainingSteps = remainingTotalSteps - (mapCountsX - 1) * dimX;
  let isStartEven = isBaseEven;

  let totalCount = 0;
  if (mapPosX === 1 && mapPosY === 1) {
    return cornerDistances.coverageByStepCount.get(remainingSteps);
  }
  while (mapPosX >= 1 && mapPosY <= mapCountsY) {
    const currentCount = cornerDistances.coverageByStepCount.get(remainingSteps);
    totalCount += currentCount;

    if (remainingSteps >= dimY) {
      const sameMapCount = isDimXEven ? mapPosX - 1 : Math.ceil((mapPosX - 1) / 2);
      const inverseMapCount = isDimXEven ? 0 : Math.floor((mapPosX - 1) / 2);

      let mapCounts = 0;
      if (MAX_STEPS % 2 === 0) {
        if (isStartEven) {
          mapCounts = sameMapCount * maxEvenCoverage + inverseMapCount * maxOddCoverage;
        } else {
          mapCounts = sameMapCount * maxOddCoverage + inverseMapCount * maxEvenCoverage;
        }
      } else {
        if (isStartEven) {
          mapCounts = sameMapCount * maxOddCoverage + inverseMapCount * maxEvenCoverage;
        } else {
          mapCounts = sameMapCount * maxEvenCoverage + inverseMapCount * maxOddCoverage;
        }
      }
      totalCount += mapCounts;

      mapPosY++;
      remainingSteps -= dimY;
      isStartEven = isDimYEven ? isStartEven : !isStartEven;
    } else {
      mapPosX--;
      remainingSteps += dimX;
    }
  }

  return totalCount;
};

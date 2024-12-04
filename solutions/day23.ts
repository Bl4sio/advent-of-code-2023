// 6030 too low

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const mapReader = new MapReader(rows);

  const startNode = { y: 0, x: rows[0].indexOf(".") };
  const endNode = { y: rows.length - 1, x: rows[rows.length - 1].indexOf(".") };
  const startKey = `${startNode.x}|${startNode.y}`;
  const endKey = `${endNode.x}|${endNode.y}`;

  const { pathDescriptions, pathIdsForNode } = calculatePaths(mapReader, startNode);

  const startTargetSize = Math.ceil((pathIdsForNode.size - 1) / 2);
  const endTargetSize = pathIdsForNode.size - 1 - startTargetSize;

  console.log("Start target:", startTargetSize);
  const startPathStack = getPatchStack(
    {
      lastNode: startKey,
      usedNodes: new Set([startKey]),
      length: 0,
    },
    startTargetSize,
    pathDescriptions,
    pathIdsForNode
  );

  console.log("End target:", endTargetSize);
  const endPathStack = getPatchStack(
    {
      lastNode: endKey,
      usedNodes: new Set([endKey]),
      length: 0,
    },
    endTargetSize,
    pathDescriptions,
    pathIdsForNode,
    true
  ).sort((a, b) => b.length - a.length);

  let maxLenght = 0;
  const startLength = startPathStack.length;
  console.log("Final part.");
  let percent = 0;
  startPathStack
    .sort((a, b) => b.length - a.length)
    .forEach((startPath, i) => {
      const currentPercent = Math.floor((i / startLength) * 1000);
      if (currentPercent > percent) {
        percent = currentPercent;
        console.log("Percent: ", percent / 10);
      }
      const startNodes = [...startPath.usedNodes];
      const maxEndLength =
        endPathStack.find(
          (endPath) =>
            startPath.lastNode === endPath.lastNode && !startNodes.find((startNode) => endPath.usedNodes.has(startNode))
        )?.length ?? 0;

      const length = startPath.length + maxEndLength;

      if (length > maxLenght) {
        console.log(length);
        maxLenght = length;
      }
    });

  return maxLenght;
};

const getPatchStack = (
  startStack: { lastNode: string; usedNodes: Set<string>; length: number },
  targetSteps: number,
  pathDescriptions: Map<
    number,
    {
      nodes: [string, string];
      length: number;
    }
  >,
  pathIdsForNode: Map<string, number[]>,
  returnAll = false
) => {
  // first key: last node
  // second key: set of used nodes
  // value: longest path
  const maxSubPath = new Map<string, Map<string, number>>();

  const pathStack = [startStack];
  const allPathStack = []

  while (pathStack.length > 0) {
    const patchStack = pathStack.shift();
    const { lastNode, usedNodes, length } = patchStack;

    console.log(usedNodes.size);
    if (returnAll) allPathStack.push(patchStack);
    if (usedNodes.size === targetSteps) {
      break;
    }

    const nodeSubPath = maxSubPath.get(lastNode) ?? new Map<string, number>();
    const subPathId = Array.from(usedNodes).sort().join(",");
    const subPathLength = nodeSubPath.get(subPathId) ?? 0;
    if (length < subPathLength) continue;

    const pathIds = pathIdsForNode.get(lastNode);
    pathIds.forEach((pathId) => {
      const path = pathDescriptions.get(pathId);
      const nextNode = path.nodes.find((node) => node !== lastNode);
      if (!nextNode) throw new Error("Missing node!");

      if (usedNodes.has(nextNode)) return; // cant go that way

      const nextLength = length + path.length;
      const nextUsedNodes = new Set([...usedNodes, lastNode]);

      const nextNodeSubPath = maxSubPath.get(nextNode) ?? new Map<string, number>();
      const nextSubPathId = Array.from(nextUsedNodes).sort().join(",");
      const nextSubPathLength = nextNodeSubPath.get(nextSubPathId) ?? 0;
      if (nextSubPathLength < nextLength) {
        nextNodeSubPath.set(nextSubPathId, nextLength);
        maxSubPath.set(nextNode, nextNodeSubPath);
      }

      pathStack.push({
        lastNode: nextNode,
        usedNodes: nextUsedNodes,
        length: nextLength,
      });
    });
  }

  return returnAll ? allPathStack: pathStack;
};

const calculatePaths = (mapReader: MapReader, startNode: { x: number; y: number }) => {
  const pathIdsForNode = new Map<string, number[]>();
  pathIdsForNode.set(`${startNode.x}|${startNode.y}`, []);
  const pathDescriptions = new Map<number, { nodes: [string, string]; length: number }>();
  const partialPath = [
    { start: { x: startNode.x, y: startNode.y }, end: { x: startNode.x, y: startNode.y + 1 }, length: 1, dir: "down" },
  ];

  while (partialPath.length > 0) {
    const path = partialPath.pop();
    const { x, y } = path.end;
    if (y === mapReader.dimY - 1) {
      // exit found
      const endKey = `${path.end.x}|${path.end.y}`;
      const startKey = `${path.start.x}|${path.start.y}`;

      const pathId = pathDescriptions.size;
      pathIdsForNode.set(endKey, [pathId]);
      pathDescriptions.set(pathId, { nodes: [startKey, endKey], length: path.length });
      const startPathIds = pathIdsForNode.get(startKey);
      startPathIds.push(pathId);
      pathIdsForNode.set(startKey, startPathIds);
      continue;
    }

    let pathCount = 0;

    const top = mapReader.get(y - 1, x);
    const bottom = mapReader.get(y + 1, x);
    const left = mapReader.get(y, x - 1);
    const right = mapReader.get(y, x + 1);

    if ([".", "v", ">"].includes(top)) pathCount++;
    if ([".", "v", ">"].includes(bottom)) pathCount++;
    if ([".", "v", ">"].includes(left)) pathCount++;
    if ([".", "v", ">"].includes(right)) pathCount++;
    const isNode = pathCount > 2;

    if (isNode) {
      const endKey = `${path.end.x}|${path.end.y}`;
      const startKey = `${path.start.x}|${path.start.y}`;
      const endPathIds = pathIdsForNode.get(endKey);

      if (!endPathIds) {
        const pathId = pathDescriptions.size;

        // add new path
        pathDescriptions.set(pathId, { nodes: [startKey, endKey], length: path.length });

        // add pathId to nodes
        pathIdsForNode.set(endKey, [pathId]);
        const startPathIds = pathIdsForNode.get(startKey);
        startPathIds.push(pathId);
        pathIdsForNode.set(startKey, startPathIds);

        // create new partialPaths
        if (path.dir !== "down" && [".", "v", ">"].includes(top)) {
          partialPath.push({
            start: { x: path.end.x, y: path.end.y },
            end: { x: path.end.x, y: path.end.y - 1 },
            length: 1,
            dir: "up",
          });
        }
        if (path.dir !== "up" && [".", "v", ">"].includes(bottom)) {
          partialPath.push({
            start: { x: path.end.x, y: path.end.y },
            end: { x: path.end.x, y: path.end.y + 1 },
            length: 1,
            dir: "down",
          });
        }
        if (path.dir !== "right" && [".", "v", ">"].includes(left)) {
          partialPath.push({
            start: { x: path.end.x, y: path.end.y },
            end: { x: path.end.x - 1, y: path.end.y },
            length: 1,
            dir: "left",
          });
        }
        if (path.dir !== "left" && [".", "v", ">"].includes(right)) {
          partialPath.push({
            start: { x: path.end.x, y: path.end.y },
            end: { x: path.end.x + 1, y: path.end.y },
            length: 1,
            dir: "right",
          });
        }
      } else {
        if (
          !endPathIds.find((endPathId) => {
            const otherPathNodes = pathDescriptions.get(endPathId).nodes;
            return otherPathNodes.includes(startKey); // path already checked
          })
        ) {
          const pathId = pathDescriptions.size;

          // add new path
          pathDescriptions.set(pathId, { nodes: [startKey, endKey], length: path.length });

          // add pathId to nodes
          endPathIds.push(pathId);
          pathIdsForNode.set(endKey, endPathIds);
          const startPathIds = pathIdsForNode.get(startKey);
          startPathIds.push(pathId);
          pathIdsForNode.set(startKey, startPathIds);
        }
        // check path if already sotred
        // store path if not
        // new paths already created, continue
      }
      continue;
    }

    // move partialPath further
    if (path.dir !== "down" && [".", "v", ">"].includes(top)) {
      partialPath.push({
        start: { x: path.start.x, y: path.start.y },
        end: { x: path.end.x, y: path.end.y - 1 },
        length: path.length + 1,
        dir: "up",
      });
    }
    if (path.dir !== "up" && [".", "v", ">"].includes(bottom)) {
      partialPath.push({
        start: { x: path.start.x, y: path.start.y },
        end: { x: path.end.x, y: path.end.y + 1 },
        length: path.length + 1,
        dir: "down",
      });
    }
    if (path.dir !== "right" && [".", "v", ">"].includes(left)) {
      partialPath.push({
        start: { x: path.start.x, y: path.start.y },
        end: { x: path.end.x - 1, y: path.end.y },
        length: path.length + 1,
        dir: "left",
      });
    }
    if (path.dir !== "left" && [".", "v", ">"].includes(right)) {
      partialPath.push({
        start: { x: path.start.x, y: path.start.y },
        end: { x: path.end.x + 1, y: path.end.y },
        length: path.length + 1,
        dir: "right",
      });
    }
  }

  return { pathDescriptions, pathIdsForNode };
};

class MapReader {
  private readonly map: string[];
  readonly dimX: number;
  readonly dimY: number;

  constructor(map: string[]) {
    this.map = map;
    this.dimX = map[0].length;
    this.dimY = map.length;
  }

  get(y: number, x: number) {
    if (x < 0 || x >= this.dimX || y < 0 || y >= this.dimY) return undefined;
    return this.map[y][x];
  }
}

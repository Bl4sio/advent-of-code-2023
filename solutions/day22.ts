interface Coordinate {
  x: number;
  y: number;
  z: number;
}

interface Block {
  id: number;
  start: Coordinate;
  end: Coordinate;
}

type Holding = Map<number, Set<number>>;

interface ZTop {
  position: number;
  blockId: number;
}

interface Connection {
  top: number[];
  bottom: number[];
}

export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const blocks: Block[] = rows.map((row, id) => {
    const [start, end] = row.split("~");

    const [startX, startY, startZ] = start.split(",").map((x) => parseInt(x));
    const [endX, endY, endZ] = end.split(",").map((x) => parseInt(x));

    return {
      start: { x: Math.min(startX, endX), y: Math.min(startY, endY), z: Math.min(startZ, endZ) },
      end: { x: Math.max(startX, endX), y: Math.max(startY, endY), z: Math.max(startZ, endZ) },
      id,
    };
  });

  const blockConnections = getBlockConnections(blocks);
  blocks.sort((a, b) => b.end.z - a.end.z);

  const blockHoldings = new Map<number, Holding>();
  let result = 0;

  blocks.forEach((topBlock) => {
    const blockId = topBlock.id;
    const connections = blockConnections.get(blockId);
    const holdings: Holding = blockHoldings.get(blockId) ?? new Map();

    const fulfilledIds = [blockId];

    while (fulfilledIds.length > 0) {
      const fulfilledId = fulfilledIds.pop();
      holdings.forEach((holding, holdingId) => {
        if (holding.has(fulfilledId)) {
          holding.delete(fulfilledId);
          if (holding.size === 0) fulfilledIds.push(holdingId);
        }
      });
    }

    let fallingCount = 0;
    holdings.forEach((holding) => {
      if (holding.size === 0) {
        fallingCount++;
      }
    });
    result += fallingCount;

    holdings.forEach((holding) => {
      connections.bottom.forEach((extraRequired) => holding.add(extraRequired));
    });

    connections.bottom.forEach((bottomId) => {
      const bottomHoldings: Holding = blockHoldings.get(bottomId) ?? new Map();
      bottomHoldings.set(blockId, new Set(connections.bottom));
      holdings.forEach((holding, holdingId) => {
        const bottomHolding = bottomHoldings.get(holdingId) ?? new Set();
        bottomHoldings.set(holdingId, new Set([...bottomHolding, ...holding]));
      });

      blockHoldings.set(bottomId, bottomHoldings);
    });
  });

  return result;

  // const blockingBlocks = new Set<number>()
  // blockConnections.forEach((connection, id) => {
  //   if (connection.bottom.length < 2) blockingBlocks.add(id);
  // });

  // let removeable = 0;
  // blockConnections.forEach((connection, blockId) => {
  //   if (!connection.top.find(topBlock => blockingBlocks.has(topBlock))) removeable++;
  // })

  // return removeable;
};

const getKey = (x: number, y: number) => {
  return `${x}|${y}`;
};

const getBlockConnections = (blocks: Block[]): Map<number, Connection> => {
  blocks.sort((a, b) => a.start.z - b.start.z);
  const highestZ = new Map<string, ZTop>(); // highest Z value in an x-y coordinate
  const blockConnections = new Map<number, Connection>();

  blocks.forEach((block) => {
    const blockId = block.id;
    let topZ = 0;
    let localHoldingBlocks = new Set<number>();

    for (let x = block.start.x; x <= block.end.x; x++) {
      for (let y = block.start.y; y <= block.end.y; y++) {
        const topZBlock = highestZ.get(getKey(x, y));
        const localTopZ = topZBlock?.position ?? 0;
        if (localTopZ === topZ && topZBlock !== undefined) localHoldingBlocks.add(topZBlock.blockId);
        if (localTopZ > topZ) {
          localHoldingBlocks = new Set<number>([topZBlock.blockId]);
          topZ = Math.max(localTopZ, topZ);
        }
      }
    }

    blockConnections.set(blockId, { bottom: [...localHoldingBlocks], top: [] });
    localHoldingBlocks.forEach((bottomBlockId) => {
      const blockConnection = blockConnections.get(bottomBlockId);
      blockConnection.top.push(blockId);
      blockConnections.set(bottomBlockId, blockConnection);
    });

    const zDiff = block.start.z - (topZ + 1);

    block.start.z -= zDiff;
    block.end.z -= zDiff;

    for (let x = block.start.x; x <= block.end.x; x++) {
      for (let y = block.start.y; y <= block.end.y; y++) {
        highestZ.set(getKey(x, y), {
          position: block.end.z,
          blockId: blockId,
        });
      }
    }
  });

  return blockConnections;
};

interface Posisition {
  x: number;
  y: number;
}

enum DIRECTION {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

const DirectionMap: Record<string, Posisition> = {
  [DIRECTION.UP]: { x: 0, y: -1 },
  [DIRECTION.DOWN]: { x: 0, y: 1 },
  [DIRECTION.LEFT]: { x: -1, y: 0 },
  [DIRECTION.RIGHT]: { x: 1, y: 0 },
};

interface Beam {
  pos: Posisition;
  dir: DIRECTION;
}

const MirrorMapping = {
  ".": {
    [DIRECTION.UP]: [DIRECTION.UP],
    [DIRECTION.DOWN]: [DIRECTION.DOWN],
    [DIRECTION.LEFT]: [DIRECTION.LEFT],
    [DIRECTION.RIGHT]: [DIRECTION.RIGHT],
  },
  "\\": {
    [DIRECTION.UP]: [DIRECTION.LEFT],
    [DIRECTION.DOWN]: [DIRECTION.RIGHT],
    [DIRECTION.LEFT]: [DIRECTION.UP],
    [DIRECTION.RIGHT]: [DIRECTION.DOWN],
  },
  "/": {
    [DIRECTION.UP]: [DIRECTION.RIGHT],
    [DIRECTION.DOWN]: [DIRECTION.LEFT],
    [DIRECTION.LEFT]: [DIRECTION.DOWN],
    [DIRECTION.RIGHT]: [DIRECTION.UP],
  },
  "|": {
    [DIRECTION.UP]: [DIRECTION.UP],
    [DIRECTION.DOWN]: [DIRECTION.DOWN],
    [DIRECTION.LEFT]: [DIRECTION.UP, DIRECTION.DOWN],
    [DIRECTION.RIGHT]: [DIRECTION.UP, DIRECTION.DOWN],
  },
  "-": {
    [DIRECTION.UP]: [DIRECTION.LEFT, DIRECTION.RIGHT],
    [DIRECTION.DOWN]: [DIRECTION.LEFT, DIRECTION.RIGHT],
    [DIRECTION.LEFT]: [DIRECTION.LEFT],
    [DIRECTION.RIGHT]: [DIRECTION.RIGHT],
  },
};

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const xSize = rows[0].length;
  const ySize = rows.length;

  const startBeams: Beam[] = [];

  for (let i = 0; i < xSize; i++) {
    startBeams.push({
      pos: {
        x: i,
        y: 0
      },
      dir: DIRECTION.DOWN
    });
    
    startBeams.push({
      pos: {
        x: i,
        y: ySize - 1
      },
      dir: DIRECTION.UP
    })
  }

  for (let i = 0; i < ySize; i++) {
    startBeams.push({
      pos: {
        x: 0,
        y: i
      },
      dir: DIRECTION.RIGHT
    });
    
    startBeams.push({
      pos: {
        x: xSize - 1,
        y: i
      },
      dir: DIRECTION.LEFT
    })
  }

  let max = 0;

  startBeams.forEach(startBeam => {
    const beams = [startBeam];
    const checkedBeams = new Map<string, Set<DIRECTION>>();

    while (beams.length > 0) {
      const beam = beams.pop();
      const posKey = getPosKey(beam);

      const checkedDirections = checkedBeams.get(posKey) ?? new Set<DIRECTION>();
      if (checkedDirections.has(beam.dir)) {
        continue;
      }
      checkedDirections.add(beam.dir);
      checkedBeams.set(posKey, checkedDirections);

      const nextDirs = getNextDirs(beam, rows);
      nextDirs.forEach((nextDir) => {
        const nextPos = getNextPosition(beam.pos, nextDir);
        if (!validatePos(nextPos, xSize, ySize)) return;

        const nextBeam: Beam = { pos: nextPos, dir: nextDir };
        beams.push(nextBeam);
      });
    }

    if ( checkedBeams.size > max) max = checkedBeams.size;
  })
  
  return max;
};

const getPosKey = (beam: Beam) => {
  return `${beam.pos.y}|${beam.pos.x}`;
};

const getNextDirs = (beam: Beam, rows: String[]): DIRECTION[] => {
  const mirror = rows[beam.pos.y][beam.pos.x];
  const dir = beam.dir;

  return MirrorMapping[mirror][dir];
};

const getNextPosition = (pos: Posisition, dir: DIRECTION): Posisition => {
  const dirValue = DirectionMap[dir];

  return {
    x: pos.x + dirValue.x,
    y: pos.y + dirValue.y,
  };
};

const validatePos = (pos: Posisition, xSize: number, ySize: number) => {
  return pos.x >= 0 && pos.y >= 0 && pos.x < xSize && pos.y < ySize;
};

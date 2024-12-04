export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  const emptyRow = Array(rows[0].length).fill('.');
  const cleanMap = Array(rows.length).fill(0).map(() => [...emptyRow]);

  const start = {
    x: -1,
    y: -1,
  };
  start.y = rows.findIndex((row) => {
    start.x = row.indexOf("S");
    return start.x !== -1;
  });

  let i = 1;
  let lastDir: "up" | "down" | "left" | "right";
  let current;

  const rightPipe = rows[start.y][start.x + 1];
  if ("-J7".includes(rightPipe)) {
    lastDir = "right";
    current = { y: start.y, x: start.x + 1 };
  }

  const leftPipe = rows[start.y][start.x - 1];
  if ("-LF".includes(leftPipe)) {
    if (lastDir === "right") {
      cleanMap[start.y][start.x] = '-'
    }
    lastDir = "left";
    current = { y: start.y, x: start.x - 1 };
  }

  const topPipe = rows[start.y - 1][start.x];
  if ("|F7".includes(topPipe)) {
    if (cleanMap[start.y][start.x] === '.' && lastDir === "right") {
      cleanMap[start.y][start.x] = 'L'
    }
    if (cleanMap[start.y][start.x] === '.' && lastDir === "left") {
      cleanMap[start.y][start.x] = 'J'
    }
    lastDir = "up";
    current = { y: start.y - 1, x: start.x };
  }

  const bottomPipe = rows[start.y + 1][start.x];
  if ("|LJ".includes(bottomPipe)) {
    if (cleanMap[start.y][start.x] === '.' && lastDir === "right") {
      cleanMap[start.y][start.x] = 'F'
    }
    if (cleanMap[start.y][start.x] === '.' && lastDir === "left") {
      cleanMap[start.y][start.x] = '7'
    }
    if (cleanMap[start.y][start.x] === '.' && lastDir === "up") {
      cleanMap[start.y][start.x] = '|'
    }
    lastDir = "down";
    current = { y: start.y + 1, x: start.x };
  }

  while (current.x !== start.x || current.y !== start.y) {
    cleanMap[current.y][current.x] = rows[current.y][current.x];
    const pipe = rows[current.y][current.x];
    switch (pipe) {
      case "|": {
        if (lastDir === "up") {
          current.y--;
        } else {
          current.y++;
        }
        break;
      }
      case "-": {
        if (lastDir === "right") {
          current.x++;
        } else {
          current.x--;
        }
        break;
      }
      case "L": {
        if (lastDir === "down") {
          current.x++;
          lastDir = "right";
        } else {
          current.y--;
          lastDir = "up";
        }
        break;
      }
      case "J": {
        if (lastDir === "down") {
          current.x--;
          lastDir = "left";
        } else {
          current.y--;
          lastDir = "up";
        }
        break;
      }
      case "7": {
        if (lastDir === "up") {
          current.x--;
          lastDir = "left";
        } else {
          current.y++;
          lastDir = "down";
        }
        break;
      }
      case "F": {
        if (lastDir === "up") {
          current.x++;
          lastDir = "right";
        } else {
          current.y++;
          lastDir = "down";
        }
        break;
      }
    }

    i++;
  }


  let holes = 0;
  let isInside = false;
  let leftType: 'up' | 'down';

  cleanMap.forEach(row => {
    row.forEach(field => {
      if (isInside && field === '.') holes++;
      if (field === 'F') leftType = "down";
      if (field === 'L') leftType = "up";
      if (field === '7' && leftType === "up") isInside = !isInside;
      if (field === 'J' && leftType === "down") isInside = !isInside;
      if (field === '|') isInside = !isInside;
    })
  })


  return holes;
};
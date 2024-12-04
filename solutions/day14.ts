interface Rock {
  x: number;
  y: number;
}

const totalRound = 1000000000 * 4;
const calculatedRows = new Map<string, string>();

export default (inputString: string) => {
  let rows = inputString.split("\r\n");
  const processedMaps = new Map<string, number>();
  rows = rotate(rows);

  for (let i = 0; i < totalRound; i++) {
    rows = moveRocks(rows);
    const fullMap = rows.join("|");
    const foundId = processedMaps.get(fullMap);
    if (foundId) {
      const period = i - foundId;
      const remainingSteps = (totalRound - i - 1) % period;
      const finalIndex = i + remainingSteps - period;

      for (let [key, value] of processedMaps.entries()) {
        if (value === finalIndex) {
          return calculateForce(key.split("|"), finalIndex);
        }
      }
    }
    processedMaps.set(fullMap, i);
    rows = rotate(rows);
  }

  return -1;
};

const rotate = (rows: string[]): string[] => {
  return rows.map((val, index) =>
    rows
      .map((row) => row[index])
      .reverse()
      .join("")
  );
};

const moveRocks = (rows: string[]): string[] => {
  return rows.map((row) => {
    if (calculatedRows.get(row)) return calculatedRows.get(row);

    let rocks = 0;
    let newRow = [];
    [...row].forEach((char, i) => {
      if (char === ".") newRow.push(".");
      if (char === "O") rocks++;
      if (char === "#") {
        newRow.push("O".repeat(rocks));
        newRow.push("#");
        rocks = 0;
      }
    });
    newRow.push("O".repeat(rocks));
    const newRowString = newRow.join("");
    calculatedRows.set(row, newRowString);
    return newRowString;
  });
};

const calculateForce = (rows: string[], i: number): number => {
  const extraRotate = 4 - (i % 4);
  for (let j = 0; j < extraRotate; j++) {
    rows = rotate(rows);
  }

  return rows.reduce((sum, row) => {
    return sum + [...row].reduce((rowSum, char, i) => {
      if (char === 'O') return rowSum + i + 1;
      return rowSum
    }, 0 )
  }, 0)
};

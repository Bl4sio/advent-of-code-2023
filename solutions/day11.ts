
export default (inputString: string) => {
  const rows = inputString.split('\r\n');
  const INCREMENT_STEP = 999999;
  
  const nodes = [];
  const rowIncrements = new Map<number, number>();
  const colIncrements = new Map<number, number>();
  const emptyCols = new Set<number>();
  for (let i = 0; i < rows[0].length; i++) {
    emptyCols.add(i);
  }

  rows.forEach((row, y) => {
    let empty = true;
    for (let x = 0; x < row.length; x++) {
      const isNode = row[x] === '#';
      if (isNode) {
        emptyCols.delete(x);
        empty = false;
        nodes.push({ x, y });
      }
    }
    if (empty) {
      for (let i = y; i < rows.length; i++) {
        const increment = rowIncrements.get(i) ?? 0;
        rowIncrements.set(i, increment + INCREMENT_STEP);
      }
    }
  })

  emptyCols.forEach(col => {
    for (let i = col; i < rows.length; i++) {
      const increment = colIncrements.get(i) ?? 0;
      colIncrements.set(i, increment + INCREMENT_STEP);
    }
  });

  let sum = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const {x: x1, y: y1} = nodes[i];
      const { x: x2, y: y2 } = nodes[j];
      const incX1 = x1 + (colIncrements.get(x1) ?? 0);
      const incX2 = x2 + (colIncrements.get(x2) ?? 0);
      const incY1 = y1 + (rowIncrements.get(y1) ?? 0);
      const incY2 = y2 + (rowIncrements.get(y2) ?? 0);
      const dist = Math.abs(incX1 - incX2) + Math.abs(incY1 - incY2);
      sum += dist;
    }

  }
  return sum;
};

export default (inputString: string) => {
  const patterns = getPatterns(inputString);

  let sum = 0;

  patterns.forEach((rows, i) => {
    console.log("Pattern", i);
    const originalRowMirror = findMirror(rows);

    const cols = Array(rows[0].length).fill("");
    rows.forEach((row) =>
      [...row].forEach((char, i) => {
        cols[i] += char;
      })
    );

    const originalColMirror = findMirror(cols);

    const incremenet = findModifiedMirrors(
      rows,
      cols,
      originalRowMirror.length ? originalRowMirror[0] : 0,
      originalColMirror.length ? originalColMirror[0] : 0
    );

    sum += incremenet;
  });

  return sum;
};

const findModifiedMirrors = (rows: string[], cols: string[], originalRowMirror: number, originalColMirror: number) => {
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[0].length; j++) {
      const newChar = rows[i][j] === "#" ? "." : "#";
      const originalRow = rows[i];
      const originalCol = cols[j];
      rows[i] = rows[i].slice(0, j) + newChar + rows[i].slice(j + 1);
      cols[j] = cols[j].slice(0, i) + newChar + cols[j].slice(i + 1);

      const newRowMirror = findMirror(rows);
      const newColMirror = findMirror(cols);

      if (newRowMirror.length > 1) return newRowMirror.find((newValue) => newValue !== originalRowMirror) * 100;
      if (newColMirror.length > 1) return newColMirror.find((newValue) => newValue !== originalColMirror);

      rows[i] = originalRow;
      cols[j] = originalCol;

      if (newRowMirror.length && newRowMirror[0] !== originalRowMirror) return newRowMirror[0] * 100;
      if (newColMirror.length && newColMirror[0] !== originalColMirror) return newColMirror[0];
    }
  }
  return -Infinity;
};

const findMirror = (rows: string[]): number[] => {
  const mirrors = [];
  for (let i = 0; i < rows.length - 1; i++) {
    let mirror = true;
    for (let j = 0; j <= i; j++) {
      if (i + j + 1 >= rows.length) break;
      if (rows[i - j] !== rows[i + j + 1]) {
        mirror = false;
        break;
      }
    }
    if (mirror) {
      // console.log("Mirror found:", i + 1);
      mirrors.push(i + 1);
    }
  }
  // console.log("No mirror found!");
  return mirrors;
};

const getPatterns = (inputString: string): string[][] => {
  const rows = inputString.split("\r\n");

  const patterns = [];
  let pattern = [];

  rows.forEach((row) => {
    if (row === "") {
      patterns.push(pattern);
      pattern = [];
    } else {
      pattern.push(row);
    }
  });

  if (pattern.length > 0) patterns.push(pattern);

  return patterns;
};

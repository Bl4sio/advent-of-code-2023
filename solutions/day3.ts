interface Number {
  value: number;
  start: number;
  end: number;
  row: number;
}

interface Connector {
  pos: number;
  row: number;
}

export default (inputString: string) => {
  let sum = 0;

  const dataMatrix = inputString.split("\r\n");
  const numbers: Number[] = [];
  const connectors: Connector[] = [];

  dataMatrix.forEach((row, i) => {
    let currentNumber = undefined;
    let start = undefined;

    [...row].forEach((char, x) => {
      const value = parseInt(char);
      if (char === "*") {
        connectors.push({
          pos: x,
          row: i,
        });
      }
      if (!isNaN(value)) {
        if (currentNumber === undefined) {
          // beginning of number
          currentNumber = 0;
          start = x;
        }
        // calculating the value of the current digit and modifing the other digits
        currentNumber *= 10;
        currentNumber += value;
      } else {
        // possible number end
        if (currentNumber) {
          numbers.push({
            value: currentNumber,
            start,
            end: x - 1,
            row: i,
          });
          // if (validateNumber(dataMatrix, start, x - 1, i)) sum += currentNumber;
          currentNumber = undefined;
          start = undefined;
        }
      }
    });

    // possible number end
    if (currentNumber !== undefined) {
      numbers.push({
        value: currentNumber,
        start,
        end: row.length - 1,
        row: i,
      });
      // if (validateNumber(dataMatrix, start, row.length, i)) sum += currentNumber;
    }
  });

  connectors.forEach(({ row, pos }) => {
    const connectedNumbers = numbers.filter(
      ({ start, end, row: numberRow }) => {
        return (
          row >= numberRow - 1 &&
          row <= numberRow + 1 &&
          pos >= start - 1 &&
          pos <= end + 1
        );
      }
    );
    if (connectedNumbers.length === 2)
      sum += connectedNumbers[0].value * connectedNumbers[1].value;
  });

  return sum;
};

const validateNumber = (
  dataMatrix: string[],
  start: number,
  end: number,
  row: number
) => {
  for (let i = start - 1; i <= end + 1; i++) {
    if (check(dataMatrix, row - 1, i)) return true;
    if (check(dataMatrix, row + 1, i)) return true;
  }
  if (check(dataMatrix, row, start - 1)) return true;
  if (check(dataMatrix, row, end + 1)) return true;
  return false;
};

const check = (dataMatrix: string[], y: number, x: number) => {
  if (x < 0 || y < 0) return false;
  if (y >= dataMatrix.length) return false;
  if (x >= dataMatrix[y].length) return false;
  const char = dataMatrix[y][x];
  return isNaN(parseInt(char)) && char != ".";
};

interface DataRange {
  source: number;
  dest: number;
  length: number;
}

export default (inputString: string) => {
  const inputRows = inputString.split("\r\n");
  const seeds = getSeeds(inputRows);
  const maps = parseData(inputRows);

  let min = Infinity;
  let bestSeed = undefined;

  let start;
  seeds.forEach((input) => {
    console.log(input, " start");
    if (start === undefined) start = input;
    else {
      for (let i = 0; i < input; i++) {
        const seed = start + i;
        let nextValue = seed;

        maps.forEach((map) => {
          nextValue = findNext(map, nextValue);
        });

        if (nextValue < min) {
          min = nextValue;
          bestSeed = seed;
        }
      }
      start = undefined;
    }
    console.log(input, " done");
  });

  seeds.forEach((seed) => {
    let nextValue = seed;

    maps.forEach((map) => {
      nextValue = findNext(map, nextValue);
    });

    if (nextValue < min) {
      min = nextValue;
      bestSeed = seed;
    }
  });

  return min;
};

const getSeeds = (rows: string[]) => {
  return rows
    .shift()
    .substring(7)
    .split(" ")
    .map((seed) => parseAndCheck(seed));
};

const parseData = (rows: string[]) => {
  const maps: DataRange[][] = [];
  let newMap: DataRange[];
  let readHeader = false;

  rows.forEach((row) => {
    if (row === "") {
      if (newMap) maps.push(newMap);
      newMap = [];
      readHeader = true;
      return;
    }

    if (readHeader) {
      // its in order we dont have to deal with it
      readHeader = false;
      return;
    }

    const [dest, source, length] = row.split(" ");
    newMap.push({
      source: parseAndCheck(source),
      dest: parseAndCheck(dest),
      length: parseAndCheck(length),
    });
  });

  return maps;
};

const findNext = (dataMap: DataRange[], leftValue: number): number => {
  let rightValue: number;
  dataMap.find(({ source, dest, length }) => {
    if (leftValue >= source && leftValue < source + length) {
      rightValue = dest - source + leftValue;
      return true;
    }
  });

  return rightValue ?? leftValue;
};

const parseAndCheck = (input: string) => {
  const value = parseInt(input);
  if (value.toString() !== input) throw Error("parsing error!");
  return value;
};

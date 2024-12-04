
export default (inputString: string) => {
  const rows = inputString.split('\r\n');
  let sum = 0;

  rows.forEach(row => {
    const numbers = row.split(' ').map(x => parseInt(x));

    const pyramid: number[][] = [[...numbers]];

    let rowIndex = 0;


    // build pyramid
    while (true) {
      const currentLevel = pyramid[rowIndex];
      const nextLevel = [];

      let prevNumber: number;
      let allZero = true;

      currentLevel.forEach(number => {
        if (prevNumber === undefined) {
          prevNumber = number;
          return;
        }

        const diff = number - prevNumber;
        if (diff !== 0) allZero = false;
        nextLevel.push(diff);
        prevNumber = number;
      })

      if (allZero) break;
      pyramid.push(nextLevel)

      rowIndex++;
    }

    // calculate next

    // const increment = pyramid.reduce((increment, level) => {
    //   return increment + level[level.length - 1];
    // }, 0);

    const increment = pyramid.reduce((increment, level, i) => {
      if (i % 2) {
        return increment - level[0];
      }
      return increment + level[0];
    }, 0);

    sum += increment;
  })

  return sum;
};

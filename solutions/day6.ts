
// const races = [
//   {
//     time: 55,
//     distance: 246
//   },
//   {
//     time: 82,
//     distance: 1441
//   },
//   {
//     time: 64,
//     distance: 1012
//   },
//   {
//     time: 90,
//     distance: 1111
//   },
// ]
const races = [
  {
    time: 55826490,
    distance: 246144110121111
  },
]

export default (inputString: string) => {
  let res = 1;

  races.forEach(({ time, distance }) => {
    let currentTime = 0;
    let min = 0;
    let max = Math.ceil(time / 2);

    while (true) {
      if (currentTime * (time - currentTime) > distance) {
        max = currentTime;
      } else {
        min = currentTime;
      }
    
      currentTime = Math.ceil((max + min) / 2);
    
      if (max - min === 1) {
        currentTime = max;
        break;
      };
    }

    const goodSolutions = time - currentTime * 2 + 1;

    if (goodSolutions > 0) {
      res *= goodSolutions;
    } else {
      res = 0;
    }
  })

  return res;
};
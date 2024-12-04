export default (inputString: string) => {
  const sequences = inputString.split(",");
  const boxes = new Map<number, Map<string, number>>();

  sequences.forEach((sequence) => {
    if (sequence[sequence.length - 1] === "-") {
      const label = sequence.slice(0, -1)
      const value = getValue(label);

      const lenses = boxes.get(value) ?? new Map<string, number>();
      lenses.delete(label)
      boxes.set(value, lenses);
      return;
    }

    // handle =
    const label = sequence.slice(0, -2)
    const value = getValue(label);
    const focal = parseInt(sequence[sequence.length - 1]);

    const lenses = boxes.get(value) ?? new Map<string, number>();
    lenses.set(label, focal);
    boxes.set(value, lenses);
  });

  let sum = 0;
  boxes.forEach((lenses, boxNumber) => {
    let focalSum = 0;
    let i = 0;
    lenses.forEach((focal) => {
      i++;
      focalSum += i * focal;
    })
    sum += (boxNumber + 1) * focalSum;
  })

  return sum;
};

const getValue = (sequence: string): number => {
  return [...sequence].reduce((value, char) => next(value, char), 0);
};

const next = (current: number, char: string): number => {
  return ((char.charCodeAt(0) + current) * 17) % 256;
};

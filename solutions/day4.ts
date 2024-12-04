export default (inputString: string) => {
  let sum = 0;
  const inputArray = inputString.split("\r\n");
  let cardCounts = new Array(inputArray.length).fill(1);

  inputArray.forEach((row, id) => {
    const winningNumbers = new Set<number>();
    const currentCardCount = cardCounts[id];
    let matches = 0;

    const [beginning, data] = row.split(":");

    const gameId = parseInt(beginning.substring(5));
    const [winningData, myData] = data.split("|");

    winningData.split(" ").forEach((value) => {
      if (!value) return;
      const number = parseInt(value);
      winningNumbers.add(number);
    });

    myData.split(" ").forEach((value) => {
      if (!value) return;
      const number = parseInt(value);
      if (winningNumbers.has(number)) matches++;
    });

    while (matches > 0) {
      cardCounts[id + matches] += currentCardCount;
      matches--;
    }
    sum += currentCardCount;
  });

  return sum;
};

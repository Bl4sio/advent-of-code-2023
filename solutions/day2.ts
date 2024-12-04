export default (inputString: string) => {
  let sum = 0;

  inputString.split("\r\n").forEach((row) => {
    const minCount = {
      red: 0,
      green: 0,
      blue: 0,
    };
    const [beginning, data] = row.split(":");

    const gameId = parseInt(beginning.substring(5));
    const pulls = data.split(";");

    pulls.forEach((pull) => {
      const balls = pull.split(",");

      balls.forEach((ball) => {
        const [_, count, name] = ball.split(" ");
        minCount[name] = Math.max(minCount[name], parseInt(count));
      });
    });

    const increment = minCount.red * minCount.green * minCount.blue;

    sum += increment;
  });

  return sum;
};

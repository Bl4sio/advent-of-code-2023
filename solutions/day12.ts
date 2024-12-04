const REPEAT_COUNT = 5;

export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  let sum = 0;

  console.log("STARTED");
  rows.forEach((row, rowId) => {
    const start = Date.now();
    const [baseFieldString, baseDamageString] = row.split(" ");
    const fieldString = (baseFieldString + "?")
      .repeat(REPEAT_COUNT)
      .slice(0, -1)
      .replaceAll(".", "0");
    const damageString = (baseDamageString + ",")
      .repeat(REPEAT_COUNT)
      .slice(0, -1);

    const solutions = new Map<string, number>();

    const count = calculate(fieldString, damageString, solutions);
    sum += count;

      console.log(
        rowId + " count: " + count + " duration: ",
        (Date.now() - start) / 1000,
        "s"
      );
  });

  return sum;
};

const calculate = (
  fieldString: string,
  damages: string,
  solutions: Map<string, number>
): number => {
  const key = `${damages}_${fieldString}`;
  const storedSoltuion = solutions.get(key);
  if (storedSoltuion !== undefined) return storedSoltuion;
  if (damages === "") {
    // run out of damages check for uncovered #
    const validCount = fieldString.search("#") === -1 ? 1 : 0;
    solutions.set(key, validCount);
    return validCount;
  }
  if (fieldString === "") {
    // some damage remain, but no space
    solutions.set(key, 0);
    return 0;
  }

  let count = 0;

  const damageValues = damages.split(",");
  const damage = parseInt(damageValues.shift());
  const remaingDamages = damageValues.join(",");

  let damageString = "#".repeat(damage);
  if (remaingDamages !== "") damageString += "0";

  for (let i = 0; i <= fieldString.length - damage; i++) {
    const currentFieldString = fieldString.slice(i, i + damageString.length);
    const remainingFieldString = fieldString.slice(i + damageString.length);

    const valid = damageString.match(currentFieldString.replaceAll("?", "."));
    if (!valid) {
      if (currentFieldString[0] === "#") break;
      continue;
    }

    count += calculate(remainingFieldString, remaingDamages, solutions);
    if (currentFieldString[0] === "#") break; // we will skipp a damage next turn
  }

  solutions.set(key, count);
  return count;
};
export default (inputString: string) => {
  const rows = inputString.split("\r\n");
  let sum = 0;

  console.log("STARTED");
  rows.forEach((row, rowId) => {
    const start = Date.now();
    const [baseFieldString, baseDamageString] = row.split(" ");
    const fieldString = (baseFieldString + "?").repeat(5).slice(0, -1);
    const damageString = (baseDamageString + ",").repeat(5).slice(0, -1);

    const mask = [...fieldString].reduce((mask, char) => {
      if (char === "?") return mask << BigInt(1);
      return (mask << BigInt(1)) + BigInt(1);
    }, BigInt(0));
    const expected = [...fieldString].reduce((mask, char) => {
      if (char === "#") return (mask << BigInt(1)) + BigInt(1);
      return mask << BigInt(1);
    }, BigInt(0));
    const damageLength = damageString.split(",").map((x) => parseInt(x));
    const damages = damageLength.map((length) => "1".repeat(length) + "0");
    damages[damages.length - 1] = damages[damages.length - 1].slice(0, -1);
    const length = BigInt(fieldString.length);
    const freeChars = damageLength.reduce(
      (total, i) => total - i - 1,
      Number(length) + 1
    );

    const damage = damages.shift();
    const valids = addToSequence(
      "",
      freeChars,
      damage,
      damages,
      mask,
      expected,
      length
    );
    // const valids = sequences
    //   .map((sequence) => BigInt('0b' + sequence))
    //   .filter((sequence) => (sequence & mask) === expected);
    console.log(
      rowId + " " + row,
      " duration: ",
      (Date.now() - start) / 1000,
      "s"
    );
    sum += valids;
  });

  return sum;
};

const addToSequence = (
  sequence: string,
  freeChars: number,
  currentDamage: string,
  remainingDamages: string[],
  mask: bigint,
  expected: bigint,
  totalLength: bigint
): number => {
  if (!currentDamage) {
    const nextSequence = sequence + "0".repeat(freeChars);
    if ((BigInt("0b" + nextSequence) & mask) === expected) return 1;
    return 0;
  }
  if (freeChars === 0) {
    const nextSequence = remainingDamages.reduce(
      (res, damage) => res + damage,
      sequence + currentDamage
    );

    if ((BigInt("0b" + nextSequence) & mask) === expected) return 1;
    return 0;
  }

  const nextRemainingDamages = [...remainingDamages];
  const nextDamage = nextRemainingDamages.shift();
  let sequences = 0;

  for (let i = 0; i <= freeChars; i++) {
    const nextSequence = sequence + "0".repeat(i) + currentDamage;
    const nextSequenceLength = BigInt(nextSequence.length);
    const subMask = mask >> (totalLength - nextSequenceLength);
    const subExpected = expected >> (totalLength - nextSequenceLength);
    if ((BigInt("0b" + nextSequence) & subMask) !== subExpected) continue;

    const remainingFreeChars = freeChars - i;
    const increment = addToSequence(
      nextSequence,
      remainingFreeChars,
      nextDamage,
      nextRemainingDamages,
      mask,
      expected,
      totalLength
    );
    sequences += increment;
  }
  return sequences;
};

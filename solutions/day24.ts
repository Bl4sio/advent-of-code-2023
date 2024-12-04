import { inv, matrix, multiply } from "mathjs";
import { Decimal } from "decimal.js";

interface Stone {
  x: Decimal;
  y: Decimal;
  z: Decimal;
  dx: Decimal;
  dy: Decimal;
  dz: Decimal;
}

const MIN_POS = 200000000000000;
const MAX_POS = 400000000000000;

export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const stones = rows.map((row): Stone => {
    const [pos, velocity] = row.split(" @ ");
    const [x, y, z] = pos.split(", ").map((i) => new Decimal(parseInt(i)));
    const [dx, dy, dz] = velocity.split(", ").map((i) => new Decimal(parseInt(i)));

    return { x, y, z, dx, dy, dz };
  });

  let res = 0;

  // A * X = B
  // X = inv(A) * B
  for (let j = 0; j < rows.length - 3; j++) {
    const A = [];
    const B = [];
    for (let i = j; i < j + 3; i++) {
      const stone1 = stones[i];
      const stone2 = stones[i + 1];
      const rowAY = [
        new Decimal(stone2.dy).minus(stone1.dy),
        new Decimal(stone1.dx).minus(stone2.dx),
        0,
        new Decimal(stone1.y).minus(stone2.y),
        new Decimal(stone2.x).minus(stone1.x),
        0
      ];
      const rowBY = getE(stone1).minus(getE(stone2));
      A.push(rowAY);
      B.push(rowBY);
      const rowAZ = [
        new Decimal(stone2.dz).minus(stone1.dz),
        0,
        new Decimal(stone1.dx).minus(stone2.dx),
        new Decimal(stone1.z).minus(stone2.z),
        0,
        new Decimal(stone2.x).minus(stone1.x),
      ];
      const rowBZ = getE(stone1, true).minus(getE(stone2, true));
      A.push(rowAZ);
      B.push(rowBZ);
    }

    const X = multiply(inv(A), B);
    const x = X[0].toNumber();
    const y = X[1].toNumber();
    const z = X[2].toNumber();
    const dx = X[3].toNumber();
    const dy = X[4].toNumber();
    const dz = X[5].toNumber();

    const valid = stones.every((stone) => {
      const tX = (stone.x.toNumber() - x) / (dx - stone.dx.toNumber());
      const tY = (stone.y.toNumber() - y) / (dy - stone.dy.toNumber());
      const tZ = (stone.z.toNumber() - z) / (dz - stone.dz.toNumber());


      return tX === tY && tX === tZ;
    });
    if (valid) {
      return x + y + z;
    }
  }

  return res;
};

const getE = (stone: Stone, useZ = false) => {
  if (useZ) return new Decimal(stone.dx).mul(stone.z).minus(new Decimal(stone.x).mul(stone.dz));

  return new Decimal(stone.dx).mul(stone.y).minus(new Decimal(stone.x).mul(stone.dy));
};

// const getTime = (x1: number, x2: number, dx1: number, dx2: number) => {
//   if (dx1 === dx2) {
//     if (x1 === x2) return Infinity;
//     else return -Infinity;
//   }

//   return (x1 - x2) / (dx2 - dx1);
// };

// const checkPosition = (stone: Stone, t: number) => {
//   if (t === Infinity) return true;
//   const x = stone.x + t * stone.dx;
//   if (MIN_POS > x || MAX_POS < x) return false;
//   const y = stone.y + t * stone.dy;
//   if (MIN_POS > y || MAX_POS < y) return false;
//   return true;
// };

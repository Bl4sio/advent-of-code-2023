
interface NodeLink {
  R: string,
  L: string,
}

interface NodeJump {
  last: string,
  ends: Set<number>,
}

export default (inputString: string) => {
  const rows = inputString.split('\r\n');
  const directions = rows[0];
  const mapping = new Map<string, NodeLink>()
  const jumps = new Map<string, NodeJump>()

  let currentNodes = [];

  rows.splice(2).forEach(row => {
    if (row === '') return;
    const strings = [...row.matchAll(/[a-zA-Z0-9]{3}/g)];
    const node = strings[0][0];
    const left = strings[1][0];
    const right = strings[2][0];
    mapping.set(node, { L: left, R: right });
    if (node[2] === 'A') currentNodes.push(node);
  })

  for (const node of mapping.keys()) {
    const ends = new Set<number>();
    let current = node;
    let i = 0;

    for (const dir of directions) {
      i++;
      current = mapping.get(current)[dir];
      if (current[2] === 'Z') ends.add(i);
    }

    jumps.set(node, {
      last: current,
      ends: ends
    });
  }

  let steps = 0;
  const cycleLength = directions.length
  let firstNode = currentNodes.pop();

  while (true) {
    const currentJump = jumps.get(firstNode);
    const otherJumps = currentNodes.map(node => jumps.get(node));

    let finished = [...currentJump.ends]
    otherJumps.forEach(jump => {
      if (!finished.length) return;
      finished = findIntersection(finished, jump.ends)
    })

    if (finished.length) {
      const first = Math.min(...finished);
      steps += first;
      break;
    }

    // const finished = currentJump.ends.find(end => {
    //   return currentNodes.every(node => {
    //     return jumps.get(node).ends.includes(end);
    //   })
    // })

    // if (finished !== undefined) {
    //   steps += finished;
    //   break;
    // };

    steps += cycleLength;
    firstNode = currentJump.last;
    currentNodes = otherJumps.map(jump => jump.last);
  }

  return steps;
};

function findIntersection(list: number[], set: Set<number>) {
  // Use the spread operator to convert the intersection set back to an array
  return list.filter(value => set.has(value));
}
const cardToHexMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 'A',
  J: '0',
  Q: 'C',
  K: 'D',
  A: 'E'
}

interface Player {
  hexCards: string;
  bet: number;
  strength: number;
}

export default (inputString: string) => {
  const rows = inputString.split('\r\n');

  const players = rows.map(row => {
    const [cards, bet] = row.split(' ');
    const duplicates = new Map<string, number>();
    let hexCards = '';

    [...cards].forEach(card => {
      const count = duplicates.get(card) ?? 0;
      duplicates.set(card, count + 1);
      hexCards += cardToHexMap[card];
    })

    const strength = getHandStrength(duplicates);

    const player: Player = {
      bet: parseInt(bet),
      hexCards,
      strength,
    };

    return player;
  })

  players.sort((playerA, playerB) => {
    const strengthDiff = playerA.strength - playerB.strength;
    if (strengthDiff !== 0) return strengthDiff;
    return playerA.hexCards > playerB.hexCards ? 1 : -1;
  })

  return players.reduce((sum, player, i) => {
    return sum + player.bet * (i + 1);
  }, 0);
};


const getHandStrength = (duplicates: Map<string, number>): number => {
  const jokers = duplicates.get('J') ?? 0;
  duplicates.delete('J')
  const counts = Array.from(duplicates.values()).map(count => count).sort();

  if (counts.length > 0) counts[counts.length - 1] += jokers;
  else counts.push(jokers);

  if (counts.find(c => c === 5)) return 6;
  if (counts.find(c => c === 4)) return 5;
  if (counts.find(c => c === 3)) {
    if (counts.find(c => c === 2)) return 4;
    return 3;
  }
  const pairs = counts.filter(c => c === 2);

  if (pairs.length === 2) return 2;
  if (pairs.length === 1) return 1;

  return 0;
}
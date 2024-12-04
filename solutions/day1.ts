export default (inputString: string) => {

  const goodData = inputString
    .replaceAll('one', 'one1one')
    .replaceAll('two', 'two2two')
    .replaceAll('three', 'three3three')
    .replaceAll('four', 'four4four')
    .replaceAll('five', 'five5five')
    .replaceAll('six', 'six6six')
    .replaceAll('seven', 'seven7seven')
    .replaceAll('eight', 'eight8eight')
    .replaceAll('nine', 'nine9nine')

  let sum = 0;

  goodData.split("\n").forEach((row) => {
    if (!row) return;
    const numbers = row.match(/[0-9]/g);
    if (!numbers) throw "No numbers found";
    const first = parseInt(numbers[0]);
    const last = parseInt(numbers[numbers.length - 1]);
    sum += 10 * first + last;
  });

  return sum;
}
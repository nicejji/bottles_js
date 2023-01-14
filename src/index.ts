const shuffle = (arr: any[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const matchBottles = <T,>(from: T[], to: T[], bottleSize: number): boolean => 
  from.length !== 0 && to.length !== bottleSize && 
    (to.length === 0 || to.slice(-1)[0] === from.slice(-1)[0]);

const transfuseBottles = <T,>(from: T[], to: T[], bottleSize: number) => {
  while (matchBottles(from, to, bottleSize)) to.push(from.pop() as T);
};

const availableMoves = <T,>(bottles: T[][], bottleSize: number): number[][] => {
  const moves = [];
  for (let i = 0; i < bottles.length; i++) {
    for (let j = 0; j < bottles.length; j++) {
      if (i !== j && matchBottles(bottles[i], bottles[j], bottleSize)) {
        moves.push([i, j])
      }
    }
  }
  return moves
}

// Generate array of randomly fullfilled bottles of `bottleSize`
const generateBottles = <T,>(blockTypes: T[], bottleSize: number): T[][] => {
  const blocks = blockTypes.map(b => Array(bottleSize).fill(b)).flat();
  shuffle(blocks);
  return Array(blockTypes.length).fill(null).map(
    _ => Array(bottleSize).fill(null).map(_ => blocks.pop())
  )
};

// Checks if all bottles contains equal blocks (win condition)
const isBottlesSorted = <T,>(bottles: T[][], bottleSize: number): boolean => {
    for (const bottle of bottles) {
      const len = bottle.length
      if ((len > 0 && len < bottleSize) || 
          (!bottle.every(v => v === bottle[0]))) return false;
    }
    return true;
}

// get fancy formated string representation of bottles array
const formatBottles = <T,>(bottles: T[][], bottleSize: number): string => {
  let text = '';
  const mask = (v: any) => `${v === undefined ? '-' : v}\t`;
  for (let j = bottleSize - 1; j >= 0; j--) {
    for (let i = 0; i < bottles.length; i++) text += mask(bottles[i][j]);
    text += '\n';
  }
  bottles.forEach((_, i) => text += mask(i + 1));
  text += '\n';
  return text;
}

// parse move from 2 digit string
const parseMove = (str: string, maxIndex: number): number[] => {
    const [from, to] = str.trim().split('').map(n => parseInt(n) - 1);
    if (isNaN(from) || isNaN(to) || from > maxIndex || to > maxIndex) {
      throw new Error();
    }
    return [from, to];
}

// game sample in cli
const cli_game = <T,>(bottleSize: number, empty: number, types: T[]) => {
  const bottles = generateBottles(types, bottleSize).concat([[],[]]);
  const max_index = types.length + empty - 1;
  const showState = () => {
    console.clear();
    console.log(formatBottles(bottles, bottleSize));
    console.log(`Available moves: ${
      availableMoves(bottles, bottleSize).map(v => `${v[0] + 1} -> ${v[1] + 1}`)
      .join(" | ")
    }`);
    console.log('Your move (FT) ? :');
  };
  showState();
  console.log(
`
\n
---\tThis is "Water Sort Game" CLI implementation

---\tRULES
---\tYou can only pour blocks if it is linked to the same symbol,
---\tand there enough space.

---\tHOW TO PLAY
---\tAt each step enter two digits FT, where F - index of bottle from,
---\tT - index of bottle to, you wanna to 'transfuseBottles' blocks.

---\tCUSTOMIZATION
---\tAlso you can edit constants at the end of source code file :)
---\tHave a fun!
\n
`
)
  process.stdin.on('data', data => {
    try {
      const [from, to] = parseMove(data.toString(), max_index);
      transfuseBottles(bottles[from], bottles[to], bottleSize);
      showState();
      if (isBottlesSorted(bottles, bottleSize)) {
        console.log('You won!');
        process.exit();
      } 
    }
    catch {
      console.log('Invalid move!')
    }
  })
}

// starting game
const SIZE = 10;
const EMPTY = 2;
const TYPES = ['🍎', '🍊', '🍌', '🥝', '🫐'];
cli_game(SIZE, EMPTY, TYPES);

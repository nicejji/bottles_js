// shuffles array elements with Fisher-Yates algorithm
const shuffle = (arr: any[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

// Is last block can be moved from bottle `from` to bottle `to`
const match = <T,>(from: T[], to: T[], size: number): boolean => 
  from.length !== 0 && to.length !== size && 
    (to.length === 0 || to.slice(-1)[0] === from.slice(-1)[0]);

// Moves blocks from bottle to bootle while it can be performed according
// to `match` function
const transfuse = <T,>(from: T[], to: T[], size: number): number => {
  let moved = 0;
  while (match(from, to, size)) {
    to.push(from.pop() as T)
    moved++;
  };
  return moved;
};

// returns availableMoves
const availableMoves = <T,>(bottles: T[][], size: number): number[][] => {
  const moves: number[][] = [];
  for (let i = 0; i < bottles.length; i++) {
    for (let j = 0; j < bottles.length; j++) {
      if (i !== j && match(bottles[i], bottles[j], size)) {
        moves.push([i, j])
      }
    }
  }
  return moves
}

// Generete array of randomly fullfilled bottles of `size`
const generateBottles = <T,>(blockTypes: T[], 
                             size: number, 
                             empty: number): T[][] => {
  const blocks = blockTypes.map(b => Array(size).fill(b)).flat();
  shuffle(blocks);
  const bottles = Array(blockTypes.length).fill(null).map(
    _ => Array(size).fill(null).map(
      _ => blocks.pop()
    )
  )
  for (let i = 0; i < empty; i++) bottles.push([]);
  return bottles;
};

// Checks if all bottles contains equal blocks (win condition)
const isBottleSorted = <T,>(bottles: T[][], size: number): boolean => {
    for (const bottle of bottles) {
      if (bottle.length > 0 && bottle.length < size) return false;
      if (!bottle.every(v => v === bottle[0])) return false;
    }
    return true;
}

// get fancy formated string representation of bottles array
const formatBottles = <T,>(bottles: T[][], size: number): string => {
  let text = '';
  const mask = (s: any) => `${s === undefined ? '-' : s}\t`;
  for (let j = size - 1; j >= 0; j--) {
    for (let i = 0; i < bottles.length; i++) {
      text += mask(bottles[i][j]);
    }
    text += '\n';
  }
  bottles.forEach((_, i) => text += mask(i + 1));
  text += '\n';
  return text;
}

// parse move from 2 digit string
const parseMove = (str: string, maxIndex: number): number[] | null => {
    str = str.trim()
    const [from, to] = str.split('').map(n => parseInt(n) - 1);
    if (isNaN(from) || isNaN(to)) return null;
    if (from > maxIndex || to > maxIndex) return null;
    return [from, to];
}

// game sample in cli
const cli_game = <T,>(size: number, empty: number, types: T[]) => {
  const bottles = generateBottles(types, size, empty);
  const max_index = types.length + empty - 1;

  const showState = () => {
    console.clear();
    console.log(formatBottles(bottles, size));
    console.log(`Available moves: ${
      availableMoves(bottles, size).map(v => `${v[0] + 1} -> ${v[1] + 1}`)
      .join(" | ")
    }`);
    console.log('Your move (FT)? :');
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
---\tT - index of bottle to, you wanna to 'transfuse' blocks.

---\tCUSTOMIZATION
---\tAlso you can edit constants at the end of source code file :)
---\tHave a fun!
\n
`
)

  process.stdin.on('data', data => {
    const move = parseMove(data.toString(), max_index);
    if (move !== null) {
      const [from, to] = move;
      transfuse(bottles[from], bottles[to], size);
    }

    showState();

    if (isBottleSorted(bottles, size)) {
      console.log('You won!');
      process.exit();
    } 
  })
}

// starting game
const SIZE = 10;
const EMPTY = 2;
const TYPES = ['????', '????', '????', '????', '????'];
cli_game(SIZE, EMPTY, TYPES);

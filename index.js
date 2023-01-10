const BLOCK_SYM = '▊';


const COLORS = {
  RED: '\u001b[31m',
  GREEN: '\u001b[32m',
  YELLOW: '\u001b[33m',
  BLUE: '\u001b[34m',
  MAGENTA: '\u001b[35m',
  CYAN: '\u001b[36m',
}


RU_MESSAGE_PACK = {
  COLORS_UNMATCH: '🌈 Цвета бутылочек не совпадают.',
  MOVE_OVERFLOW: '🔢 Введите 2 цифры (откуда, куда).',
  NOT_A_NUMBER: '🔢 Введите 2 цифры в формате XX.',
  WRONG_BOTTLE: '🤨 Такой бутылочки нету на поле.',
  EMPTY_BOTTLE: '🫙 Бутылочка пуста, переливать не от куда.',
  FULL_BOTTLE: '🍾 Бутылочка для заливки уже полна.',
  MOVE_PROMPT: '😎 Введите свой ход: ',
  WIN_MESSAGE: '🏆 Ты крут! Все по местам.',
}

EN_MESSAGE_PACK = {
  COLORS_UNMATCH: '🌈 Bottles color do not match.',
  MOVE_OVERFLOW: '🔢 Enter 2 digits.',
  NOT_A_NUMBER: '🔢 Only digits allowed.',
  WRONG_BOTTLE: '🤨 No bottle with such index there.',
  EMPTY_BOTTLE: '🫙 Bottle from is empty, nothing to fill.',
  FULL_BOTTLE: '🍾 Bottle to is already full.',
  MOVE_PROMPT: '😎 Your move: ',
  WIN_MESSAGE: '🏆 You are legend! All things sorted.',
}

const colorize = (color, str) => `${color}${str}${'\u001b[0m'}`;


const createBlocks = (colors, blockSym) => 
  colors.map(color => colorize(color, blockSym));


const shuffle = arr => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


const createBottles = (blockTypes, bottleSize, emptyBottlesCount) => {
  const blocks = shuffle(
    blockTypes.map(block => Array(bottleSize).fill(block)).flat()
  );
  const bottles = Array(blockTypes.length).fill(null).map(
    _ => Array(bottleSize).fill(null).map(
      _ => blocks.pop()
    )
  );
  for (let i = 0; i < emptyBottlesCount; i++) bottles.push([]);
  return bottles
}


class Game {

  constructor (blockTypes, bottleSize, emptyBottlesCount, message_pack) {
    this.message_pack = message_pack
    this.bottleSize = bottleSize;
    this.bottles = createBottles(blockTypes, bottleSize, emptyBottlesCount);
  }
    

  parseMove(str) {
    const maxIndex = this.bottles.length;
    if (str.trim().length !== 2) throw new Error(this.message_pack.MOVE_OVERFLOW);
    const [from, to] = str.trim().split('').map(n => parseInt(n - 1));
    if (isNaN(from) || isNaN(to)) throw new Error(this.message_pack.NOT_A_NUMBER);
    if (from >= maxIndex || to >= maxIndex) throw new Error(this.message_pack.WRONG_BOTTLE);
    return [from, to];
  }


  move (from, to) {
    const fromLastBlock = this.bottles[from].slice(-1)[0];
    const toLastBlock = this.bottles[to].slice(-1)[0];
    if (fromLastBlock === undefined) throw new Error(this.message_pack.EMPTY_BOTTLE);
    if (toLastBlock !== undefined && toLastBlock !== fromLastBlock) {
      throw new Error(this.message_pack.COLORS_UNMATCH)
    };
    if (this.bottles[to].length >= this.bottleSize) throw new Error(this.message_pack.FULL_BOTTLE);
    for (let block of [...this.bottles[from]].reverse()) {
      if (this.bottles[to].length < this.bottleSize && block === fromLastBlock) {
        this.bottles[to].push(this.bottles[from].pop());
      }
      else {
        break;
      }
    }
  }


  printBottles () {
    const mask = sym => `${sym === undefined ? '-' : sym}\t`
    for (let j = this.bottleSize - 1; j >= 0; j--) {
      for (let i = 0; i < this.bottles.length; i++) {
        process.stdout.write(mask(this.bottles[i][j]))
      }
      process.stdout.write('\n')
    }
    this.bottles.forEach((_, i) => process.stdout.write(mask(i + 1)))
    process.stdout.write('\n')
  }

  
  checkWin () {
    for (const bottle of this.bottles) {
      if (bottle.length > 0 && bottle.length < this.bottleSize) return false;
      if (!bottle.every(v => v === bottle[0])) return false;
    }
    return true;
  }


  run () {
    console.clear();
    this.printBottles();
    process.stdout.write(this.message_pack.MOVE_PROMPT)

    process.stdin.on('data', data => {
      console.clear();
      try {
        const [from, to] = this.parseMove(data.toString());
        this.move(from, to);
        this.printBottles();
        if (this.checkWin()) {
          process.stdout.write(colorize(COLORS.GREEN, this.message_pack.WIN_MESSAGE + '\n'));
          process.exit();
        }
        else {
        }
      }
      catch (e) {
        this.printBottles();
        process.stdout.write(colorize(COLORS.YELLOW, `\t${e.message}\n\n`));
      }
      process.stdout.write(this.message_pack.MOVE_PROMPT);
    })
  }


}


const blockTypes = Object.entries(COLORS).map(
  ([key, value]) => colorize(value, `${BLOCK_SYM}${key[0]}${BLOCK_SYM}`)
).slice(0, 4)

const game = new Game(blockTypes, 10, 2, EN_MESSAGE_PACK);
game.run();

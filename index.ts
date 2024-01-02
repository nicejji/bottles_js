type Bottle = {
	capacity: number;
	cells: string[];
};

const shuffle = <T>(items: T[]) => items.toSorted(() => Math.random() * 2 - 1);

// Is last block can be moved from bottle `from` to bottle `to`
const match = (from: Bottle, to: Bottle): boolean =>
	from.cells.length !== 0 &&
	to.cells.length !== to.capacity &&
	(to.cells.length === 0 || to.cells.at(-1) === from.cells.at(-1));

// Moves blocks from bottle to bootle while it can be performed according
// to `match` function
const transfuse = (from: Bottle, to: Bottle) => {
	while (match(from, to)) to.cells.push(from.cells.pop() as string);
};

// returns availableMoves
const availableMoves = (bottles: Bottle[]) => {
	const moves: number[][] = [];
	for (let i = 0; i < bottles.length; i++) {
		for (let j = 0; j < bottles.length; j++) {
			if (i !== j && match(bottles[i], bottles[j])) moves.push([i, j]);
		}
	}
	return moves;
};

// Generete array of randomly fullfilled bottles of `size`
const createBottles = (
	capacities: number,
	emptyCount: number,
	contentTypes: string[],
) => {
	const shared = shuffle(
		contentTypes.flatMap((c) => Array(capacities).fill(c)),
	) as string[];
	const bottles: Bottle[] = Array.from({ length: contentTypes.length }, () => ({
		capacity: capacities,
		cells: Array.from({ length: capacities }, () => shared.pop() as string),
	}));
	const empties: Bottle[] = Array.from({ length: emptyCount }, () => ({
		capacity: capacities,
		cells: [],
	}));
	return [...bottles, ...empties];
};

// Checks if all bottles contains equal blocks (win condition)
const isAllSorted = (bottles: Bottle[]) =>
	!bottles.some(
		({ cells, capacity }) =>
			(cells.length > 0 && cells.length < capacity) ||
			cells.some((c) => c !== cells[0]),
	);

// get fancy formated string representation of bottles array
const formatBottles = (bottles: Bottle[]) => {
	const rows = bottles[0].capacity;
	const tCorners = Array(bottles.length).fill("╮ ╭").join("\t");
	const bCorners = Array(bottles.length).fill("╰─╯").join("\t");
	const body = Array.from({ length: rows }, (_, cellIndex) =>
		bottles
			.map(({ cells }) => `│${cells[rows - cellIndex - 1] ?? " "}│`)
			.join("\t"),
	).join("\n");
	const bottom = Array.from(
		{ length: bottles.length },
		(_, bottleIndex) => ` ${bottleIndex + 1} `,
	).join("\t");
	return `${tCorners}\n${body}\n${bCorners}\n${bottom}\n`;
};

// parse move from 2 digit string
const parseMove = (raw: string): [number, number] | null => {
	const chars = raw.trim().split("");
	if (chars.length !== 2) return null;
	const [from, to] = chars.map((n) => parseInt(n) - 1);
	if (Number.isNaN(from) || Number.isNaN(to)) return null;
	return [from, to];
};

// game sample in cli
const cli_game = (
	capacities: number,
	emptyCount: number,
	contentTypes: string[],
) => {
	const bottles = createBottles(capacities, emptyCount, contentTypes);
	const showState = () => {
		console.clear();
		console.log(formatBottles(bottles));
		console.log(
			`Available moves: ${availableMoves(bottles)
				.map(([from, to]) => `${from + 1} -> ${to + 1}`)
				.join(" | ")}`,
		);
		console.log("Your move (FT)? :");
	};

	showState();

	console.log(
		`
\n
───\tThis is "Water Sort Game" CLI implementation

───\tRULES
───\tYou can only pour blocks if it is linked to the same symbol,
───\tand there enough space.

───\tHOW TO PLAY
───\tAt each step enter two digits FT, where F - index of bottle from,
───\tT - index of bottle to, you wanna to 'transfuse' blocks.

───\tCUSTOMIZATION
───\tAlso you can edit constants at the end of source code file :)
───\tHave a fun!
\n
`,
	);

	process.stdin.on("data", (data) => {
		const move = parseMove(data.toString());
		if (move !== null) {
			const [from, to] = move.map((i) => bottles[i]);
			if (from && to) transfuse(from, to);
		}

		showState();

		if (isAllSorted(bottles)) {
			console.log("You won!");
			process.exit();
		}
	});
};

const CONTENT_TYPES = Array.from(
	{ length: 6 },
	(_, i) => `\x1b[${31 + i}m█\x1b[0m`,
);
// starting game
const CAPACITIES = 10;
const EMPTY_COUNT = 2;
cli_game(CAPACITIES, EMPTY_COUNT, CONTENT_TYPES);

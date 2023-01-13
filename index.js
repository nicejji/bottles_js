// shuffles array elements with Fisher-Yates algorithm
var shuffle = function (arr) {
    var _a;
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [arr[j], arr[i]], arr[i] = _a[0], arr[j] = _a[1];
    }
};
// Is last block can be moved from bottle `from` to bottle `to`
var match = function (from, to, size) {
    return from.length !== 0 && to.length !== size &&
        (to.length === 0 || to.slice(-1)[0] === from.slice(-1)[0]);
};
// Moves blocks from bottle to bootle while it can be performed according
// to `match` function
var transfuse = function (from, to, size) {
    var moved = 0;
    while (match(from, to, size)) {
        to.push(from.pop());
        moved++;
    }
    ;
    return moved;
};
// Generete array of randomly fullfilled bottles of `size`
var generateBottles = function (blockTypes, size, empty) {
    var blocks = blockTypes.map(function (b) { return Array(size).fill(b); }).flat();
    shuffle(blocks);
    var bottles = Array(blockTypes.length).fill(null).map(function (_) { return Array(size).fill(null).map(function (_) { return blocks.pop(); }); });
    for (var i = 0; i < empty; i++)
        bottles.push([]);
    return bottles;
};
// Checks if all bottles contains equal blocks (win condition)
var isBottleSorted = function (bottles, size) {
    var _loop_1 = function (bottle) {
        if (bottle.length > 0 && bottle.length < size)
            return { value: false };
        if (!bottle.every(function (v) { return v === bottle[0]; }))
            return { value: false };
    };
    for (var _i = 0, bottles_1 = bottles; _i < bottles_1.length; _i++) {
        var bottle = bottles_1[_i];
        var state_1 = _loop_1(bottle);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return true;
};
// get fancy formated string representation of bottles array
var formatBottles = function (bottles, size) {
    var text = '';
    var mask = function (s) { return "".concat(s === undefined ? '-' : s, "\t"); };
    for (var j = size - 1; j >= 0; j--) {
        for (var i = 0; i < bottles.length; i++) {
            text += mask(bottles[i][j]);
        }
        text += '\n';
    }
    bottles.forEach(function (_, i) { return text += mask(i + 1); });
    text += '\n';
    return text;
};
// parse move from 2 digit string
var parseMove = function (str, maxIndex) {
    str = str.trim();
    var _a = str.split('').map(function (n) { return parseInt(n) - 1; }), from = _a[0], to = _a[1];
    if (isNaN(from) || isNaN(to))
        return null;
    if (from > maxIndex || to > maxIndex)
        return null;
    return [from, to];
};
// game sample in cli
var cli_game = function () {
    var args = process.argv.slice(2);
    var SIZE;
    var EMPTY;
    var TYPES;
    try {
        TYPES = JSON.parse(args[0]);
        SIZE = parseInt(args[1]);
        EMPTY = parseInt(args[2]);
    }
    catch (e) {
        console.log('Invalid args!');
        process.exit();
    }
    var MAX_INDEX = TYPES.length + EMPTY - 1;
    var bottles = generateBottles(TYPES, SIZE, EMPTY);
    console.clear();
    console.log(process.argv);
    console.log(formatBottles(bottles, SIZE));
    console.log('Your next move:');
    process.stdin.on('data', function (data) {
        console.clear();
        var move = parseMove(data.toString(), MAX_INDEX);
        if (move !== null) {
            var from = move[0], to = move[1];
            transfuse(bottles[from], bottles[to], SIZE);
        }
        if (isBottleSorted(bottles, SIZE)) {
            console.log('You won!');
            process.exit();
        }
        else {
            console.log(formatBottles(bottles, SIZE));
            console.log('Your next move:');
        }
    });
};
cli_game();

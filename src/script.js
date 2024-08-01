// array of Gameboy colors
const colors = ["#071821", "#306850", "#86c06c", "#e0f8cf"];

// brush types <Key, Value> = <brushType, cursorType>
const brushTypes = {
    draw: "default",
    fill: "url('images/paint-bucket.cur'), wait"
};

// Initialize default values
let selectedBrush = "draw";
const pixelSize = 32;
const rows = 16;
const columns = 16;
let selectedColor = 0;

const grid = Array.from(Array(rows), () => new Array(columns).fill(1));

// Transform grid coordinates to pixel coordinates
const findGridLocation = (e, rect, canvas) => {
    // Calculate scaling factors
    const scaleX = canvas.offsetWidth / canvas.width;
    const scaleY = canvas.offsetHeight / canvas.height;

    // Adjust mouse coordinates by scaling factor
    const adjustedX = (e.clientX - rect.left) / scaleX;
    const adjustedY = (e.clientY - rect.top) / scaleY;

    // Calculate and return grid location
    return {
        column: Math.floor(adjustedX / pixelSize),
        row: Math.floor(adjustedY / pixelSize)
    };
};

const rePaintCanvas = (context) => {
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[row].length; column++) {
            colorPixel(column, row, grid[row][column], context);
        }
    }
}

const colorPixel = (column, row, color, context) => {
    context.fillStyle = colors[color];
    context.fillRect(column * pixelSize, row * pixelSize, pixelSize, pixelSize);
}

// Recursive flood fill. Let's see if this holds up.
const fill = (row, column) => {
    const colorToFill = grid[row][column];
    const recursiveFill = (row, column) => {
        if (row < 0 || row >= grid.length || column < 0 || column >= grid[row].length) {
            return;
        }
        if (grid[row][column] !== colorToFill) {
            return;
        }
        grid[row][column] = selectedColor;
        recursiveFill(row - 1, column);
        recursiveFill(row + 1, column);
        recursiveFill(row, column - 1);
        recursiveFill(row, column + 1);
    }
    recursiveFill(row, column);
}

const handleMouseDown = (context, canvas) => e => {
    const rect = canvas.getBoundingClientRect();
    const {row, column} = findGridLocation(e, rect, canvas);
    if (selectedBrush === "fill") {
        fill(row, column);
    } else {
        grid[row][column] = selectedColor;
    }
    rePaintCanvas(context);
};

const resetCanvas = context => _ => {
    // set all cells to color 1
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[row].length; column++) {
            grid[row][column] = 1;
        }
    }
    rePaintCanvas(context);
}

const setBrush = (brushType, canvas) => _ => {
    canvas.style.cursor = brushTypes[brushType];
    selectedBrush = brushType;
}

// sets the border of the selected color's selector button
const setColorBorder = () => colors.forEach((_, index) => {
    const button = document.getElementById("color-selector-" + index);
    button.style.border = (index === selectedColor) ? "2px solid black" : "";
})

const selectColor = colorNumber => _ => {
    selectedColor = colorNumber;
    setColorBorder();
}

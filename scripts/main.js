// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('game');
if (!canvas) {
    console.error("Error: Canvas element with ID 'game' not found!");
}
const ctx = canvas ? canvas.getContext('2d') : null;
if (!ctx) {
    console.error("Error: Could not get 2D rendering context for canvas!");
}

// Get the score display and restart button elements
const scoreDisplay = document.getElementById('score');
if (!scoreDisplay) {
    console.error("Error: Score display element with ID 'score' not found!");
}
const restartButton = document.getElementById('restartBtn');
if (!restartButton) {
    console.error("Error: Restart button element with ID 'restartBtn' not found!");
}

// Get D-pad button elements
const upBtn = document.getElementById('upBtn');
if (!upBtn) console.warn("Warning: D-pad Up button with ID 'upBtn' not found.");
const downBtn = document.getElementById('downBtn');
if (!downBtn) console.warn("Warning: D-pad Down button with ID 'downBtn' not found.");
const leftBtn = document.getElementById('leftBtn');
if (!leftBtn) console.warn("Warning: D-pad Left button with ID 'leftBtn' not found.");
const rightBtn = document.getElementById('rightBtn');
if (!rightBtn) console.warn("Warning: D-pad Right button with ID 'rightBtn' not found.");


// Define game variables
const gridSize = 20; // Size of each cell in pixels
let snake = []; // Initialize as empty, will be set in resetGame/DOMContentLoaded
let food = {}; // Object to store food's position
let score = 0;
let direction = 'right'; // Initial direction of the snake
let changingDirection = false; // Flag to prevent rapid direction changes in one game tick
let gameInterval; // Variable to hold the setInterval ID
let gameSpeed = 150; // Milliseconds per frame (lower is faster)
let gameOver = false; // Game state flag

// Function to draw a single snake part
function drawSnakePart(snakePart) {
    if (!ctx) return; // Ensure context exists before drawing
    ctx.fillStyle = 'lime'; // Color of the snake
    ctx.strokeStyle = 'darkgreen'; // Border color
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize); // Draw the square
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize); // Draw the border
}

// Function to draw the snake
function drawSnake() {
    snake.forEach(drawSnakePart); // Iterate over each snake part and draw it
}

// Function to draw the food
function drawFood() {
    if (!ctx) return; // Ensure context exists before drawing
    ctx.fillStyle = 'red'; // Color of the food
    ctx.strokeStyle = 'darkred'; // Border color
    ctx.fillRect(food.x, food.y, gridSize, gridSize); // Draw the square
    ctx.strokeRect(food.x, food.y, gridSize, gridSize); // Draw the border
}

// Function to generate random coordinates for food
function randomCoord(min, max) {
    // Generate a random number that is a multiple of gridSize
    return Math.round((Math.random() * (max - min) + min) / gridSize) * gridSize;
}

// Function to generate new food position
function generateFood() {
    let newFoodX, newFoodY;
    let foodOnSnake;

    // Ensure canvas is available before generating food coordinates
    if (!canvas) {
        console.error("Cannot generate food: Canvas element not found.");
        return;
    }

    do {
        // Generate random X and Y coordinates within the canvas boundaries
        newFoodX = randomCoord(0, canvas.width - gridSize);
        newFoodY = randomCoord(0, canvas.height - gridSize);

        // Check if the new food position overlaps with any part of the snake
        foodOnSnake = snake.some(part => part.x === newFoodX && part.y === newFoodY);
    } while (foodOnSnake); // Keep generating until food is not on the snake

    food = { x: newFoodX, y: newFoodY }; // Set the new food position
}

// Function to move the snake
function moveSnake() {
    if (gameOver) return; // Stop moving if game is over

    changingDirection = false; // Reset the flag after a move

    // Create a new head based on the current direction
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }

    // Add the new head to the beginning of the snake array
    snake.unshift(head);

    // Check if the snake ate the food
    const didEatFood = head.x === food.x && head.y === food.y;
    if (didEatFood) {
        score += 10; // Increase score
        if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`; // Update score display
        generateFood(); // Generate new food
        // No need to remove the tail, snake grows
    } else {
        snake.pop(); // Remove the tail if no food was eaten
    }
}

// Function to check for collisions (wall or self)
function checkCollision() {
    const head = snake[0];

    // Ensure canvas is available for collision detection
    if (!canvas) {
        gameOver = true; // Consider it game over if canvas is missing
        return;
    }

    // Check for collision with walls
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvas.width;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvas.height;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        gameOver = true;
        return;
    }

    // Check for collision with itself (start checking from the 4th segment to avoid immediate self-collision)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }
}

// Main game loop
function mainGameLoop() {
    // Add this log to confirm the loop is running
    // console.log("mainGameLoop running..."); // Uncomment for detailed debugging

    if (gameOver) {
        clearInterval(gameInterval); // Stop the game loop
        if (restartButton) restartButton.classList.remove('invisible'); // Show the restart button by removing 'invisible'
        return;
    }

    if (ctx && canvas) { // Ensure context and canvas exist before clearing
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    }
    drawFood(); // Draw food
    moveSnake(); // Move snake
    drawSnake(); // Draw snake
    checkCollision(); // Check for collisions
}

// Function to handle direction changes based on keyboard input or D-pad clicks
function changeDirection(inputDirection) {
    // Prevent multiple direction changes in a single game tick
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    // Handle keyboard input (event object) or D-pad input (string)
    let newDirection = '';
    if (typeof inputDirection === 'object' && inputDirection.keyCode) { // Keyboard event
        const keyPressed = inputDirection.keyCode;
        if (keyPressed === 37 && !goingRight) {
            newDirection = 'left';
        } else if (keyPressed === 38 && !goingDown) {
            newDirection = 'up';
        } else if (keyPressed === 39 && !goingLeft) {
            newDirection = 'right';
        } else if (keyPressed === 40 && !goingUp) {
            newDirection = 'down';
        }
    } else if (typeof inputDirection === 'string') { // D-pad click (string direction)
        if (inputDirection === 'left' && !goingRight) {
            newDirection = 'left';
        } else if (inputDirection === 'up' && !goingDown) {
            newDirection = 'up';
        } else if (inputDirection === 'right' && !goingLeft) {
            newDirection = 'right';
        } else if (inputDirection === 'down' && !goingUp) {
            newDirection = 'down';
        }
    }

    if (newDirection) {
        direction = newDirection;
    }
}

// Function to reset and start the game
function resetGame() {
    // Ensure essential elements are available before resetting
    if (!canvas || !ctx || !scoreDisplay || !restartButton) {
        console.error("Game cannot reset/start: Essential DOM elements are missing.");
        return;
    }

    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    score = 0;
    direction = 'right';
    changingDirection = false;
    gameOver = false;
    gameSpeed = 150; // Reset speed
    scoreDisplay.textContent = `Score: ${score}`;
    restartButton.classList.add('invisible'); // Hide the restart button using 'invisible'

    // Clear any existing game interval before starting a new one
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    generateFood(); // Generate initial food
    gameInterval = setInterval(mainGameLoop, gameSpeed); // Start the game loop
}

// Event listeners
document.addEventListener('keydown', changeDirection); // Keep keyboard controls for desktop
if (restartButton) { // Only add listener if button exists
    restartButton.addEventListener('click', resetGame);
}

// Add event listeners for D-pad buttons
// Check if buttons exist before adding listeners to avoid errors if HTML isn't fully loaded
if (upBtn) upBtn.addEventListener('click', () => changeDirection('up'));
if (downBtn) downBtn.addEventListener('click', () => changeDirection('down'));
if (leftBtn) leftBtn.addEventListener('click', () => changeDirection('left'));
if (rightBtn) rightBtn.addEventListener('click', () => changeDirection('right'));

// Initial call to start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Attempting to initialize game.");

    // Ensure essential elements are available before starting the game
    if (!canvas || !ctx || !scoreDisplay || !restartButton) {
        console.error("Game initialization failed: Essential DOM elements are missing.");
        return; // Stop if elements are not found
    }

    // Initialize game state directly for the first start
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];
    score = 0;
    direction = 'right';
    changingDirection = false;
    gameOver = false;
    gameSpeed = 150; // Initial speed

    scoreDisplay.textContent = `Score: ${score}`;
    restartButton.classList.add('invisible'); // Ensure restart button is hidden initially

    generateFood(); // Generate initial food
    gameInterval = setInterval(mainGameLoop, gameSpeed); // Start the game loop
    console.log("Game initialized and loop started.");
});

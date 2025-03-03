// Navigation
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'sudoku' && !localStorage.getItem('gamePlayed')) loadSudoku();
    if (sectionId === 'foodcatcher' && localStorage.getItem('gamePlayed')) {
        alert('You have already played a game for this order!');
        showSection('payment');
    }
    if (sectionId === 'payment') displayPaymentDetails();
}

// Cart Logic
let cart = [];
let total = 0;
let discount = 0;

function addToCart(item, price) {
    cart.push({ item, price });
    total += price;
    updateCart();
}

function updateCart() {
    const cartList = document.getElementById('cart');
    cartList.innerHTML = cart.map(i => `<li><span class="math-inline">\{i\.item\} \- ₹</span>{i.price}</li>`).join('');
    document.getElementById('total').textContent = total;
}

function placeOrder() {
    if (cart.length > 0) {
        alert('Order placed successfully! Now, play a game for discounts or skip to payment.');
        showSection('game-selection');
    } else {
        alert('Cart is empty! Please add items to place an order.');
    }
}

// Sudoku Logic
const initialPuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function loadSudoku() {
    if (localStorage.getItem('gamePlayed')) {
        alert('You have already played a game for this order!');
        showSection('payment');
        return;
    }
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('input');
            cell.className = 'sudoku-cell';
            cell.type = 'number';
            cell.min = 1;
            cell.max = 9;
            cell.value = initialPuzzle[i][j] || '';
            if (initialPuzzle[i][j]) cell.disabled = true;
            grid.appendChild(cell);
        }
    }
}

function checkSudoku() {
    const grid = document.getElementById('sudoku-grid').children;
    let solved = true;
    for (let i = 0; i < 81; i++) {
        if (!grid[i].value || grid[i].value < 1 || grid[i].value > 9) {
            solved = false;
            break;
        }
    }
    if (solved) {
        discount = 100;
        localStorage.setItem('gamePlayed', true);
        alert('Congratulations! You won ₹100 off!');
        total = Math.max(0, total - discount);
        updateCart();
        showSection('payment');
    } else {
        document.getElementById('sudoku-result').textContent = 'Incorrect or incomplete puzzle.';
    }
}

// Food Catcher Logic
let score = 0;
let gameActive = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const plate = { x: 180, y: 550, width: 40, height: 10 };
const foods = [];
const speed = 2;

function startGame() {
    if (localStorage.getItem('gamePlayed')) {
        alert('You have already played a game for this order!');
        showSection('payment');
        return;
    }
    score = 0;
    foods.length = 0;
    gameActive = true;
    document.getElementById('score').textContent = score;
    spawnFood();
    gameLoop();
}

function spawnFood() {
    const x = Math.random() * (canvas.width - 20);
    foods.push({ x, y: 0, type: Math.random() > 0.5 ? 'food' : 'bomb' });
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'blue';
    ctx.fillRect(plate.x, plate.y, plate.width, plate.height);

    for (let i = foods.length - 1; i >= 0; i--) {
        foods[i].y += speed;
        ctx.fillStyle = foods[i].type === 'food' ? 'green' : 'red';
        ctx.fillRect(foods[i].x, foods[i].y, 20, 20);

        if (
            foods[i].y + 20 > plate.y &&
            foods[i].x > plate.x - 20 &&
            foods[i].x < plate.x + plate.width
        ) {
            if (foods[i].type === 'food') score += 10;
            else gameActive = false;
            foods.splice(i, 1);
        } else if (foods[i].y > canvas.height) {
            foods.splice(i, 1);
        }
    }

    document.getElementById('score').textContent = score;
    if (Math.random() < 0.02) spawnFood();

    if (gameActive) requestAnimationFrame(gameLoop);
    else {
        let reward = 0;
        if (score >= 150) {
            reward = 10;
            discount = reward;
            total = Math.max(0, total - discount);
        }
        localStorage.setItem('gamePlayed', true);
        alert(`Game Over! Score: <span class="math-inline">\{score\}\. Discount\: ₹</span>{reward}`);
        updateCart();
        showSection('payment');
    }
}

canvas.addEventListener('mousemove', (e) => {
    plate.x = e.offsetX - plate.width / 2;
    if (plate.x < 0) plate.x = 0;
    if (plate.x > canvas.width - plate.width) plate.x = canvas.width - plate.width;
});

// Payment Logic
function displayPaymentDetails() {
    const paymentDetails = document.getElementById('payment-details');
    paymentDetails.innerHTML = `
        <h2>Order Summary</h2>
        <ul>${cart.map(i => `<li>${i.item} - ₹${i.price}</li>`).join('')}</ul>
        <p>Subtotal: ₹<span class="math-inline">\{total \+ discount\}</p\>
<p\>Discount Applied\: ₹</span>{discount}</p>
        <p><strong>Total: ₹${total}</strong></p>
    `;
}

function processPayment() {
    alert('Payment processed successfully! Thank you for your order.');
    cart = [];
    total = 0;
    discount = 0;
    localStorage.removeItem('gamePlayed');
    updateCart();
    showSection('feedback');
}

// Feedback Form Logic
function submitFeedback(event) {
    event.preventDefault();
    const rating = document.getElementById('rating').value;
    const comments = document.getElementById('comments').value;
    alert(`Thank you for your feedback!\nRating: ${rating}/5\nComments: ${comments}`);
    showSection('landing');
}

// Initial setup
showSection('landing');

// Rating slider update
const rangeInput = document.getElementById('rating');
const ratingValue = document.querySelector('.rating-value');
if (rangeInput && ratingValue) {
    rangeInput.addEventListener('input', function() {
        ratingValue.textContent = this.value;
    });
}
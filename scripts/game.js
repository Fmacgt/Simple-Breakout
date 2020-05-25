'strict mode'


let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");


// ball related
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
const ballSpeedCoeff = 0.5;
const ballSpeed = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) 
    * ballSpeedCoeff;
let dx = ballSpeed * 0.707;
let dy = ballSpeed * -0.707;

// paddle related
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 7;

// control related
let rightPressed = false;
let leftPressed = false;

// brick related
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];

// score related
let score = 0;

// give player some lives
let lives = 3;

let tPrev = 0;

/////////////////////////////////////////////////////////////////////////////////////

function setupBricks()
{
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBall()
{
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function updateSpeed(deltaX, deltaY)
{
    if (x + deltaX < ballRadius || x + deltaX > canvas.width - ballRadius) {
        dx = -dx;
    }

    if (y + deltaY < ballRadius) {
        dy = -dy;
    } else if ( y + deltaY > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            handleFailedToCatch();
        }
    }
}

function handleFailedToCatch()
{
    lives--;
    if (lives > 0) {
        // reset ball and paddle state
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = ballSpeed * 0.707;
        dy = ballSpeed * -0.707;
        paddleX = (canvas.width - paddleWidth) / 2;
    } else {
        alert("GAME OVER");
        document.location.reload();
    }
}

function drawPaddle()
{
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function checkAndMovePaddle()
{
    if (rightPressed) {
        paddleX += paddleSpeed;
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    } else if (leftPressed) {
        paddleX -= paddleSpeed;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }
}

function drawBricks()
{
    let bulkWidth = brickWidth + brickPadding;
    let bulkHeight = brickHeight + brickPadding;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = c * bulkWidth + brickOffsetLeft;
                let brickY = r * bulkHeight + brickOffsetTop;

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function clearedAllBricks()
{
    return score == brickRowCount * brickColumnCount;
}

function collisionDetection()
{
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth &&
                        y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;

                    score++;
                    if (clearedAllBricks()) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawScore()
{
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLives()
{
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function draw(tFrame)
{
    let dt = (tFrame - tPrev) / 1000;
    tPrev = tFrame;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    collisionDetection();

    let deltaX = dx * dt;
    let deltaY = dy * dt;
    updateSpeed(deltaX, deltaY);
    x += dx * dt;
    y += dy * dt;

    checkAndMovePaddle();


    requestAnimationFrame(draw);
}

//==============================================================================

function keyDownHandler(e)
{
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e)
{
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e)
{
    // looks like e.clientX is in the 'browse screen' space?
    let relativeX = e.clientX - canvas.offsetLeft;
    let halfPaddleWidth = paddleWidth / 2;
    if (relativeX > halfPaddleWidth && relativeX < canvas.width - halfPaddleWidth) {
        paddleX = relativeX - halfPaddleWidth;
    }
}

/////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

setupBricks();

draw(0);

document.addEventListener("DOMContentLoaded", function () {

    const gameCanvas = document.getElementById("gameCanvas");
    const ctx = gameCanvas.getContext("2d");

    const birdFrames = [
        new Image(),
        new Image(),
        new Image(),
        new Image(),  // Imagen cuando el pájaro es impactado
        new Image(),  // Imagen caida0.png
        new Image()   // Imagen caida.png cuando cae dado vuelta
    ];
    birdFrames[0].src = 'pichones/pajaro1.png'; // Alas juntas
    birdFrames[1].src = 'pichones/pajaro2.png'; // Alas semi abiertas
    birdFrames[2].src = 'pichones/pajaro3.png'; // Alas totalmente abiertas
    birdFrames[3].src = 'pichones/impactado.png'; // Imagen de impacto
    birdFrames[4].src = 'pichones/caida0.png'; // Imagen intermedia en la caída
    birdFrames[5].src = 'pichones/caida.png'; // Imagen dado vuelta al caer

    const crosshairImageNormal = new Image();
    const crosshairImageShoot = new Image();
    crosshairImageNormal.src = 'mira/normal.png'; // Ruta de la mira normal
    crosshairImageShoot.src = 'mira/disparo.png'; // Ruta de la mira al disparar

    let birds = [];
    let bullets = 20;
    let score = 0;
    let level = 1;

    // Tamaño del pájaro (utilizado para calcular el centro)
    const birdWidth = 80;
    const birdHeight = 70;

    // Tamaño de la mira
    const crosshairSize = 60;

    let frameIndex = 0;
    let frameCounter = 0;
    let mouseX = 0;
    let mouseY = 0;
    let currentCrosshairImage = crosshairImageNormal;
    let canSpawnNewBirds = true;

    document.getElementById("playButton").addEventListener("click", startGame);
    gameCanvas.addEventListener("mousemove", updateMousePosition);

    function startGame() {
        birds = [];
        bullets = 20;
        score = 0;
        level = 1;
        canSpawnNewBirds = true;
        frameIndex = 0;
        frameCounter = 0;
        currentCrosshairImage = crosshairImageNormal;
        updateLevel();

        document.getElementById("mainMenu").style.display = "none";
        gameCanvas.style.display = "block";
        spawnBirds();
        gameCanvas.addEventListener("click", shoot);
        gameLoop();
    }

    function updateMousePosition(event) {
        const rect = gameCanvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    }

    function spawnBirds() {
        const numberOfBirds = 5;
        for (let i = 0; i < numberOfBirds; i++) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const y = Math.random() * (gameCanvas.height - 50);

            const speedX = side === 'left' ? 1 : -1;
            const randomHeight = Math.random() * 0.35 * gameCanvas.height;
            const moveDirection = Math.random() < 0.5 ? 'up' : 'down';

            birds.push({
                x: side === 'left' ? 0 : gameCanvas.width,
                y: y,
                speedX: speedX,
                isHit: false,
                falling: false, // Controla si el pájaro ya está cayendo
                frameChangeTime: 0, // Tiempo para cambiar de imagen al caer
                moveDirection: moveDirection,
                randomHeight: randomHeight
            });
        }
    }

    function drawBirds() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        frameCounter++;

        if (frameCounter % 10 === 0) {
            frameIndex = (frameIndex + 1) % 3; // Solo rota entre las 3 primeras imágenes de vuelo
        }

        birds.forEach(bird => {
            if (!bird.isHit) {
                ctx.drawImage(birdFrames[frameIndex], bird.x, bird.y, birdWidth, birdHeight);
                bird.x += bird.speedX;

                if (bird.moveDirection === 'up') {
                    bird.y -= (bird.randomHeight / 100);
                    if (bird.y < 0) bird.moveDirection = 'down';
                } else {
                    bird.y += (bird.randomHeight / 100);
                    if (bird.y > gameCanvas.height) bird.moveDirection = 'up';
                }
            } else if (!bird.falling) {
                // Pájaro impactado, cambiar a la imagen de impacto (4ta imagen)
                ctx.clearRect(bird.x, bird.y, birdWidth, birdHeight); // Limpia el área antes de dibujar la nueva imagen
                ctx.drawImage(birdFrames[3], bird.x, bird.y, 60, 50); // Imagen de impacto, 15% más pequeña
                bird.frameChangeTime++; // Incrementa el contador para el cambio de imagen

                if (bird.frameChangeTime > 30) {
                    ctx.clearRect(bird.x, bird.y, 60, 50); // Limpia el área
                    ctx.drawImage(birdFrames[4], bird.x, bird.y, 50, 40); // Imagen caida0.png, otro 15% más pequeña
                }

                if (bird.frameChangeTime > 60) {
                    bird.falling = true; // Cambia a la 5ta imagen y comienza la caída
                }
            } else {
                // Pájaro en caída, usar la imagen dada vuelta (5ta imagen)
                bird.y += 1; // Caída lenta
                bird.speedX *= 0.5; // Reduce la velocidad horizontal
                ctx.clearRect(bird.x, bird.y, 50, 40); // Limpia el área
                ctx.drawImage(birdFrames[5], bird.x, bird.y, 50, 40); // Imagen caida.png, otro 15% más pequeña
            }
        });

        // Dibuja la mira con el tamaño de 60x60
        ctx.drawImage(currentCrosshairImage, mouseX - (crosshairSize / 2), mouseY - (crosshairSize / 2), crosshairSize, crosshairSize);
    }

    function updateBirds() {
        const birdsToRemove = [];

        birds.forEach((bird, index) => {
            if (bird.x < -50 || bird.x > gameCanvas.width || (bird.falling && bird.y > gameCanvas.height)) {
                birdsToRemove.push(index);
            }
        });

        birdsToRemove.reverse().forEach(index => birds.splice(index, 1));

        if (birds.length < 5 && canSpawnNewBirds) {
            canSpawnNewBirds = false;
            setTimeout(() => {
                canSpawnNewBirds = true;
            }, 500);
            spawnNewBird();
        }
    }

    function spawnNewBird() {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const y = Math.random() * (gameCanvas.height - 50);

        const speedX = side === 'left' ? 1 : -1;
        const randomHeight = Math.random() * 0.35 * gameCanvas.height;
        const moveDirection = Math.random() < 0.5 ? 'up' : 'down';

        birds.push({
            x: side === 'left' ? 0 : gameCanvas.width,
            y: y,
            speedX: speedX,
            isHit: false,
            falling: false,
            frameChangeTime: 0,
            moveDirection: moveDirection,
            randomHeight: randomHeight
        });
    }

    function shoot(event) {
        if (bullets <= 0) return;

        bullets--;
        currentCrosshairImage = crosshairImageShoot;

        setTimeout(() => {
            currentCrosshairImage = crosshairImageNormal;
        }, 200);

        // Cálculo del centro de la mira
        const miraCentroX = mouseX;
        const miraCentroY = mouseY;

        birds.forEach((bird, index) => {
            // Cálculo del centro del pájaro
            const pajaroCentroX = bird.x + (birdWidth / 2);
            const pajaroCentroY = bird.y + (birdHeight / 2);

            // Cálculo de la distancia entre el centro de la mira y el centro del pájaro
            const dist = Math.hypot(pajaroCentroX - miraCentroX, pajaroCentroY - miraCentroY);

            // Definir distancia límite basada en el nivel
            const distanciaLimite = level <= 3 ? 30 : 20;

            if (dist < distanciaLimite && !bird.isHit) {
                bird.isHit = true; // Marca el pájaro como impactado
                score += 10;
                bullets += 2;
                checkLevelUp();
            }
        });

        if (bullets === 0) {
            alert(`Te has quedado sin balas. Puntuación: ${score}`);
            resetGame();
        }
    }

    function gameLoop() {
        updateBirds();
        drawBirds();
        requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        birds = [];
        bullets = 20;
        score = 0;
        level = 1;
        document.getElementById("mainMenu").style.display = "flex";
        gameCanvas.style.display = "none";
    }

    function checkLevelUp() {
        const newLevel = Math.floor(score / 300) + 1;
        if (newLevel > level) {
            level = newLevel;
            bullets += 50;
            alert(`¡Subiste al nivel ${level}! GANASTE un pack de 50 balas extras.`);
            updateLevel();
        }
    }

    function updateLevel() {
        document.body.className = `level-${level}`;

        if (level >= 6) {
            increaseBirdSpeed(1.3);
        } else {
            resetBirdSpeed();
        }
    }

    function increaseBirdSpeed(factor) {
        birds.forEach(bird => {
            bird.speedX *= factor;
        });
    }

    function resetBirdSpeed() {
        birds.forEach(bird => {
            bird.speedX = bird.speedX > 0 ? 1 : -1;
        });
    }
});


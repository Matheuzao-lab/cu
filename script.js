// --- VARIÁVEIS DO JOGO E ELEMENTOS DO DOM ---
const gameBoard = document.getElementById('game-board');
const plane = document.getElementById('plane');
const scoreElement = document.getElementById('score');

// Configurações
let planeX = 50; // Posição X inicial do avião
let planeY = 200; // Posição Y inicial do avião
const planeSpeed = 10;
const shotSpeed = 15;
const towerSpeed = 2; // Velocidade que as torres se movem para a esquerda

let score = 0;
let isGameOver = false;

// --- FUNÇÕES DE LÓGICA DO JOGO ---

/**
 * Atualiza a posição do avião no HTML.
 */
function updatePlanePosition() {
    plane.style.left = planeX + 'px';
    plane.style.top = planeY + 'px';
}

/**
 * Move o avião e impede que ele saia da tela.
 */
function movePlane(direction) {
    if (isGameOver) return;

    const boardWidth = gameBoard.offsetWidth;
    const boardHeight = gameBoard.offsetHeight;
    const planeSize = 50; // Largura do emoji/div do avião

    switch (direction) {
        case 'up':
            planeY = Math.max(0, planeY - planeSpeed);
            break;
        case 'down':
            planeY = Math.min(boardHeight - planeSize, planeY + planeSpeed);
            break;
        case 'left':
            planeX = Math.max(0, planeX - planeSpeed);
            break;
        case 'right':
            planeX = Math.min(boardWidth - planeSize, planeX + planeSpeed);
            break;
    }
    updatePlanePosition();
}

/**
 * Cria e lança um tiro (projétil).
 */
function shoot() {
    if (isGameOver) return;
    
    // 1. Criar o elemento tiro
    const shot = document.createElement('div');
    shot.classList.add('shot');
    
    // 2. Definir a posição inicial (na frente do avião)
    shot.style.left = (planeX + 50) + 'px';
    shot.style.top = (planeY + 15) + 'px';
    
    gameBoard.appendChild(shot);
    
    // 3. Loop de movimento e colisão do tiro
    let shotMovement = setInterval(() => {
        let shotX = shot.offsetLeft + shotSpeed;
        shot.style.left = shotX + 'px';
        
        // Se o tiro sair da tela, removê-lo
        if (shotX > gameBoard.offsetWidth) {
            clearInterval(shotMovement);
            shot.remove();
        } else {
            checkCollision(shot, shotMovement);
        }
    }, 1000 / 60); // 60 FPS para movimento suave
}

/**
 * Gera uma nova torre na borda direita com altura aleatória.
 */
function generateTower() {
    const tower = document.createElement('div');
    tower.classList.add('tower');
    
    // Altura aleatória entre 80px e 200px
    const randomHeight = Math.floor(Math.random() * 120) + 80;
    
    tower.style.height = randomHeight + 'px';
    tower.style.left = gameBoard.offsetWidth + 'px'; // Começa fora da tela
    
    gameBoard.appendChild(tower);
}

/**
 * Move as torres e remove as que saírem da tela.
 */
function moveTowers() {
    const towers = document.querySelectorAll('.tower');
    towers.forEach(tower => {
        let towerX = tower.offsetLeft - towerSpeed;
        tower.style.left = towerX + 'px';
        
        // Se a torre sair da tela pela esquerda, remove e aumenta a pontuação
        if (towerX < -40) {
            tower.remove();
            score += 10;
            scoreElement.textContent = score;
        }
    });
}

/**
 * Verifica colisão do TIRO com a TORRE.
 * @param {HTMLElement} shotElement - O elemento do tiro.
 * @param {number} interval - ID do intervalo de movimento do tiro.
 */
function checkCollision(shotElement, interval) {
    const towers = document.querySelectorAll('.tower');
    const shotRect = shotElement.getBoundingClientRect(); 
    
    towers.forEach(tower => {
        // Ignora torres que já estão explodindo
        if (tower.classList.contains('explosion')) return; 

        const towerRect = tower.getBoundingClientRect(); 
        
        // Lógica de colisão
        if (
            shotRect.left < towerRect.right &&
            shotRect.right > towerRect.left &&
            shotRect.top < towerRect.bottom &&
            shotRect.bottom > towerRect.top
        ) {
            // Colisão Tiro vs Torre
            clearInterval(interval);
            shotElement.remove();
            
            // Efeito de explosão
            tower.classList.add('explosion');
            score += 50; // Pontos por destruir a torre
            scoreElement.textContent = score;

            // Remove a torre após a animação de explosão
            setTimeout(() => tower.remove(), 500);
        }
    });
}

/**
 * Verifica colisão do AVIÃO com a TORRE. (Fim de Jogo)
 */
function checkPlaneCollision() {
    const planeRect = plane.getBoundingClientRect();
    const towers = document.querySelectorAll('.tower');

    towers.forEach(tower => {
        if (tower.classList.contains('explosion')) return; 
        const towerRect = tower.getBoundingClientRect();

        if (
            planeRect.left < towerRect.right &&
            planeRect.right > towerRect.left &&
            planeRect.top < towerRect.bottom &&
            planeRect.bottom > towerRect.top
        ) {
            gameOver();
        }
    });
}

/**
 * Finaliza o jogo.
 */
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(towerGeneratorInterval);
    plane.textContent = '💥'; // Muda o emoji do avião para explosão
    alert(`FIM DE JOGO! Sua pontuação: ${score}. Pressione OK para reiniciar.`);
    window.location.reload(); // Recarrega a página para reiniciar
}


// --- LOOP PRINCIPAL DO JOGO ---

let gameLoopInterval;
let towerGeneratorInterval;

function gameLoop() {
    if (isGameOver) return;
    moveTowers();
    checkPlaneCollision();
}

function startGame() {
    // 1. Posicionar o avião na posição inicial
    updatePlanePosition();

    // 2. Iniciar o loop principal (60 FPS)
    gameLoopInterval = setInterval(gameLoop, 1000 / 60);

    // 3. Gerar torres a cada 3 segundos
    towerGeneratorInterval = setInterval(generateTower, 3000);
}


// --- EVENT LISTENERS (Controles) ---

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            movePlane('up');
            event.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
            movePlane('down');
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
            movePlane('left');
            event.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
            movePlane('right');
            event.preventDefault();
            break;
        case ' ': // Tecla de Espaço
            shoot();
            event.preventDefault();
            break;
    }
});

// Inicia o jogo quando a página carrega
startGame();
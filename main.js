// ========== GLOBAL VARIABLES ========== 
let scene, camera, renderer, starfield;
let keys = {};

// Ship and player management
let player; 
const shipData = [
    {
        name: 'STARFIRE',
        path: 'assets/models/spaceship/scene.gltf',
        correctionalRotation: new THREE.Euler(0, Math.PI, 0)
    },
    {
        name: 'BLUE NOVA',
        path: 'assets/models/spaceshipblue/scene.gltf',
        correctionalRotation: new THREE.Euler(0, 0, 0)
    }
];
let loadedShipModels = [];
let currentShipIndex = 0;

// Game objects
let asteroids = [], bullets = [], debris = [];
let shieldMesh, thruster;

// ========== GAME STATE ========== 
let gameState = 'loading';
let score = 0, health = 3;
let level = 1, levelProgress = 0;
let asteroidSpawnCounter = 0;
let shieldActive = false, shieldTimer = 0, shieldCooldown = 0;

// Camera positions
const menuCameraPos = new THREE.Vector3(0, 2, 12);
const gameCameraPos = new THREE.Vector3(0, 4, 10);

// ========== INITIALIZATION ========== 
function init() {
    setupEventListeners();
    initThree();
    loadAllShips();
    displayHighScore();
    animate();
}

function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.copy(menuCameraPos);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    createGalaxy();
}

function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', showShipSelection);
    document.getElementById('quitBtn').addEventListener('click', () => window.close());
    document.getElementById('prevShipBtn').addEventListener('click', () => changeShip(-1));
    document.getElementById('nextShipBtn').addEventListener('click', () => changeShip(1));
    document.getElementById('confirmShipBtn').addEventListener('click', confirmShipSelection);
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('quitToMenuBtn').addEventListener('click', quitToMenu);

    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code === "Escape" && gameState === 'playing') togglePause();
        if (e.code === "Space" && gameState === 'playing' && !keys['SpaceFired']) { shootBullet(); keys['SpaceFired'] = true; }
        if (e.code === "KeyS" && gameState === 'playing' && !shieldActive && shieldCooldown <= 0) activateShield();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; if (e.code === "Space") keys['SpaceFired'] = false; });
    window.addEventListener('resize', onWindowResize);
}

// ========== HIGH SCORE LOGIC ========== 
function displayHighScore() {
    const highScore = localStorage.getItem('spaceDodgerHighScore') || 0;
    document.getElementById('high-score-value').textContent = (highScore / 1000).toFixed(1);
}

function updateHighScore() {
    const highScore = localStorage.getItem('spaceDodgerHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('spaceDodgerHighScore', score);
        displayHighScore();
    }
}

// ========== SHIP & GAMEPLAY SETUP ========== 
function loadAllShips() {
    const loader = new THREE.GLTFLoader();
    let shipsLoaded = 0;
    const subtitle = document.querySelector('#menu .subtitle');
    subtitle.textContent = 'LOADING ASSETS...';

    shipData.forEach((shipInfo, index) => {
        loader.load(shipInfo.path, (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            model.rotation.copy(shipInfo.correctionalRotation);
            model.visible = false;
            loadedShipModels[index] = model;
            scene.add(model);
            shipsLoaded++;
            if (shipsLoaded === shipData.length) {
                gameState = 'menu';
                subtitle.textContent = 'A JOURNEY THROUGH THE COSMOS';
                player = loadedShipModels[currentShipIndex];
            }
        }, undefined, (error) => {
            console.error(`Failed to load ship: ${shipInfo.name}`, error);
            shipsLoaded++;
            if (shipsLoaded === shipData.length) { gameState = 'menu'; subtitle.textContent = 'ERROR: COULD NOT LOAD ASSETS'; }
        });
    });
}

function showShipSelection() {
    if (gameState !== 'menu') return;
    gameState = 'ship_selection';
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('ship-selection').classList.remove('hidden');
    updateShipSelectionUI();
}

function changeShip(direction) {
    if (!player) return;
    player.visible = false;
    currentShipIndex = (currentShipIndex + direction + loadedShipModels.length) % loadedShipModels.length;
    player = loadedShipModels[currentShipIndex];
    player.visible = true;
    updateShipSelectionUI();
}

function updateShipSelectionUI() {
    document.getElementById('ship-name').textContent = shipData[currentShipIndex].name;
}

function confirmShipSelection() {
    if (gameState !== 'ship_selection') return;
    gameState = 'transitioning';
    document.getElementById('ship-selection').classList.add('hidden');
    resetGameStats();
    createThruster();
}

function createThruster() {
    if (thruster && thruster.parent) thruster.parent.remove(thruster);
    const thrusterGeo = new THREE.ConeGeometry(0.15, 0.8, 16);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
    thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.position.set(0, 0, 0.8);
    thruster.rotation.set(Math.PI / 2, 0, 0);
    thruster.visible = false;
    player.add(thruster);
}

// ========== STATE TRANSITIONS & CLEANUP ========== 
function clearGameObjects() {
    asteroids.forEach(ast => scene.remove(ast));
    bullets.forEach(b => scene.remove(b));
    debris.forEach(d => scene.remove(d));
    asteroids = [];
    bullets = [];
    debris = [];
    if (thruster && thruster.parent) thruster.parent.remove(thruster);
    thruster = null;
    if (shieldMesh && shieldMesh.parent) shieldMesh.parent.remove(shieldMesh);
    shieldMesh = null;
}

function resetGameStats() {
    clearGameObjects();
    score = 0; health = 3;
    level = 1; levelProgress = 0;
    shieldActive = false; shieldTimer = 0; shieldCooldown = 0;
    if (player) {
        player.position.set(0, 0, 0);
        player.rotation.copy(shipData[currentShipIndex].correctionalRotation);
    }
    // No need to call updateHUD here, it's called when the 'playing' state begins.
}

function quitToMenu() {
    gameState = 'menu';
    clearGameObjects();
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('ship-selection').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

function gameOver() {
    gameState = 'gameover';
    updateHighScore();
    if(player) player.visible = false;
    
    setTimeout(() => {
        alert(`GAME OVER\nDistance: ${(score / 1000).toFixed(1)} km\nLevel Reached: ${level}`);
        quitToMenu();
    }, 500);
}

// ========== GAME MECHANICS ========== 
function createExplosion(position) {
    for (let i = 0; i < 10; i++) {
        const piece = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xaaaaaa, transparent: true })
        );
        piece.position.copy(position);
        piece.userData.velocity = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(0.3);
        piece.userData.lifespan = 40 + Math.random() * 30;
        scene.add(piece);
        debris.push(piece);
    }
}

function showBossWarning() {
    // Create subtle boss warning at top of screen
    const warning = document.createElement('div');
    warning.className = 'boss-warning-subtle';
    warning.innerHTML = `
        <div class="boss-warning-subtle-content">
            <span class="boss-warning-icon">⚠️</span>
            <span class="boss-warning-text">BOSS INCOMING</span>
            <span class="boss-warning-level">Level ${level}</span>
        </div>
    `;
    document.body.appendChild(warning);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (warning.parentNode) {
            warning.parentNode.removeChild(warning);
        }
    }, 4000);
}

function showLevelUp() {
    // Create subtle notification at top of screen
    const levelUp = document.createElement('div');
    levelUp.className = 'level-up-subtle';
    levelUp.innerHTML = `
        <div class="level-up-subtle-content">
            <span class="level-up-icon">🎉</span>
            <span class="level-up-text">LEVEL ${level}</span>
            <span class="level-up-bonus">+${(level * 0.05).toFixed(1)} Speed</span>
        </div>
    `;
    document.body.appendChild(levelUp);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (levelUp.parentNode) {
            levelUp.parentNode.removeChild(levelUp);
        }
    }, 3000);
}

// ========== LEVEL & DIFFICULTY SYSTEM ==========
function getCurrentLevel() {
    return Math.floor(score / 1000) + 1;
}

function getLevelProgress() {
    return (score % 1000) / 10; // Progress bar 0-100%
}

function getAsteroidSpeed() { 
    const baseSpeed = 0.5 + (level * 0.05); // Reduced base speed and level scaling
    const scoreBonus = Math.min(0.00005 * score, 0.15); // Reduced score bonus
    return baseSpeed + scoreBonus + Math.random() * 0.02; 
}

function getAsteroidSpawnInterval() { 
    const baseInterval = Math.max(8, 40 - (level * 1.5)); // Slower spawn rate increase
    const scoreReduction = Math.floor(score / 600); // Reduced spawn acceleration
    return Math.max(5, baseInterval - scoreReduction); 
}

function getAsteroidSize() {
    const sizeVariation = Math.random();
    if (level >= 5 && sizeVariation < 0.3) {
        return Math.random() * 0.3 + 0.3; // Small asteroids (fast, 1 hit)
    } else if (level >= 3 && sizeVariation < 0.6) {
        return Math.random() * 0.4 + 0.6; // Medium asteroids (normal, 2 hit)
    } else {
        return Math.random() * 0.5 + 0.8; // Large asteroids (slow, 3 hit)
    }
}

function getAsteroidHealth() {
    const size = getAsteroidSize();
    if (size < 0.6) return 1;      // Small = 1 hit
    else if (size < 1.0) return 2; // Medium = 2 hits
    else return 3;                  // Large = 3 hits
}

function shouldSpawnBoss() {
    return level % 5 === 0 && levelProgress >= 90; // Boss every 5 levels
}

function spawnAsteroid() {
    const lane = [-4, -2, 0, 2, 4][Math.floor(Math.random() * 5)];
    const size = getAsteroidSize();
    const health = getAsteroidHealth();
    
    // Different colors based on size/health
    let color = 0xaaaaaa; // Default gray
    if (health === 1) color = 0xff6666;      // Red for small (fast)
    else if (health === 2) color = 0xaaaaaa; // Gray for medium
    else color = 0x666666;                    // Dark gray for large
    
    const ast = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0), 
        new THREE.MeshStandardMaterial({ color: color, flatShading: true })
    );
    ast.position.set(lane, 0, -100);
    ast.userData = { 
        speed: getAsteroidSpeed(), 
        health: health,
        maxHealth: health,
        rotationSpeed: new THREE.Vector3(Math.random()*0.02-0.01, Math.random()*0.02-0.01, Math.random()*0.02-0.01) 
    };
    scene.add(ast);
    asteroids.push(ast);
}

function spawnBossAsteroid() {
    const bossSize = 2.5;
    const bossHealth = level * 2; // Health scales with level
    
    const boss = new THREE.Mesh(
        new THREE.DodecahedronGeometry(bossSize, 1), 
        new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            flatShading: true,
            emissive: 0x330000,
            emissiveIntensity: 0.3
        })
    );
    
    boss.position.set(0, 0, -100);
    boss.userData = { 
        speed: getAsteroidSpeed() * 0.5, // Boss moves slower
        health: bossHealth,
        maxHealth: bossHealth,
        isBoss: true,
        rotationSpeed: new THREE.Vector3(0.01, 0.01, 0.01)
    };
    
    // Add boss glow effect
    const glowGeometry = new THREE.SphereGeometry(bossSize + 0.3, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0.3 
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    boss.add(glow);
    
    scene.add(boss);
    asteroids.push(boss);
    
    // Show boss warning
    showBossWarning();
}

function shootBullet() {
    if (!player) return;
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    bullet.position.copy(player.position);
    bullet.position.z -= 1.5;
    bullet.userData = { speed: -0.8 };
    scene.add(bullet);
    bullets.push(bullet);
}

function activateShield() {
    if (shieldActive || shieldCooldown > 0) return;
    shieldActive = true; shieldTimer = 300;
    if (player && !shieldMesh) {
        shieldMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0x0088ff, transparent: true, opacity: 0.3, emissive: 0x0088ff, emissiveIntensity: 1, depthWrite: false }));
        player.add(shieldMesh);
    }
    updateHUD();
}

// ========== UPDATE LOGIC (called from animate) ========== 
function updateDebris() {
    for (let i = debris.length - 1; i >= 0; i--) {
        const piece = debris[i];
        piece.position.add(piece.userData.velocity);
        piece.userData.lifespan--;
        piece.material.opacity = piece.userData.lifespan / 60;

        if (piece.userData.lifespan <= 0) {
            scene.remove(piece);
            debris.splice(i, 1);
        }
    }
}

function updatePlayingState() {
    if (!player) return;
    if (keys['KeyA'] || keys['ArrowLeft']) player.position.x -= 0.2;
    if (keys['KeyD'] || keys['ArrowRight']) player.position.x += 0.2;
    player.position.x = Math.max(-5, Math.min(5, player.position.x));

    // Update level and progress
    const newLevel = getCurrentLevel();
    if (newLevel > level) {
        level = newLevel;
        showLevelUp();
    }
    levelProgress = getLevelProgress();
    
    // Spawn asteroids
    asteroidSpawnCounter++;
    if (asteroidSpawnCounter > getAsteroidSpawnInterval()) { 
        spawnAsteroid(); 
        asteroidSpawnCounter = 0; 
    }
    
    // Spawn boss if conditions are met
    if (shouldSpawnBoss() && asteroids.every(ast => !ast.userData.isBoss)) {
        spawnBossAsteroid();
    }
    
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const ast = asteroids[i];
        ast.position.z += ast.userData.speed;
        
        // Rotate asteroids
        ast.rotation.x += ast.userData.rotationSpeed.x;
        ast.rotation.y += ast.userData.rotationSpeed.y;
        ast.rotation.z += ast.userData.rotationSpeed.z;
        
        if (ast.position.z > 10) { scene.remove(ast); asteroids.splice(i, 1); continue; }
        
        // Different collision distance based on shield and asteroid size
        const baseCollisionDistance = ast.userData.isBoss ? 3.0 : 1.2;
        const collisionDistance = shieldActive ? baseCollisionDistance + 0.8 : baseCollisionDistance;
        
        if (player.position.distanceTo(ast.position) < collisionDistance) { 
            console.log('Collision detected! Distance:', player.position.distanceTo(ast.position), 'Shield active:', shieldActive);
            handleDamage(); 
            scene.remove(ast); 
            asteroids.splice(i, 1); 
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.z += b.userData.speed;
        if (b.position.z < -50) { scene.remove(b); bullets.splice(i, 1); continue; }
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (asteroids[j] && b.position.distanceTo(asteroids[j].position) < 1) {
                const asteroid = asteroids[j];
                asteroid.userData.health--;
                
                // Visual feedback for damage
                if (asteroid.userData.health < asteroid.userData.maxHealth) {
                    asteroid.material.emissive = new THREE.Color(0x333333);
                    asteroid.material.emissiveIntensity = 0.5;
                }
                
                if (asteroid.userData.health <= 0) {
                    // Boss gives more points
                    const points = asteroid.userData.isBoss ? level * 100 : 50;
                    score += points;
                    
                    createExplosion(asteroid.position);
                    scene.remove(asteroid); 
                    asteroids.splice(j, 1);
                }
                
                scene.remove(b); bullets.splice(i, 1);
                break;
            }
        }
    }

    if (shieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) { shieldActive = false; shieldCooldown = 600; if (player && shieldMesh) player.remove(shieldMesh); shieldMesh = null; }
    } else if (shieldCooldown > 0) { shieldCooldown--; }

    if (thruster) {
        thruster.visible = true;
        thruster.scale.y = 1 + Math.random() * 0.8;
        thruster.scale.x = thruster.scale.z = 1 + Math.random() * 0.5;
    }

    updateDebris();
    score++;
    updateHUD();
}

function handleDamage() { if (shieldActive) return; health--; updateHearts(); if (health <= 0) gameOver(); }

// ========== UI & CONTROLS ========== 
function updateHUD() {
    document.getElementById('distance').textContent = `${(score / 1000).toFixed(1)} km`;
    
    // Update level display
    const levelDisplay = document.getElementById('level');
    if (levelDisplay) {
        levelDisplay.textContent = `LEVEL ${level}`;
        levelDisplay.style.color = level >= 5 ? '#ff6600' : '#00ff88';
    }
    
    // Update level progress
    const progressDisplay = document.getElementById('level-progress');
    if (progressDisplay) {
        progressDisplay.textContent = `${Math.floor(levelProgress)}%`;
        progressDisplay.style.color = levelProgress >= 90 ? '#ff0000' : '#ffffff';
    }
    
    const shieldDisplay = document.getElementById('shield');
    if (shieldActive) { shieldDisplay.textContent = `ACTIVE: ${Math.ceil(shieldTimer / 60)}s`; shieldDisplay.style.color = '#00ccff'; }
    else if (shieldCooldown > 0) { shieldDisplay.textContent = `COOLDOWN: ${Math.ceil(shieldCooldown / 60)}s`; shieldDisplay.style.color = '#ff6600'; }
    else { shieldDisplay.textContent = 'READY'; shieldDisplay.style.color = '#00ff88'; }
    updateHearts();
}

function updateHearts() { document.getElementById('hearts').textContent = '❤️'.repeat(health); }
function togglePause() { gameState = (gameState === 'playing') ? 'paused' : 'playing'; document.getElementById('pauseMenu').classList.toggle('hidden'); if(thruster) thruster.visible = (gameState === 'playing'); }
function resumeGame() { gameState = 'playing'; document.getElementById('pauseMenu').classList.add('hidden'); if(thruster) thruster.visible = true; }
function onWindowResize() { if (!camera || !renderer) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }

function createGalaxy() {
    const positions = new Float32Array(15000 * 3);
    for (let i = 0; i < positions.length; i++) { positions[i] = (Math.random() - 0.5) * 4000; }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    starfield = new THREE.Points(geometry, material);
    scene.add(starfield);
}

// ========== MAIN ANIMATION LOOP ========== 
function animate() {
    requestAnimationFrame(animate);
    if (starfield) { starfield.rotation.y += 0.0001; starfield.rotation.x += 0.00005; }

    switch (gameState) {
        case 'menu':
            if (player && !player.visible) {
                currentShipIndex = 0;
                player = loadedShipModels[currentShipIndex];
                player.position.set(0,0,0);
                player.rotation.copy(shipData[currentShipIndex].correctionalRotation);
                player.visible = true;
            }
            if (player) { player.rotation.y += 0.005; }
            camera.position.lerp(menuCameraPos, 0.05);
            camera.lookAt(0,0,0);
            break;

        case 'ship_selection':
            if (player) { player.rotation.y += 0.005; }
            camera.position.lerp(menuCameraPos, 0.05);
            camera.lookAt(0,0,0);
            break;

        case 'transitioning':
            if(player) {
                const targetQuaternion = new THREE.Quaternion().setFromEuler(shipData[currentShipIndex].correctionalRotation);
                player.quaternion.slerp(targetQuaternion, 0.05);
            }
            camera.position.lerp(gameCameraPos, 0.05);
            camera.lookAt(0,0,0);
            if (camera.position.distanceTo(gameCameraPos) < 0.1) {
                gameState = 'playing';
                document.getElementById('hud').classList.remove('hidden');
                player.rotation.copy(shipData[currentShipIndex].correctionalRotation);
                updateHUD(); // Force HUD update when game starts
            }
            break;

        case 'playing':
            updatePlayingState();
            break;
    }

    renderer.render(scene, camera);
}

window.addEventListener('load', init);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF4A460);
scene.fog = new THREE.Fog(0xF4A460, 50, 200);

// Kamera mirip Subway Surfers
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, -12);
camera.lookAt(0, 1.5, 20);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0xF4A460, 1);
document.body.appendChild(renderer.domElement);

// Cahaya
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 15, -10);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
scene.add(light);

// Player (running person)
function createRunningPerson() {
    const personGroup = new THREE.Group();
    
    // Body (torso)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2196F3,
        emissive: 0x0a3d6b,
        shininess: 50
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    personGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFE0B2,
        emissive: 0x4d3d2a,
        shininess: 30
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    personGroup.add(head);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFE0B2,
        emissive: 0x4d3d2a,
        shininess: 30
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.4, 0.8, 0);
    leftArm.castShadow = true;
    personGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.4, 0.8, 0);
    rightArm.castShadow = true;
    personGroup.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x424242,
        emissive: 0x1a1a1a,
        shininess: 20
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, 0, 0);
    leftLeg.castShadow = true;
    personGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, 0, 0);
    rightLeg.castShadow = true;
    personGroup.add(rightLeg);
    
    return personGroup;
}

// Horse model
function createHorse() {
    const horseGroup = new THREE.Group();
    
    // Horse body
    const bodyGeometry = new THREE.CapsuleGeometry(0.8, 2, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.0
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    horseGroup.add(body);
    
    // Horse head
    const headGeometry = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.8, 1.2);
    head.rotation.x = -0.3;
    head.castShadow = true;
    horseGroup.add(head);
    
    // Horse legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.9,
        metalness: 0.0
    });
    
    const legPositions = [
        [-0.6, 0.6, -0.8], // Front left
        [0.6, 0.6, -0.8],  // Front right
        [-0.6, 0.6, 0.8],  // Back left
        [0.6, 0.6, 0.8]    // Back right
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        horseGroup.add(leg);
    });
    
    // Horse tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1, 6);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 1.5, -1.2);
    tail.rotation.x = 0.3;
    tail.castShadow = true;
    horseGroup.add(tail);
    
    return horseGroup;
}

const player = createRunningPerson();
player.position.set(0, 0, 0);
scene.add(player);

// Add ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Texas desert environment
function createDesertEnvironment() {
    // Desert ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xD2B48C,
        roughness: 0.9,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Cactus plants
    for (let i = 0; i < 20; i++) {
        createCactus();
    }
    
    // Desert rocks
    for (let i = 0; i < 15; i++) {
        createDesertRock();
    }
    
    // Texas windmills
    for (let i = 0; i < 5; i++) {
        createWindmill();
    }
}

function createCactus() {
    const cactusGroup = new THREE.Group();
    
    // Main cactus body
    const cactusGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const cactusMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 0.8,
        metalness: 0.0
    });
    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.castShadow = true;
    cactusGroup.add(cactus);
    
    // Cactus arms
    for (let i = 0; i < 3; i++) {
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 6);
        const arm = new THREE.Mesh(armGeometry, cactusMaterial);
        arm.position.set(
            (Math.random() - 0.5) * 0.8,
            0.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 0.8
        );
        arm.rotation.z = Math.random() * Math.PI;
        arm.castShadow = true;
        cactusGroup.add(arm);
    }
    
    // Position cactus randomly
    cactusGroup.position.set(
        (Math.random() - 0.5) * 100,
        1,
        (Math.random() - 0.5) * 100
    );
    
    scene.add(cactusGroup);
}

function createDesertRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B7355,
        roughness: 0.9,
        metalness: 0.0
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(
        (Math.random() - 0.5) * 80,
        0.25,
        (Math.random() - 0.5) * 80
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
}

function createWindmill() {
    const windmillGroup = new THREE.Group();
    
    // Windmill base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.8, 3, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.0
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 1.5;
    base.castShadow = true;
    windmillGroup.add(base);
    
    // Windmill blades
    const bladeGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
    const bladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 0.7,
        metalness: 0.2
    });
    
    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 3;
        blade.rotation.y = (i * Math.PI) / 2;
        blade.castShadow = true;
        windmillGroup.add(blade);
    }
    
    // Position windmill
    windmillGroup.position.set(
        (Math.random() - 0.5) * 60,
        0,
        (Math.random() - 0.5) * 60
    );
    
    scene.add(windmillGroup);
}

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameover'
let difficulty = 3; // 3, 5, atau 10 jalur
let laneX = [-3, 0, 3]; // akan diupdate berdasarkan difficulty
let playerLane = 1; // index: 0=kiri,1=tengah,2=kanan (akan diupdate)
let baseSpeed = 15;
let currentSpeed = baseSpeed;
let obstacleSpawnInterval = 1000;
let obstacleSpawnTimer = 0;

// Horse power-up system
let isOnHorse = false;
let horsePoints = 0;
let horsePointsNeeded = 50; // Points needed to get horse
let lives = 1; // Player lives (horse gives extra life)
let horseSpeed = 25; // Horse speed multiplier

// Fungsi untuk mengupdate jalur berdasarkan kesulitan
function updateLanes() {
    const laneCount = difficulty;
    const laneWidth = 18 / (laneCount - 1); // Total width 18 units
    laneX = [];
    
    for (let i = 0; i < laneCount; i++) {
        laneX.push(-9 + i * laneWidth);
    }
    
    // Set player ke jalur tengah
    playerLane = Math.floor(laneCount / 2);
    player.position.x = laneX[playerLane];
    player.position.y = 0;
    
    // Update kecepatan (berbanding terbalik dengan jumlah jalur)
    currentSpeed = baseSpeed * (10 / laneCount);
}

// Jalan (dibagi beberapa segmen agar terlihat bergerak)
const roadSegments = [];
const segmentLength = 10;

function createRoad() {
    // Clear existing road
    roadSegments.forEach(seg => scene.remove(seg));
    roadSegments.length = 0;
    
    for (let i = 0; i < 10; i++) {
        const road = new THREE.Mesh(
            new THREE.BoxGeometry(18, 0.1, segmentLength),
            new THREE.MeshStandardMaterial({ 
                color: 0xD2B48C,
                roughness: 0.9,
                metalness: 0.0,
                emissive: 0x2d1504
            })
        );
        road.position.z = i * segmentLength;
        road.receiveShadow = true;
        scene.add(road);
        roadSegments.push(road);

        // Garis pembatas jalan (sesuai jumlah jalur)
        for (let j = 1; j < difficulty; j++) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.1, segmentLength),
                new THREE.MeshStandardMaterial({ 
                    color: 0x654321,
                    emissive: 0x1a1a1a,
                    shininess: 10,
                    roughness: 0.8
                })
            );
            const lineX = -9 + j * (18 / (difficulty - 1));
            line.position.set(lineX, 0.06, i * segmentLength);
            scene.add(line);
        }
    }
}

// Rintangan (batu)
function createRock() {
    const rockGroup = new THREE.Group();
    
    // Random rock size (small, medium, large)
    const sizeOptions = [0.6, 0.8, 1.0, 1.2];
    const rockSize = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
    
    // Main rock body
    const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
    
    // Variasi warna batu
    const rockColors = [0x8B4513, 0x654321, 0xA0522D, 0xCD853F, 0xD2691E];
    const rockColor = rockColors[Math.floor(Math.random() * rockColors.length)];
    
    const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: rockColor,
        emissive: 0x2d1504,
        shininess: 10,
        roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    // Add glow effect for larger rocks
    if (rockSize >= 1.0) {
        rock.material.emissive.setHex(0x4d2d1a);
        // Add outline for larger rocks
        rock.material.transparent = true;
        rock.material.opacity = 0.9;
    }
    
    rockGroup.add(rock);
    
    // Smaller rocks for detail (jumlah bervariasi berdasarkan ukuran)
    const detailCount = Math.floor(Math.random() * 4) + 2; // 2-5 detail rocks
    for (let i = 0; i < detailCount; i++) {
        const smallRockGeometry = new THREE.DodecahedronGeometry(0.1 + Math.random() * 0.3, 0);
        const smallRock = new THREE.Mesh(smallRockGeometry, rockMaterial);
        smallRock.position.set(
            (Math.random() - 0.5) * rockSize * 1.5,
            (Math.random() - 0.5) * rockSize * 0.5,
            (Math.random() - 0.5) * rockSize * 1.5
        );
        smallRock.castShadow = true;
        rockGroup.add(smallRock);
    }
    
    // Store rock size for collision detection
    rockGroup.userData = { size: rockSize };
    
    // Add visual indicator for rock size
    if (rockSize <= 0.7) {
        // Small rocks get a subtle glow
        rock.material.emissive.setHex(0x1a0f0a);
    } else if (rockSize >= 1.1) {
        // Large rocks get more prominent glow
        rock.material.emissive.setHex(0x5d3a1a);
    }
    
    return rockGroup;
}

// Spawn horse power-up
function spawnHorsePowerUp() {
    const laneCount = difficulty;
    const randomLane = Math.floor(Math.random() * laneCount);
    
    const powerUp = createHorsePowerUp();
    powerUp.position.set(laneX[randomLane], 1.5, player.position.z + 80);
    scene.add(powerUp);
    powerUps.push(powerUp);
}

let obstacles = [];

// Horse power-up
function createHorsePowerUp() {
    const powerUpGroup = new THREE.Group();
    
    // Horse icon
    const horseIconGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const horseIconMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        emissive: 0x4d4d00,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const horseIcon = new THREE.Mesh(horseIconGeometry, horseIconMaterial);
    horseIcon.castShadow = true;
    powerUpGroup.add(horseIcon);
    
    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const glowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        emissive: 0xFFD700,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    powerUpGroup.add(glow);
    
    // Store power-up type
    powerUpGroup.userData = { type: 'horse' };
    
    return powerUpGroup;
}

let powerUps = [];

function spawnObstacle() {
    const laneCount = difficulty;
    
    // Tentukan jumlah rintangan berdasarkan kesulitan dan jarak (lebih mudah)
    let maxObstacles = Math.min(laneCount - 1, 2); // Maksimal 2 rintangan (lebih mudah)
    let obstacleCount = Math.floor(Math.random() * maxObstacles) + 1;
    
    // Jika jarak jauh, tingkatkan kemungkinan lebih banyak rintangan (lebih lambat)
    if (distance > 200) {
        obstacleCount = Math.min(obstacleCount + 1, maxObstacles);
    }
    if (distance > 400) {
        obstacleCount = Math.min(obstacleCount + 1, maxObstacles);
    }
    
    // Buat array jalur yang tersedia
    let availableLanes = [];
    for (let i = 0; i < laneCount; i++) {
        availableLanes.push(i);
    }
    
    // Pilih jalur acak untuk rintangan
    const obstacleLanes = [];
    for (let i = 0; i < obstacleCount; i++) {
        if (availableLanes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableLanes.length);
            obstacleLanes.push(availableLanes[randomIndex]);
            availableLanes.splice(randomIndex, 1);
        }
    }
    
    // Buat rintangan di jalur yang dipilih
    obstacleLanes.forEach(laneIndex => {
        const obs = createRock();
        const rockSize = obs.userData.size || 0.8;
        const yPosition = rockSize * 0.3 + Math.random() * 0.2; // Variasi posisi Y
        obs.position.set(laneX[laneIndex], yPosition, player.position.z + 80); // Jarak lebih jauh
        scene.add(obs);
        obstacles.push(obs);
    });
    
    // Random chance to spawn horse power-up
    if (Math.random() < 0.1) { // 10% chance
        spawnHorsePowerUp();
    }
}

// UI untuk menu kesulitan
function createDifficultyMenu() {
    const menuDiv = document.createElement('div');
    menuDiv.id = 'difficulty-menu';
    menuDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #F4A460 0%, #DEB887 50%, #D2B48C 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: #333;
        border: 2px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    `;
    
    contentDiv.innerHTML = `
        <h1 style="margin: 0 0 30px 0; font-size: 36px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); color: #8B4513;">🤠 TEXAS RODEO RUNNER</h1>
        <h2 style="margin: 0 0 30px 0; font-size: 24px; color: #F57C00;">Pilih Kesulitan</h2>
        
        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
            <button onclick="selectDifficulty(3)" style="
                padding: 20px 40px; 
                font-size: 20px; 
                background: linear-gradient(45deg, #FF6B35, #F7931E); 
                color: white; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
                font-weight: bold;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🚀 3 Jalur (Cepat)
            </button>
            
            <button onclick="selectDifficulty(5)" style="
                padding: 20px 40px; 
                font-size: 20px; 
                background: linear-gradient(45deg, #4CAF50, #2E7D32); 
                color: white; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
                font-weight: bold;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ⚡ 5 Jalur (Sedang)
            </button>
            
            <button onclick="selectDifficulty(10)" style="
                padding: 20px 40px; 
                font-size: 20px; 
                background: linear-gradient(45deg, #2196F3, #1976D2); 
                color: white; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
                font-weight: bold;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🐌 10 Jalur (Lambat)
            </button>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.05); padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #2E7D32;">🎮 Kontrol</h3>
            <p style="margin: 5px 0; font-size: 16px;">A/D atau Arrow Keys untuk bergerak</p>
            <p style="margin: 5px 0; font-size: 16px;">Semakin sedikit jalur, semakin cepat permainan!</p>
            <p style="margin: 5px 0; font-size: 16px;">🐎 Kumpulkan poin kuda untuk naik kuda</p>
            <p style="margin: 5px 0; font-size: 16px;">🏇 Naik kuda = kecepatan + nyawa ekstra</p>
            <p style="margin: 5px 0; font-size: 16px;">💀 Tabrak batu saat naik kuda = kuda mati, player selamat</p>
        </div>
    `;
    
    menuDiv.appendChild(contentDiv);
    document.body.appendChild(menuDiv);
}

function showGameOver() {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'game-over';
    gameOverDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        background: linear-gradient(135deg, #FF6B35, #F7931E);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    contentDiv.innerHTML = `
        <h1 style="margin: 0 0 20px 0; font-size: 48px;">💀 GAME OVER</h1>
        <h2 style="margin: 0 0 30px 0; font-size: 32px; color: #FFD700;">Jarak: ${Math.floor(distance)}m</h2>
        <h3 style="margin: 0 0 20px 0; font-size: 24px; color: #FFD700;">🐎 Poin Kuda: ${horsePoints}</h3>
        <button onclick="window.location.reload()" style="
            padding: 15px 30px; 
            font-size: 18px; 
            background: linear-gradient(45deg, #2E7D32, #1B5E20); 
            color: white; 
            border: none; 
            border-radius: 10px; 
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            🔄 Main Lagi
        </button>
    `;
    
    gameOverDiv.appendChild(contentDiv);
    document.body.appendChild(gameOverDiv);
}

// Make selectDifficulty globally available
window.selectDifficulty = function(lanes) {
    difficulty = lanes;
    updateLanes();
    createRoad();
    
    // Remove menu
    const menu = document.getElementById('difficulty-menu');
    if (menu) menu.remove();
    
    // Start game
    gameState = 'playing';
    startGame();
};

function startGame() {
    // Reset game state
    distance = 0;
    distanceEl.textContent = "0m";
    obstacleSpawnTimer = 0;
    obstacleSpawnInterval = 1200; // Lebih lama dari sebelumnya
    
    // Reset horse system
    isOnHorse = false;
    horsePoints = 0;
    lives = 1;
    
    // Clear obstacles and power-ups
    obstacles.forEach(obs => scene.remove(obs));
    obstacles = [];
    powerUps.forEach(powerUp => scene.remove(powerUp));
    powerUps = [];
    
    // Reset player position
    player.position.set(0, 0, 0);
    playerLane = Math.floor(difficulty / 2);
    player.position.x = laneX[playerLane];
    
    // Reset player rotation
    player.rotation.set(0, 0, 0);
    if (player.children.length >= 6) {
        player.children[2].rotation.set(0, 0, 0); // Left arm
        player.children[3].rotation.set(0, 0, 0); // Right arm
        player.children[4].rotation.set(0, 0, 0); // Left leg
        player.children[5].rotation.set(0, 0, 0); // Right leg
    }
    
            // Update game info
        const actualSpeed = isOnHorse ? currentSpeed * (horseSpeed / 10) : currentSpeed;
        gameInfoEl.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #2E7D32; text-shadow: 0 0 5px #4CAF50;">JALUR: ${difficulty}</div>
            <div style="margin-bottom: 5px; color: #F57C00;">Kecepatan: ${actualSpeed.toFixed(1)} m/s</div>
            <div style="margin-bottom: 5px; color: #1976D2;">Posisi: ${playerLane + 1}/${difficulty}</div>
            <div style="margin-bottom: 5px; color: #8B4513; font-size: 12px;">Batu: Ukuran Bervariasi</div>
            <div style="margin-bottom: 5px; color: #FFD700; font-size: 12px;">🐎 Kuda: ${horsePoints}/${horsePointsNeeded}</div>
            <div style="margin-bottom: 5px; color: #FF6B35; font-size: 12px;">❤️ Nyawa: ${lives}</div>
            <div style="color: ${isOnHorse ? '#4CAF50' : '#999'}; font-size: 12px;">${isOnHorse ? '🏇 Naik Kuda' : '🏃 Berlari'}</div>
        `;
    
    // Start obstacle spawning
    spawnObstacle();
}

// Input
window.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        playerLane = Math.max(0, playerLane - 1);
    }
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        playerLane = Math.min(difficulty - 1, playerLane + 1);
    }
    
    // Prevent default behavior for arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
    }
});

// Distance and game info
let distance = 0;
const distanceEl = document.getElementById('score');

// Create game info display
const gameInfoEl = document.createElement('div');
gameInfoEl.id = 'game-info';
gameInfoEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    z-index: 100;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
`;
document.body.appendChild(gameInfoEl);

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();
    
    if (gameState === 'playing') {
        // Player maju otomatis
        const actualSpeed = isOnHorse ? currentSpeed * (horseSpeed / 10) : currentSpeed;
        player.position.z += actualSpeed * delta;
        player.position.x = laneX[playerLane];
        
        // Running animation
        const time = Date.now() * 0.01;
        if (isOnHorse) {
            // Horse riding animation
            player.position.y = 1.5 + Math.sin(time * 3) * 0.1;
            
            // Horse riding animation for arms and legs
            if (player.children.length >= 6) {
                // Hold reins animation
                player.children[2].rotation.x = -0.3; // Left arm holding reins
                player.children[3].rotation.x = -0.3; // Right arm holding reins
                // Legs in stirrups
                player.children[4].rotation.x = 0.2;
                player.children[5].rotation.x = 0.2;
            }
        } else {
            // Normal running animation
            player.position.y = Math.sin(time * 2) * 0.1;
            
            // Animate arms and legs for running effect
            if (player.children.length >= 6) {
                // Left arm swing
                player.children[2].rotation.x = Math.sin(time * 4) * 0.5;
                // Right arm swing (opposite)
                player.children[3].rotation.x = -Math.sin(time * 4) * 0.5;
                // Left leg swing
                player.children[4].rotation.x = Math.sin(time * 4) * 0.3;
                // Right leg swing (opposite)
                player.children[5].rotation.x = -Math.sin(time * 4) * 0.3;
            }
        }
        
        // Add running dust effect
        if (Math.floor(time * 10) % 2 === 0) {
            createDustEffect(player.position.x, player.position.z);
        }
        
        // Update distance
        distance += currentSpeed * delta;
        const distanceText = Math.floor(distance) + "m";
        distanceEl.textContent = distanceText;
        
        // Add distance animation
        if (Math.floor(distance) % 10 === 0 && Math.floor(distance) > 0) {
            distanceEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                distanceEl.style.transform = 'scale(1)';
            }, 200);
        }

            // Update game info
    gameInfoEl.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #2E7D32; text-shadow: 0 0 5px #4CAF50;">JALUR: ${difficulty}</div>
        <div style="margin-bottom: 5px; color: #F57C00;">Kecepatan: ${currentSpeed.toFixed(1)} m/s</div>
        <div style="margin-bottom: 5px; color: #1976D2;">Posisi: ${playerLane + 1}/${difficulty}</div>
        <div style="margin-bottom: 5px; color: #8B4513; font-size: 12px;">Batu: Ukuran Bervariasi</div>
        <div style="margin-bottom: 5px; color: #FFD700; font-size: 12px;">🐎 Kuda: ${horsePoints}/${horsePointsNeeded}</div>
        <div style="margin-bottom: 5px; color: #FF6B35; font-size: 12px;">❤️ Nyawa: ${lives}</div>
        <div style="color: #999; font-size: 12px;">🏃 Berlari</div>
    `;

        // Kamera follow
        camera.position.z = player.position.z - 12;
        camera.lookAt(player.position.x, player.position.y + 1.5, player.position.z + 20);
        
        // Animate particles
        if (particleSystem) {
            particleSystem.position.z = player.position.z;
        }

        // Road scroll
        roadSegments.forEach((seg, index) => {
            if (seg.position.z + segmentLength < player.position.z - 10) {
                seg.position.z += segmentLength * roadSegments.length;
            }
        });

        // Obstacle spawning dengan interval yang semakin cepat
        obstacleSpawnTimer += delta * 1000;
        if (obstacleSpawnTimer >= obstacleSpawnInterval) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
            
            // Increase spawn rate based on distance and difficulty (more forgiving)
            const baseInterval = 1200; // Lebih lama dari sebelumnya
            const minInterval = 200; // Minimum interval lebih lama
            const distanceMultiplier = 1; // Lebih lambat dari sebelumnya
            obstacleSpawnInterval = Math.max(minInterval, baseInterval - (distance * distanceMultiplier));
        }

        // Power-ups
        powerUps.forEach((powerUp, index) => {
            if (powerUp.position.z < player.position.z - 5) {
                scene.remove(powerUp);
                powerUps.splice(index, 1);
            } else {
                // Check collision with power-up
                const distanceX = Math.abs(player.position.x - powerUp.position.x);
                const distanceZ = Math.abs(player.position.z - powerUp.position.z);
                
                if (distanceX < 0.8 && distanceZ < 0.8) {
                    if (powerUp.userData.type === 'horse') {
                        // Collect horse power-up
                        horsePoints += 10;
                        if (horsePoints >= horsePointsNeeded && !isOnHorse) {
                            isOnHorse = true;
                            lives = 2; // Extra life when on horse
                            horsePoints = 0; // Reset points
                        }
                    }
                    scene.remove(powerUp);
                    powerUps.splice(index, 1);
                }
            }
        });
        
        // Rintangan
        obstacles.forEach((obs, index) => {
            if (obs.position.z < player.position.z - 5) {
                scene.remove(obs);
                obstacles.splice(index, 1);
            } else {
                // Improved collision detection for person vs rock (based on rock size)
                const distanceX = Math.abs(player.position.x - obs.position.x);
                const distanceZ = Math.abs(player.position.z - obs.position.z);
                const rockSize = obs.userData.size || 0.8;
                const collisionRadius = rockSize * 0.7; // Slightly smaller collision radius for easier gameplay
                
                if (distanceX < collisionRadius && distanceZ < collisionRadius) {
                    if (isOnHorse) {
                        // Horse dies, player survives
                        isOnHorse = false;
                        lives = 1;
                        scene.remove(obs);
                        obstacles.splice(index, 1);
                        // Show horse death effect
                        showHorseDeathEffect(obs.position.x, obs.position.z);
                    } else {
                        // Player dies
                        lives--;
                        if (lives <= 0) {
                            gameState = 'gameover';
                            showGameOver();
                        } else {
                            // Player survives with remaining life
                            scene.remove(obs);
                            obstacles.splice(index, 1);
                        }
                    }
                }
            }
        });
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Dust effect for running
function createDustEffect(x, z) {
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 5;
    const positions = new Float32Array(dustCount * 3);
    
    for (let i = 0; i < dustCount * 3; i += 3) {
        positions[i] = x + (Math.random() - 0.5) * 0.5; // x
        positions[i + 1] = 0.1 + Math.random() * 0.2; // y
        positions[i + 2] = z + (Math.random() - 0.5) * 0.5; // z
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
        color: 0x8B7355,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);
    
    // Remove dust after animation
    setTimeout(() => {
        scene.remove(dust);
    }, 1000);
}

// Horse death effect
function showHorseDeathEffect(x, z) {
    // Create explosion effect
    const explosionGeometry = new THREE.BufferGeometry();
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = x + (Math.random() - 0.5) * 2; // x
        positions[i + 1] = 1 + Math.random() * 2; // y
        positions[i + 2] = z + (Math.random() - 0.5) * 2; // z
    }
    
    explosionGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const explosionMaterial = new THREE.PointsMaterial({
        color: 0xFF4500,
        size: 0.2,
        transparent: true,
        opacity: 1
    });
    
    const explosion = new THREE.Points(explosionGeometry, explosionMaterial);
    explosion.position.set(x, 0, z);
    scene.add(explosion);
    
    // Remove explosion after animation
    setTimeout(() => {
        scene.remove(explosion);
    }, 2000);
}

// Particle system for background effect
function createParticles() {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100; // x
        positions[i + 1] = Math.random() * 50; // y
        positions[i + 2] = (Math.random() - 0.5) * 200; // z
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    return particleSystem;
}

// Initialize game
updateLanes();
createRoad();
createDesertEnvironment();
const particleSystem = createParticles();
createDifficultyMenu();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== GAME STATE ==========
let scene, camera, renderer;
let player, asteroids = [], bullets = [];
let score = 0, health = 3;
let inGame = false, paused = false;
let asteroidSpawnInterval = 0;
let keys = {};
let starfield;
let shieldActive = false, shieldTimer = 0;
let shieldCooldown = 0;
let mixer;
let playerBoundingBox = null;
let playerModelLoaded = false;
let shieldMesh = null;

// ========== INITIALIZATION ==========
function init() {
    setupEventListeners();
    // Tampilkan menu, jangan langsung skip
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('transition').style.opacity = 0;
}

function setupEventListeners() {
    // Menu buttons aktif
    document.getElementById('startBtn').addEventListener('click', () => {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        startGame();
    });
    document.getElementById('quitBtn').addEventListener('click', () => window.close());
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('quitToMenuBtn').addEventListener('click', quitToMenu);

    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code === "KeyS" && inGame && !paused && !shieldActive && shieldCooldown <= 0) {
            activateShield();
        }
        if (e.code === "Escape" && inGame) togglePause();
    });

    window.addEventListener('keyup', e => keys[e.code] = false);
    window.addEventListener('mousedown', e => {
        if (e.button === 0 && inGame && !paused) shootBullet();
    });
    window.addEventListener('resize', onWindowResize);
}

function startGame() {
    document.getElementById('transition').style.opacity = 1;
    setTimeout(() => {
        document.getElementById('transition').style.opacity = 0;
        resetGame();
        initThree();
        animate();
    }, 800);
}

function resetGame() {
    inGame = true;
    paused = false;
    score = 0;
    health = 3;
    asteroids = [];
    bullets = [];
    shieldActive = false;
    shieldTimer = 0;
    shieldCooldown = 0;
    playerBoundingBox = null;
    playerModelLoaded = false;
    updateHUD();
}

function initThree() {
    // Clear previous scene if exists
    if (scene) {
        while(scene.children.length > 0) { 
            scene.remove(scene.children[0]); 
        }
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
    camera.position.set(0, 2, 8);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5,5,5);
    scene.add(dirLight);
    
    // Create objects
    createGalaxy();
    createPlayer();
}

// ========== PLAYER ==========
function createPlayer() {
    // Fallback player model
    const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    // Remove previous player if exists
    if (player) scene.remove(player);

    // Load player model from GLTF assets in the folder
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/spaceship/scene.gltf', function(gltf) {
        // Remove fallback player if it exists
        if (player) scene.remove(player);

        player = gltf.scene;
        player.scale.set(0.5, 0.5, 0.5);
        player.position.set(0, 0, 0);

        // Perbaiki orientasi model: 
        // - Balik ke posisi awal (tidak menghadap ke atas)
        // - Rotate horizontal agar menghadap ke -Z (ke depan layar)
        player.rotation.set(0, Math.PI, 0); // Y axis 180 derajat, menghadap -Z

        scene.add(player);

        // Hitbox: bounding box dari model
        playerBoundingBox = new THREE.Box3().setFromObject(player);
        playerModelLoaded = true;

        console.log('Player model loaded successfully');
    }, function(progress) {
        // progress
    }, function(error) {
        // Fallback to simple geometry if loading fails
        player = new THREE.Mesh(geometry, material);
        player.position.set(0, 0, 0);
        player.rotation.set(0, Math.PI, 0);
        scene.add(player);
        playerBoundingBox = new THREE.Box3().setFromObject(player);
        playerModelLoaded = false;
        console.log('Using fallback player model');
    });

    // Create fallback player initially
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 0, 0);
    player.rotation.set(0, Math.PI, 0);
    scene.add(player);
    playerBoundingBox = new THREE.Box3().setFromObject(player);
    playerModelLoaded = false;
}

// ========== GAME MECHANICS ==========

// Asteroid lanes: 5 jalur tetap, asteroid spawn di jalur ini
const ASTEROID_LANES = [-4, -2, 0, 2, 4];

function getAsteroidSpeed() {
    // Asteroid speed increases with score/distance
    // min 0.08, max 0.5
    let base = 0.08 + Math.min(0.0002 * score, 0.42);
    return base + Math.random() * 0.05;
}

function getAsteroidSpawnInterval() {
    // Asteroid spawn interval decreases as score increases
    // min 15, max 60
    let minInterval = 15;
    let maxInterval = 60;
    let interval = maxInterval - Math.floor(score / 500);
    return Math.max(minInterval, interval);
}

function spawnAsteroid() {
    // Pilih jalur random
    const lane = ASTEROID_LANES[Math.floor(Math.random() * ASTEROID_LANES.length)];
    const size = Math.random()*0.5 + 0.5;
    const geometry = new THREE.DodecahedronGeometry(size, 0);
    const material = new THREE.MeshStandardMaterial({color: 0x888888});
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.position.set(
        lane,
        0, // Y tetap, biar sejalur dengan player
        -100
    );
    asteroid.userData = { 
        speed: getAsteroidSpeed(),
        rotationSpeed: new THREE.Vector3(
            Math.random()*0.02 - 0.01,
            Math.random()*0.02 - 0.01,
            Math.random()*0.02 - 0.01
        ),
        size: size
    };
    scene.add(asteroid);
    asteroids.push(asteroid);
}

function shootBullet() {
    const geo = new THREE.SphereGeometry(0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({color: 0xffff00});
    const bullet = new THREE.Mesh(geo, mat);
    bullet.position.copy(player.position);
    bullet.position.z -= 1;
    bullet.userData = {speed: -0.8};
    scene.add(bullet);
    bullets.push(bullet);
}

function activateShield() {
    shieldActive = true;
    shieldTimer = 300; // 5 seconds at 60fps

    // Remove previous shield mesh if exists
    if (shieldMesh && player) {
        player.remove(shieldMesh);
        shieldMesh = null;
    }

    // Visual effect: shield harus membungkus model spaceship, bukan clone model
    // Gunakan bounding box untuk menentukan ukuran shield sphere
    let shieldRadius = 1.2; // default
    if (player) {
        // Hitung bounding box world
        let bbox = new THREE.Box3().setFromObject(player);
        let size = new THREE.Vector3();
        bbox.getSize(size);
        // Ambil radius terbesar dari bounding box
        shieldRadius = Math.max(size.x, size.y, size.z) * 0.6 + 0.2;
    }

    const shieldGeometry = new THREE.SphereGeometry(shieldRadius, 32, 32);
    const shieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        depthWrite: false
    });
    shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldMesh.name = "shield";
    shieldMesh.position.set(0, 0, 0);
    player.add(shieldMesh);

    updateHUD();
}

// ========== GAME LOGIC ==========
function movePlayer() {
    if (keys['KeyA']) player.position.x -= 0.2;
    if (keys['KeyD']) player.position.x += 0.2;
    player.position.x = Math.max(Math.min(player.position.x, 5), -5);

    // Update bounding box
    if (player) {
        player.updateMatrixWorld();
        playerBoundingBox = new THREE.Box3().setFromObject(player);
    }
}

function updateAsteroids() {
    for (let i = asteroids.length-1; i >= 0; i--) {
        let ast = asteroids[i];
        ast.position.z += ast.userData.speed;
        ast.rotation.x += ast.userData.rotationSpeed.x;
        ast.rotation.y += ast.userData.rotationSpeed.y;
        ast.rotation.z += ast.userData.rotationSpeed.z;
        
        if (ast.position.z > 5) {
            scene.remove(ast);
            asteroids.splice(i,1);
            continue;
        }

        // Hitbox: pakai bounding box
        let asteroidBox = new THREE.Box3().setFromObject(ast);

        // Cek collision
        if (playerBoundingBox && asteroidBox && playerBoundingBox.intersectsBox(asteroidBox)) {
            handleDamage();
            scene.remove(ast);
            asteroids.splice(i,1);
        }
    }
}

function updateBullets() {
    for (let i = bullets.length-1; i >= 0; i--) {
        let b = bullets[i];
        b.position.z += b.userData.speed;
        if (b.position.z < -30) {
            scene.remove(b);
            bullets.splice(i,1);
            continue;
        }
        
        for (let j = asteroids.length-1; j >= 0; j--) {
            let a = asteroids[j];
            // Bullet hitbox: sphere, asteroid: bounding box
            let asteroidBox = new THREE.Box3().setFromObject(a);
            if (asteroidBox.containsPoint(b.position)) {
                scene.remove(a);
                asteroids.splice(j,1);
                scene.remove(b);
                bullets.splice(i,1);
                score += 50;
                break;
            }
        }
    }
}

function handleDamage() {
    if (shieldActive) return;

    health--;
    flashRed();
    updateHearts();

    if (health <= 0) gameOver();
}

function flashRed() {
    // Support both mesh and group
    if (player) {
        player.traverse(obj => {
            if (obj.isMesh) {
                const originalColor = obj.material.color.clone();
                obj.material.color.set(0xff0000);
                setTimeout(() => {
                    obj.material.color.copy(originalColor);
                }, 200);
            }
        });
    }
}

function createGalaxy() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        positions[i*3] = (Math.random()-0.5)*5000;
        positions[i*3+1] = (Math.random()-0.5)*5000;
        positions[i*3+2] = (Math.random()-0.5)*5000;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({color: 0xffffff, size: 1});
    starfield = new THREE.Points(geometry, material);
    scene.add(starfield);
}

function moveStarfield() {
    starfield.rotation.y += 0.0005;
    starfield.rotation.x += 0.0002;
}

// ========== UI FUNCTIONS ==========
function updateHUD() {
    // Update distance (convert score to km)
    const distanceKm = (score / 1000).toFixed(1);
    document.getElementById('distance').textContent = `${distanceKm} km`;
    
    // Update shield status
    const shieldDisplay = document.getElementById('shield');
    if (shieldActive) {
        shieldDisplay.textContent = `SHIELD: ${Math.ceil(shieldTimer/60)}s`;
        shieldDisplay.style.color = '#0ff';
    } else if (shieldCooldown > 0) {
        shieldDisplay.textContent = `COOLDOWN: ${Math.ceil(shieldCooldown/60)}s`;
        shieldDisplay.style.color = '#ff6600';
    } else {
        shieldDisplay.textContent = 'SHIELD: READY';
        shieldDisplay.style.color = '#0f0';
    }
    
    // Update hearts
    updateHearts();
}

function updateHearts() {
    let hearts = '';
    for (let i = 0; i < health; i++) hearts += '❤️';
    document.getElementById('hearts').textContent = hearts;
}

// ========== GAME CONTROLS ==========
function togglePause() {
    paused = !paused;
    document.getElementById('pauseMenu').classList.toggle('hidden', !paused);
}

function resumeGame() {
    paused = false;
    document.getElementById('pauseMenu').classList.add('hidden');
}

function quitToMenu() {
    document.getElementById('transition').style.opacity = 1;
    setTimeout(() => location.reload(), 800);
}

function gameOver() {
    inGame = false;
    setTimeout(() => {
        alert(`GAME OVER\nDistance: ${(score/1000).toFixed(1)} km`);
        quitToMenu();
    }, 500);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========== MAIN GAME LOOP ==========
function animate() {
    if (!inGame) return;
    requestAnimationFrame(animate);
    
    if (paused) {
        renderer.render(scene, camera);
        return;
    }
    
    // Update game state
    movePlayer();
    
    // Spawn asteroids
    asteroidSpawnInterval++;
    if (asteroidSpawnInterval > getAsteroidSpawnInterval()) {
        spawnAsteroid();
        asteroidSpawnInterval = 0;
    }
    
    // Update shield
    if (shieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) {
            shieldActive = false;
            shieldCooldown = 600; // 10 second cooldown (60fps * 10)
            if (shieldMesh && player) {
                player.remove(shieldMesh);
                shieldMesh = null;
            }
        }
    } else if (shieldCooldown > 0) {
        shieldCooldown--;
    }
    
    // Update objects
    updateAsteroids();
    updateBullets();
    moveStarfield();
    
    // Update score
    score += 1;
    updateHUD();
    
    // Render
    renderer.render(scene, camera);
}

// Start the game
window.addEventListener('load', init);
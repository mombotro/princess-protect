// js/game.js - Main Game Loop, Wave Management, Player & Enemy AI Controller

class PrincessProtectGame {
    constructor() {
        this.container = document.getElementById('game-canvas-container');
        this.score = 0;
        this.knockdowns = 0;
        this.currentWave = 1;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.isGameOver = false;
        this.isVictory = false;
        this.isPaused = false;
        this.waveSpawning = false;
        this.waveCleared = false;
        this.noHealthMode = true; // No Health Mode (Invincible for kids)

        // Princess State (Forgiving health & gentle auto-recovery for 6yo)
        this.princessHealth = 200;
        this.maxPrincessHealth = 200;

        // Player State (Fast, responsive horse with one galloping speed)
        this.player = {
            pos: new THREE.Vector3(0, 0, 10),
            rotY: 0,
            speed: 0,
            maxSpeed: 20.0,
            accel: 30.0,
            turnSpeed: 4.0,
            isSprinting: false,
            isAttacking: false,
            attackTimer: 0,
            isStomping: false,
            stompTimer: 0,
            direction: new THREE.Vector3(0, 0, 1),
            gallopTime: 0,
            mesh: null
        };

        // Camera (Spacious view so kid sees all Greeks clearly)
        this.cameraMode = 'chase'; // 'chase', 'cinematic', 'tactical'
        this.camDistance = 16.5;
        this.camHeight = 7.8;

        // Input Tracking
        this.keys = {};
        this.enemies = [];
        this.javelins = [];
        this.trees = [];
        this.princessBuildingMeshes = [];

        this.initThree();
        this.initEnvironment();
        this.initPrincess();
        this.initPlayer();
        this.initParticles();
        this.initInputs();
        this.initMiniMap();

        this.updateCamera(0.016);

        this.isPaused = true;

        // Bind animation loop
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    // 1. Setup Three.js Scene, Camera, Renderer, Fog
    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a2436); // Twilight winter sky
        this.scene.fog = new THREE.FogExp2(0x1a2436, 0.009);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
        this.camera.position.set(0, 10, 20);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x7b8ea8, 0.65);
        this.scene.add(ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
        this.sunLight.position.set(45, 60, 40);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 160;
        const d = 45;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.001;
        this.scene.add(this.sunLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // 2. Setup Environment
    initEnvironment() {
        const env = AssetFactory.createEnvironment(this.scene);
        this.trees = env.trees || [];
    }

    // 3. Setup Princess Sanctuary
    initPrincess() {
        this.princessData = AssetFactory.createPrincess();
        this.princessData.root.position.set(0, 0, 0);
        this.scene.add(this.princessData.root);

        this.princessBuildingMeshes = [];
        if (this.princessData.buildingGroup) {
            this.princessData.buildingGroup.traverse((child) => {
                if (child.isMesh && child.material) {
                    this.princessBuildingMeshes.push(child);
                }
            });
        }
    }

    // 4. Setup Player (Bogatyr Knight & Horse)
    initPlayer() {
        this.playerData = AssetFactory.createKnightAndHorse();
        this.player.mesh = this.playerData.root;
        this.player.horse = this.playerData;
        this.player.mesh.position.copy(this.player.pos);
        this.scene.add(this.player.mesh);
    }

    // 5. Setup Particles
    initParticles() {
        this.particles = new ParticleManager(this.scene);
    }

    // 6. Setup Inputs
    initInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Audio init on first keypress
            window.Sound.resume();

            if (e.code === 'Space') {
                e.preventDefault();
                this.triggerLanceAttack();
            }
            if (e.code === 'KeyC') {
                this.cycleCamera();
            }
            if (e.code === 'KeyM') {
                const muted = window.Sound.toggleMute();
                this.updateMuteButton(muted);
            }
            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch Virtual Controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        const joyZone = document.getElementById('touch-joystick-zone');
        const joyStick = document.getElementById('touch-joystick-stick');
        const btnCharge = document.getElementById('btn-touch-charge');
        const btnSweep = document.getElementById('btn-touch-sweep');
        const btnStomp = document.getElementById('btn-touch-stomp');

        if (!joyZone) return;

        let touchId = null;
        let startX = 0, startY = 0;

        joyZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.Sound.resume();
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            const rect = joyZone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        });

        joyZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === touchId) {
                    const dx = touch.clientX - startX;
                    const dy = touch.clientY - startY;
                    const dist = Math.min(45, Math.hypot(dx, dy));
                    const angle = Math.atan2(dy, dx);

                    joyStick.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;

                    this.keys['ArrowUp'] = (dy < -15);
                    this.keys['ArrowDown'] = (dy > 15);
                    this.keys['ArrowLeft'] = (dx < -15);
                    this.keys['ArrowRight'] = (dx > 15);
                    // Also mirror to WASD
                    this.keys['KeyW'] = this.keys['ArrowUp'];
                    this.keys['KeyS'] = this.keys['ArrowDown'];
                    this.keys['KeyA'] = this.keys['ArrowLeft'];
                    this.keys['KeyD'] = this.keys['ArrowRight'];
                }
            }
        });

        const resetJoy = (e) => {
            e.preventDefault();
            joyStick.style.transform = `translate(0px, 0px)`;
            this.keys['ArrowUp'] = false;
            this.keys['ArrowDown'] = false;
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
            this.keys['KeyW'] = false;
            this.keys['KeyS'] = false;
            this.keys['KeyA'] = false;
            this.keys['KeyD'] = false;
            touchId = null;
        };

        joyZone.addEventListener('touchend', resetJoy);
        joyZone.addEventListener('touchcancel', resetJoy);

        if (btnSweep) {
            btnSweep.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerLanceAttack();
            });
        }
    }

    // 7. Setup Mini-Map
    initMiniMap() {
        this.mapCanvas = document.getElementById('minimap-canvas');
        if (this.mapCanvas) {
            this.mapCtx = this.mapCanvas.getContext('2d');
        }
    }

    // --- ACTIONS (Simplified to just Spacebar) ---

    triggerLanceAttack() {
        if (this.player.isAttacking) return;
        this.player.isAttacking = true;
        this.player.attackTimer = 0.55;
        window.Sound.playLanceSweep();
    }

    cycleCamera() {
        if (this.cameraMode === 'chase') this.cameraMode = 'cinematic';
        else if (this.cameraMode === 'cinematic') this.cameraMode = 'tactical';
        else this.cameraMode = 'chase';
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal) {
            pauseModal.style.display = this.isPaused ? 'flex' : 'none';
        }
    }

    updateMuteButton(muted) {
        const btn = document.getElementById('btn-mute');
        if (btn) {
            btn.textContent = muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
        }
    }

    // --- WAVE SPAWNER ---

    startWave(waveNum) {
        this.currentWave = waveNum;
        this.updateHUD();

        // Wave announcements
        const waveNames = [
            "Wave 1: Athenian Scouts",
            "Wave 2: Spartan Phalanx",
            "Wave 3: Rain of Javelins",
            "Wave 4: Wrath of Myrmidons",
            "Wave 5: Spartan General's Guard",
            `Wave ${waveNum}: Greek Endless Horde`
        ];
        const title = waveNames[Math.min(waveNum - 1, waveNames.length - 1)];

        this.showBanner(title, "Defend Princess Milena!");
        window.Sound.playPrincessCheer();

        // Start background war music
        window.Sound.startMusic();

        // Spawn Greeks based on wave
        this.waveSpawning = true;
        this.waveCleared = false;
        const count = 6 + waveNum * 4;
        let spawned = 0;

        if (this.spawnIntervalId) clearInterval(this.spawnIntervalId);
        this.spawnIntervalId = setInterval(() => {
            if (this.isGameOver) {
                clearInterval(this.spawnIntervalId);
                this.spawnIntervalId = null;
                this.waveSpawning = false;
                return;
            }

            // Determine type
            let type = 'scout';
            if (waveNum >= 2 && Math.random() < 0.5) type = 'hoplite';
            if (waveNum >= 3 && Math.random() < 0.35) type = 'peltast';
            if (waveNum >= 4 && Math.random() < 0.25) type = 'champion';

            this.spawnEnemy(type);
            spawned++;

            if (spawned >= count) {
                clearInterval(this.spawnIntervalId);
                this.spawnIntervalId = null;
                this.waveSpawning = false;
            }
        }, 900);
    }

    spawnEnemy(type) {
        const enemyData = AssetFactory.createGreekWarrior(type);

        // Spawn outside Kremlin walls at gates or perimeter
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 48 + Math.random() * 8;
        const x = Math.cos(angle) * spawnDist;
        const z = Math.sin(angle) * spawnDist;

        enemyData.root.position.set(x, 0, z);
        // Slower and 1-hit knockout for fun, satisfying gameplay for a 6-year-old
        enemyData.health = (type === 'champion') ? 2 : 1;
        enemyData.speed = (type === 'scout') ? 4.2 : ((type === 'champion') ? 2.6 : 3.2);
        enemyData.active = true;
        enemyData.attackCooldown = 0;
        enemyData.javelinTimer = 2.5 + Math.random() * 2;
        enemyData.walkCycle = Math.random() * 10;

        this.scene.add(enemyData.root);
        this.enemies.push(enemyData);
    }

    // --- ENEMY AI & JAVELIN LOGIC ---

    updateEnemies(delta) {
        const princessPos = new THREE.Vector3(0, 0, 0);
        const playerPos = this.player.mesh.position;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.active) continue;

            // Physics update (for ragdoll flight / tumble)
            CombatPhysics.updateEnemyPhysics(enemy, delta);

            // If knocked down, skip running logic
            if (enemy.isKnockedDown) {
                // If lethal damage taken, let them fly and hit the snow first, then dissolve into rubles
                if (enemy.health <= 0 && enemy.knockdownTimer < 2.0) {
                    this.defeatEnemy(enemy, i);
                }
                continue;
            }

            const enemyPos = enemy.root.position;
            const distToPrincess = enemyPos.distanceTo(princessPos);
            const distToPlayer = enemyPos.distanceTo(playerPos);

            // Heading direction: Default towards Princess, but engage Knight if very close
            let targetPos = princessPos;
            if (distToPlayer < 7.0 && enemy.type !== 'peltast') {
                targetPos = playerPos; // Aggro knight
            }

            const moveDir = new THREE.Vector3().subVectors(targetPos, enemyPos).normalize();
            moveDir.y = 0;

            // Rotate towards target
            const targetRot = Math.atan2(moveDir.x, moveDir.z);
            enemy.root.rotation.y = THREE.MathUtils.lerp(enemy.root.rotation.y, targetRot, 0.12);

            // Advance
            if (distToPrincess > 3.6) {
                enemy.root.position.addScaledVector(moveDir, enemy.speed * delta);

                // Running leg animation
                enemy.walkCycle += delta * enemy.speed * 2.5;
                if (enemy.legL && enemy.legR) {
                    enemy.legL.rotation.x = Math.sin(enemy.walkCycle) * 0.6;
                    enemy.legR.rotation.x = -Math.sin(enemy.walkCycle) * 0.6;
                }
            } else {
                // Attacking Princess Sanctuary!
                enemy.attackCooldown -= delta;
                if (enemy.attackCooldown <= 0) {
                    enemy.attackCooldown = 1.2;
                    this.damagePrincess(enemy.type === 'champion' ? 12 : 6);

                    // Attack spear thrust animation
                    if (enemy.armR) {
                        enemy.armR.position.z += 0.4;
                        setTimeout(() => { if (enemy.armR) enemy.armR.position.z -= 0.4; }, 180);
                    }
                }
            }

            // Peltast Javelin Throw
            if (enemy.type === 'peltast' && distToPrincess > 6.0) {
                enemy.javelinTimer -= delta;
                if (enemy.javelinTimer <= 0) {
                    enemy.javelinTimer = 4.0 + Math.random() * 2;
                    this.throwJavelin(enemyPos, (distToPlayer < 12.0) ? playerPos : princessPos);
                }
            }
        }

        // Update Flying Javelins
        for (let j = this.javelins.length - 1; j >= 0; j--) {
            const jav = this.javelins[j];
            jav.mesh.position.addScaledVector(jav.vel, delta);
            jav.vel.y -= 9.8 * delta;

            // Orient spear to point forward along its parabolic flight trajectory
            jav.mesh.lookAt(jav.mesh.position.clone().add(jav.vel));

            // Check hit princess sanctuary
            if (jav.mesh.position.distanceTo(princessPos) < 3.8) {
                this.damagePrincess(5);
                this.particles.spawnImpactSparks(jav.mesh.position, 10);
                this.scene.remove(jav.mesh);
                this.javelins.splice(j, 1);
                continue;
            }

            // Check hit player / horse (deflected with heroic sparks)
            if (jav.mesh.position.distanceTo(playerPos) < 2.0) {
                this.particles.spawnImpactSparks(jav.mesh.position, 10);
                window.Sound.playImpact(0.6);
                this.scene.remove(jav.mesh);
                this.javelins.splice(j, 1);
                continue;
            }

            // Ground hit
            if (jav.mesh.position.y <= 0) {
                this.particles.spawnHoofKick(jav.mesh.position, new THREE.Vector3(0, 0, 1));
                this.scene.remove(jav.mesh);
                this.javelins.splice(j, 1);
            }
        }

        // Check if wave cleared (all spawned enemies defeated)
        if (!this.waveSpawning && this.enemies.length === 0 && !this.isGameOver && !this.waveCleared) {
            this.waveCleared = true;
            this.clearWave();
        }
    }

    throwJavelin(fromPos, toPos) {
        const javGroup = new THREE.Group();

        // Wooden shaft (rotated by Math.PI / 2 around X so it extends along Z-axis)
        const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.0, 6);
        shaftGeo.rotateX(Math.PI / 2);
        const shaft = new THREE.Mesh(shaftGeo, AssetFactory.materials.greekSpearWood);
        shaft.castShadow = true;
        javGroup.add(shaft);

        // Bronze / Steel Spearhead (cone pointing forward in +Z direction)
        const tipGeo = new THREE.ConeGeometry(0.075, 0.35, 6);
        tipGeo.rotateX(Math.PI / 2);
        const tip = new THREE.Mesh(tipGeo, AssetFactory.materials.steel);
        tip.position.set(0, 0, 1.175);
        tip.castShadow = true;
        javGroup.add(tip);

        // Bronze counterweight / butt spike (cone pointing backward in -Z direction)
        const buttGeo = new THREE.ConeGeometry(0.05, 0.2, 6);
        buttGeo.rotateX(-Math.PI / 2);
        const butt = new THREE.Mesh(buttGeo, AssetFactory.materials.greekBronze);
        butt.position.set(0, 0, -1.1);
        javGroup.add(butt);

        javGroup.position.copy(fromPos);
        javGroup.position.y += 1.2;

        const toTarget = new THREE.Vector3().subVectors(toPos, fromPos);
        const horizDist = Math.hypot(toTarget.x, toTarget.z);
        const timeToHit = Math.max(0.8, horizDist / 18.0);

        const vel = new THREE.Vector3(
            toTarget.x / timeToHit,
            (toTarget.y + 0.5 * 9.8 * timeToHit * timeToHit) / timeToHit,
            toTarget.z / timeToHit
        );

        // Align spear tip forward towards initial launch vector
        javGroup.lookAt(javGroup.position.clone().add(vel));

        this.scene.add(javGroup);
        this.javelins.push({ mesh: javGroup, vel });
    }

    damagePrincess(amount) {
        if (this.noHealthMode) {
            // No Health Mode: Princess is completely safe and invincible!
            return;
        }

        this.princessHealth = Math.max(0, this.princessHealth - amount);
        window.Sound.playPrincessHurt();
        this.updateHUD();

        // Screen red flash
        const flash = document.getElementById('damage-flash');
        if (flash) {
            flash.style.opacity = '0.6';
            setTimeout(() => { flash.style.opacity = '0'; }, 200);
        }

        if (this.princessHealth <= 0) {
            this.triggerGameOver();
        }
    }

    handleKnockdown(enemy, hitType) {
        if (!enemy || enemy.isKnockdownHandled) return;
        enemy.isKnockdownHandled = true;

        this.knockdowns++;
        this.comboCount++;
        this.comboTimer = 3.5;

        // Score calculations
        const points = (hitType === 'TRAMPLE' ? 150 : 100) * Math.min(5, this.comboCount);
        this.score += points;
        this.rubles += 3;

        const funCheers = ['BOING! 🌟', 'WHEEEE! 🚀', 'KABAM! 💥', 'SUPER BOGATYR! 👑', 'STRIKE! 🎳', 'YAAAY! 🎉'];
        const cheer = funCheers[Math.floor(Math.random() * funCheers.length)];

        this.particles.spawnFloatingText(
            `${hitType} ${cheer}`,
            enemy.root.position,
            '#ffd700'
        );

        // Princess cheers enthusiastically!
        window.Sound.playPrincessCheer();
        if (this.princessData.armL && this.princessData.armR) {
            this.princessData.armL.rotation.x = -Math.PI / 1.5;
            this.princessData.armR.rotation.x = -Math.PI / 1.5;
            setTimeout(() => {
                if (this.princessData.armL) this.princessData.armL.rotation.x = 0;
                if (this.princessData.armR) this.princessData.armR.rotation.x = 0;
            }, 350);
        }

        this.updateHUD();
    }

    defeatEnemy(enemy, index) {
        this.particles.spawnImpactSparks(enemy.root.position, 24);
        window.Sound.playCoin();

        this.scene.remove(enemy.root);
        this.enemies.splice(index, 1);
        this.score += 200;
        this.updateHUD();
    }

    clearWave() {
        this.showBanner(`WAVE ${this.currentWave} COMPLETE! 🎉`, "You protected Princess Milena! Great job!");
        window.Sound.playPrincessCheer();

        // Full Princess health restore
        this.princessHealth = this.maxPrincessHealth;
        this.updateHUD();

        // Automatically roll into the next wave seamlessly
        setTimeout(() => {
            if (!this.isGameOver) {
                this.startWave(this.currentWave + 1);
            }
        }, 2500);
    }

    triggerGameOver() {
        this.isGameOver = true;
        window.Sound.stopMusic();
        const overModal = document.getElementById('game-over-modal');
        if (overModal) {
            overModal.style.display = 'flex';
            document.getElementById('final-score-text').textContent = this.score;
            document.getElementById('final-knockdown-text').textContent = this.knockdowns;
        }
    }

    restart() {
        // Reset scene enemies
        this.enemies.forEach(e => this.scene.remove(e.root));
        this.enemies = [];
        this.javelins.forEach(j => this.scene.remove(j.mesh));
        this.javelins = [];

        this.princessHealth = 100;
        this.score = 0;
        this.knockdowns = 0;
        this.rubles = 0;
        this.comboCount = 0;
        this.isGameOver = false;
        this.waveSpawning = false;
        this.waveCleared = false;

        if (this.spawnIntervalId) {
            clearInterval(this.spawnIntervalId);
            this.spawnIntervalId = null;
        }

        this.player.pos.set(0, 0, 10);
        this.player.speed = 0;
        this.player.stamina = 100;

        document.getElementById('game-over-modal').style.display = 'none';
        this.startWave(1);
    }

    // --- PLAYER & HORSE RIDING CONTROLLER ---

    updatePlayer(delta) {
        const p = this.player;

        // 1. Steering & Rotation
        let turn = 0;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) turn += 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) turn -= 1;
        p.rotY += turn * p.turnSpeed * delta;
        p.mesh.rotation.y = p.rotY;

        p.direction.set(Math.sin(p.rotY), 0, Math.cos(p.rotY));

        // 2. Acceleration / Gallop (Arrow keys directly drive full gallop)
        let throttle = 0;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) throttle += 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) throttle -= 0.7;

        if (throttle > 0) {
            p.speed = Math.min(p.maxSpeed, p.speed + p.accel * delta * throttle);
            p.isSprinting = (p.speed > 7.0);
        } else if (throttle < 0) {
            p.speed = Math.max(-6.0, p.speed - p.accel * 1.2 * delta);
            p.isSprinting = false;
        } else {
            // Natural drag / friction
            p.speed *= Math.pow(0.85, delta * 30);
            p.isSprinting = false;
        }

        // Apply movement vector
        p.pos.addScaledVector(p.direction, p.speed * delta);

        // Keep inside arena boundary (radius 52)
        const arenaDist = Math.hypot(p.pos.x, p.pos.z);
        if (arenaDist > 52) {
            p.pos.multiplyScalar(52 / arenaDist);
            p.speed *= -0.2; // Bounce off wall slightly
        }

        p.mesh.position.copy(p.pos);

        // 3. Realistic 4-Beat Gallop Animation (rhythmic, comfortable pace for 6yo)
        if (Math.abs(p.speed) > 0.5) {
            const gallopRate = Math.min(2.3, 0.7 + (Math.abs(p.speed) / p.maxSpeed) * 1.3);
            p.gallopTime += delta * gallopRate;

            const cycle = p.gallopTime * Math.PI * 2;
            const legs = this.playerData.legs;

            // Front Legs alternating swing (along horse length)
            legs.fl.upper.rotation.z = Math.sin(cycle) * 0.7;
            legs.fl.knee.rotation.z = Math.max(0, -Math.sin(cycle) * 0.8);

            legs.fr.upper.rotation.z = Math.sin(cycle + 0.5) * 0.7;
            legs.fr.knee.rotation.z = Math.max(0, -Math.sin(cycle + 0.5) * 0.8);

            // Back Legs drive
            legs.bl.upper.rotation.z = -Math.sin(cycle + 1.2) * 0.65;
            legs.bl.knee.rotation.z = Math.max(0, Math.sin(cycle + 1.2) * 0.7);

            legs.br.upper.rotation.z = -Math.sin(cycle + 1.7) * 0.65;
            legs.br.knee.rotation.z = Math.max(0, Math.sin(cycle + 1.7) * 0.7);

            // Torso & Neck gallop bob
            this.playerData.horse.position.y = Math.sin(cycle * 2) * 0.12;
            this.playerData.neckPivot.rotation.z = -Math.PI / 4 + Math.sin(cycle) * 0.1;
            this.playerData.tailPivot.rotation.z = 0.2 + Math.sin(cycle) * 0.25;

            // Flowing Cape flutter in the wind
            this.playerData.capePivot.rotation.z = (p.speed / p.maxSpeed) * 0.5 + Math.sin(cycle * 3) * 0.15;

            // Audio & Snow kick
            window.Sound.playHoofbeat(Math.abs(p.speed) / 10.0);
            if (Math.random() < 0.35) {
                this.particles.spawnHoofKick(p.pos, p.direction, p.isSprinting);
            }
        } else {
            // Idle breathing
            this.playerData.horse.position.y = Math.sin(Date.now() * 0.003) * 0.03;
        }

        // 4. Stomp Attack Animation (Rearing up)
        if (p.isStomping) {
            p.stompTimer -= delta;
            if (p.stompTimer > 0.3) {
                // Rearing up!
                this.playerData.horse.rotation.z = 0.55;
                this.playerData.legs.fl.upper.rotation.z = 0.9;
                this.playerData.legs.fr.upper.rotation.z = 0.9;
            } else {
                // Slamming down!
                this.playerData.horse.rotation.z = -0.1;
            }

            if (p.stompTimer <= 0) {
                p.isStomping = false;
                this.playerData.horse.rotation.z = 0;
            }
        }

        // 5. Lance Attack / Couching Animation
        if (p.isAttacking) {
            p.attackTimer -= delta;
            // Sweep lance across front arc
            const sweepProg = 1 - (p.attackTimer / 0.45);
            this.playerData.lancePivot.rotation.y = -Math.PI / 3 + sweepProg * (Math.PI * 0.85);
            this.playerData.lancePivot.rotation.z = 0.05;

            if (p.attackTimer <= 0) {
                p.isAttacking = false;
                this.playerData.lancePivot.rotation.y = 0;
                this.playerData.lancePivot.rotation.z = 0.35;
            }
        } else if (p.isSprinting) {
            // Couched lance for charge!
            this.playerData.lancePivot.rotation.z = THREE.MathUtils.lerp(this.playerData.lancePivot.rotation.z, 0.02, 0.2);
            this.playerData.lancePivot.rotation.y = THREE.MathUtils.lerp(this.playerData.lancePivot.rotation.y, 0.0, 0.2);
        } else {
            // Resting lance
            this.playerData.lancePivot.rotation.z = THREE.MathUtils.lerp(this.playerData.lancePivot.rotation.z, 0.35, 0.1);
        }

        // Check combat collisions with enemies
        CombatPhysics.checkHorseCollisions(
            this.player,
            this.enemies,
            this.particles,
            window.Sound,
            (enemy, type) => this.handleKnockdown(enemy, type)
        );
    }

    // --- CAMERA CONTROLLER ---

    updateCamera(delta) {
        const p = this.player;

        if (this.cameraMode === 'chase') {
            // Smooth spring camera behind horse
            const camOffset = new THREE.Vector3(
                -Math.sin(p.rotY) * this.camDistance,
                this.camHeight,
                -Math.cos(p.rotY) * this.camDistance
            );
            const targetCamPos = p.pos.clone().add(camOffset);
            this.camera.position.lerp(targetCamPos, 0.1);

            const lookTarget = p.pos.clone().add(new THREE.Vector3(0, 2.2, 0));
            this.camera.lookAt(lookTarget);

            // Dynamic FOV for speed sensation
            const targetFOV = p.isSprinting ? 72 : 60;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.1);
            this.camera.updateProjectionMatrix();

        } else if (this.cameraMode === 'cinematic') {
            // Dramatic low side angle
            const sideOffset = new THREE.Vector3(
                Math.cos(p.rotY) * 7 - Math.sin(p.rotY) * 6,
                2.2,
                -Math.sin(p.rotY) * 7 - Math.cos(p.rotY) * 6
            );
            this.camera.position.lerp(p.pos.clone().add(sideOffset), 0.08);
            this.camera.lookAt(p.pos.clone().add(new THREE.Vector3(0, 1.8, 0)));

        } else if (this.cameraMode === 'tactical') {
            // Top-down arena view
            this.camera.position.set(0, 52, 28);
            this.camera.lookAt(0, 0, 0);
        }

        // Dynamically make occluding trees and princess building see-through
        this.updateSeeThroughObstacles();
    }

    // --- DYNAMIC SEE-THROUGH OBSTACLES (TREES & PRINCESS BUILDING) ---

    updateSeeThroughObstacles() {
        const camPos = this.camera.position;
        const playerPos = this.player.pos;

        // Vector from camera to player in XZ
        const vX = playerPos.x - camPos.x;
        const vZ = playerPos.z - camPos.z;
        const lineLenSq = vX * vX + vZ * vZ;

        // 1. Check and fade Trees
        if (this.trees && this.trees.length > 0) {
            for (let i = 0; i < this.trees.length; i++) {
                const tree = this.trees[i];
                const tx = tree.pos.x;
                const tz = tree.pos.z;

                // Distance to camera
                const distToCamSq = (tx - camPos.x) * (tx - camPos.x) + (tz - camPos.z) * (tz - camPos.z);

                let isOccluding = false;

                // Close to camera lens
                if (distToCamSq < 20.0) { // within ~4.5m of camera
                    isOccluding = true;
                } else if (lineLenSq > 0.001) {
                    // Projection onto camera-to-player segment
                    const t = ((tx - camPos.x) * vX + (tz - camPos.z) * vZ) / lineLenSq;
                    if (t > 0.02 && t < 1.05) {
                        const projX = camPos.x + t * vX;
                        const projZ = camPos.z + t * vZ;
                        const distToSegSq = (tx - projX) * (tx - projX) + (tz - projZ) * (tz - projZ);
                        if (distToSegSq < 9.0) { // within ~3.0m of line of sight
                            isOccluding = true;
                        }
                    }
                }

                const targetOpacity = isOccluding ? 0.18 : 1.0;
                const meshes = tree.meshes;
                for (let m = 0; m < meshes.length; m++) {
                    const mat = meshes[m].material;
                    if (mat) {
                        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.2);
                        mat.depthWrite = (mat.opacity > 0.85);
                    }
                }
            }
        }

        // 2. Check and fade Princess Pavilion / Building
        if (this.princessBuildingMeshes && this.princessBuildingMeshes.length > 0) {
            const distCamToBuildingSq = (camPos.x * camPos.x) + (camPos.z * camPos.z);
            const distPlayerToBuildingSq = (playerPos.x * playerPos.x) + (playerPos.z * playerPos.z);

            let isBuildingOccluding = false;

            // Camera is close to building
            if (distCamToBuildingSq < 52.0) { // within ~7.2m
                isBuildingOccluding = true;
            }
            // Player is inside / near dais
            else if (distPlayerToBuildingSq < 52.0) { // within ~7.2m
                isBuildingOccluding = true;
            }
            // Building is between camera and player
            else if (lineLenSq > 0.001) {
                const t = (-camPos.x * vX - camPos.z * vZ) / lineLenSq;
                if (t > 0.02 && t < 1.05) {
                    const projX = camPos.x + t * vX;
                    const projZ = camPos.z + t * vZ;
                    const distToSegSq = projX * projX + projZ * projZ;
                    if (distToSegSq < 30.0) { // within ~5.5m of pavilion center
                        isBuildingOccluding = true;
                    }
                }
            }

            const targetOpacity = isBuildingOccluding ? 0.20 : 1.0;
            for (let i = 0; i < this.princessBuildingMeshes.length; i++) {
                const mat = this.princessBuildingMeshes[i].material;
                if (mat) {
                    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.2);
                    mat.depthWrite = (mat.opacity > 0.85);
                }
            }
        }
    }

    // --- HUD & MINI-MAP ---

    updateHUD() {
        // Princess Health Bar / No Health Mode display
        const healthFill = document.getElementById('princess-health-fill');
        const healthText = document.getElementById('princess-health-text');
        if (this.noHealthMode) {
            if (healthFill) {
                healthFill.style.width = '100%';
                healthFill.style.background = 'linear-gradient(90deg, #ffd700, #ff9900, #ff4488, #44ccff, #ffd700)';
                healthFill.style.boxShadow = '0 0 16px rgba(255, 215, 0, 0.9)';
            }
            if (healthText) healthText.textContent = '💖 NO HEALTH MODE (INVINCIBLE)';
        } else {
            const healthPct = (this.princessHealth / this.maxPrincessHealth) * 100;
            if (healthFill) {
                healthFill.style.width = `${healthPct}%`;
                healthFill.style.background = 'linear-gradient(90deg, #9b111e, #d82c20, #ff5e3a)';
                healthFill.style.boxShadow = '0 0 12px rgba(230, 40, 40, 0.8)';
            }
            if (healthText) healthText.textContent = `${Math.ceil(this.princessHealth)} / ${this.maxPrincessHealth}`;
        }

        // Scores & Counts
        const scoreEl = document.getElementById('hud-score');
        if (scoreEl) scoreEl.textContent = this.score;

        const knockEl = document.getElementById('hud-knockdowns');
        if (knockEl) knockEl.textContent = this.knockdowns;

        const waveEl = document.getElementById('hud-wave');
        if (waveEl) waveEl.textContent = this.currentWave;

        // Combo Display
        const comboBadge = document.getElementById('hud-combo-badge');
        if (comboBadge) {
            if (this.comboCount > 1) {
                comboBadge.style.display = 'block';
                comboBadge.textContent = `${this.comboCount}x COMBO!`;
            } else {
                comboBadge.style.display = 'none';
            }
        }
    }

    toggleNoHealthMode() {
        this.noHealthMode = !this.noHealthMode;
        if (this.noHealthMode) {
            this.princessHealth = this.maxPrincessHealth;
            window.Sound.playPrincessCheer();
        }
        this.updateHealthModeButtons();
        this.updateHUD();
        return this.noHealthMode;
    }

    updateHealthModeButtons() {
        const btn = document.getElementById('btn-health-mode');
        if (btn) {
            btn.textContent = this.noHealthMode ? '⭐ KIDS MODE: ON' : '🛡️ NORMAL HEALTH';
            btn.style.color = this.noHealthMode ? '#ffd700' : '#fff';
        }
        const startText = document.getElementById('start-health-mode-text');
        if (startText) {
            startText.textContent = this.noHealthMode ? 'ON (INVINCIBLE)' : 'OFF (NORMAL)';
        }
    }

    drawMiniMap() {
        if (!this.mapCtx) return;
        const ctx = this.mapCtx;
        const w = this.mapCanvas.width;
        const h = this.mapCanvas.height;
        const center = w / 2;
        const scale = (w * 0.44) / 55; // Arena radius 55m

        ctx.clearRect(0, 0, w, h);

        // Kremlin Outer Palisade Circle
        ctx.strokeStyle = '#5c3b1e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(center, center, 55 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Princess Sanctuary (Center Golden Crown)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(center, center, 6, 0, Math.PI * 2);
        ctx.fill();

        // Greek Enemies (Red dots)
        ctx.fillStyle = '#ff2222';
        this.enemies.forEach((enemy) => {
            if (!enemy.active) return;
            const ex = center + enemy.root.position.x * scale;
            const ey = center + enemy.root.position.z * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, enemy.type === 'champion' ? 4.5 : 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Player Bogatyr Knight (Green arrow / circle)
        const px = center + this.player.pos.x * scale;
        const py = center + this.player.pos.z * scale;
        ctx.fillStyle = '#22ff66';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Heading tick
        ctx.strokeStyle = '#22ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.sin(this.player.rotY) * 9, py + Math.cos(this.player.rotY) * 9);
        ctx.stroke();
    }

    showBanner(title, subtitle = '') {
        const banner = document.getElementById('wave-banner');
        const titleEl = document.getElementById('wave-banner-title');
        const subEl = document.getElementById('wave-banner-sub');

        if (banner && titleEl) {
            titleEl.textContent = title;
            if (subEl) subEl.textContent = subtitle;
            banner.style.opacity = '1';
            banner.style.transform = 'translate(-50%, -50%) scale(1.05)';

            setTimeout(() => {
                banner.style.opacity = '0';
                banner.style.transform = 'translate(-50%, -50%) scale(0.9)';
            }, 2600);
        }
    }

    // --- MAIN TICK LOOP ---

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(0.1, this.clock.getDelta());

        if (!this.isPaused && !this.isGameOver) {
            // Update Combo Timer
            if (this.comboTimer > 0) {
                this.comboTimer -= delta;
                if (this.comboTimer <= 0) {
                    this.comboCount = 0;
                    this.updateHUD();
                }
            }

            // Update Game Entities
            this.updatePlayer(delta);
            this.updateEnemies(delta);
            this.particles.update(delta, this.camera);

            // Princess protective aura gentle pulsing
            if (this.princessData.auraMesh) {
                this.princessData.auraMesh.rotation.y += delta * 0.3;
            }

            // Gentle health recovery
            this.princessHealth = Math.min(this.maxPrincessHealth, this.princessHealth + 4.0 * delta);

            this.updateCamera(delta);
            this.updateHUD();
            this.drawMiniMap();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global Game Start on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new PrincessProtectGame();
});

// js/physics.js - Combat Collision & Knock-Down Ragdoll Physics

const CombatPhysics = {
    // Check if horse/lance collides with a Greek warrior
    checkHorseCollisions(player, enemies, particles, sound, onKnockdown) {
        const horsePos = player.horse.root.position;
        const horseDir = player.direction;
        const horseSpeed = player.speed;
        const isCharging = player.isSprinting;

        // Generous, kid-friendly collision hitboxes
        const horseRadius = isCharging ? 3.4 : 2.6;

        enemies.forEach((enemy) => {
            if (!enemy.active || enemy.isKnockedDown || enemy.isKnockdownHandled) return;

            const enemyPos = enemy.root.position;
            const dist = horsePos.distanceTo(enemyPos);

            // 1. Wide Lance Sweep Hitbox (huge 200-degree front arc)
            if (player.isAttacking && dist < 6.8) {
                const toEnemy = new THREE.Vector3().subVectors(enemyPos, horsePos).normalize();
                const forwardDot = horseDir.dot(toEnemy);

                if (forwardDot > -0.25) { // Ultra wide sweep cone
                    const sweepForce = 22.0 + horseSpeed * 0.4;
                    this.knockdownEnemy(enemy, horsePos, horseDir, sweepForce, 14.0, particles, sound);
                    if (onKnockdown) onKnockdown(enemy, 'KNOCK DOWN! 💥');
                    return; // Prevent trample collision from also firing on this enemy
                }
            }

            // 2. Direct Horse Body / Trample Collision (triggers when riding into bad guys)
            if (dist < horseRadius && horseSpeed > 0.8) {
                const impactForce = isCharging ? (24.0 + horseSpeed * 0.8) : (16.0 + horseSpeed * 0.5);
                const lift = isCharging ? 16.0 : 11.0;
                this.knockdownEnemy(enemy, horsePos, horseDir, impactForce, lift, particles, sound);
                if (onKnockdown) onKnockdown(enemy, isCharging ? 'TRAMPLE' : 'BOING!');
            }
        });
    },

    // Apply knock-down physics impulses to an enemy
    knockdownEnemy(enemy, sourcePos, sourceDir, horizForce, vertLift, particles, sound) {
        enemy.isKnockedDown = true;
        enemy.knockdownTimer = 2.8; // Seconds down before getting back up
        enemy.health -= 1;

        // Knockdown direction: combination of source forward momentum + radial pushback
        const pushDir = new THREE.Vector3().subVectors(enemy.root.position, sourcePos).normalize();
        pushDir.y = 0;
        if (pushDir.lengthSq() < 0.001) pushDir.copy(sourceDir);

        const launchDir = new THREE.Vector3()
            .addScaledVector(sourceDir, 0.6)
            .addScaledVector(pushDir, 0.4)
            .normalize();

        enemy.velocity.set(
            launchDir.x * horizForce,
            vertLift + (Math.random() * 2),
            launchDir.z * horizForce
        );

        // Tumble / Spin velocities
        enemy.rotVelocity.set(
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 16
        );

        // Visual effects & audio
        if (particles) {
            particles.spawnImpactSparks(enemy.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 18);
        }
        if (sound) {
            sound.playImpact(horizForce / 12.0);
        }

        // Show stun stars
        if (enemy.stunStarsGroup) {
            enemy.stunStarsGroup.visible = true;
        }

        // Fling spear and shield out of hands slightly
        if (enemy.spearMesh) {
            enemy.spearMesh.rotation.z = Math.PI / 1.8;
            enemy.spearMesh.position.y = -0.5;
        }
        if (enemy.shieldMesh) {
            enemy.shieldMesh.rotation.y = Math.PI / 1.5;
        }
    },

    // Radial Thunder Stomp Knockdown
    executeStomp(player, enemies, particles, sound, onKnockdown) {
        const center = player.horse.root.position;
        const radius = 18.0;

        if (particles) {
            particles.spawnShockwave(center, radius);
        }
        if (sound) {
            sound.playStomp();
        }

        let hitCount = 0;
        enemies.forEach((enemy) => {
            if (!enemy.active) return;
            const dist = center.distanceTo(enemy.root.position);
            if (dist < radius) {
                const force = 24.0 * (1 - dist / radius) + 12.0;
                const lift = 16.0;
                this.knockdownEnemy(enemy, center, new THREE.Vector3(0, 0, 1), force, lift, particles, sound);
                hitCount++;
                if (onKnockdown) onKnockdown(enemy, 'SUPER STOMP! 💥');
            }
        });

        return hitCount;
    },

    // Update airborne & knocked-down enemy physics trajectories
    updateEnemyPhysics(enemy, delta) {
        if (!enemy.isKnockedDown) return;

        // Apply gravity
        enemy.velocity.y -= 22.0 * delta;

        // Move by velocity
        enemy.root.position.addScaledVector(enemy.velocity, delta);

        // Rotate while flying
        enemy.root.rotation.x += enemy.rotVelocity.x * delta;
        enemy.root.rotation.y += enemy.rotVelocity.y * delta;
        enemy.root.rotation.z += enemy.rotVelocity.z * delta;

        // Ground collision (y <= 0)
        if (enemy.root.position.y <= 0.1) {
            enemy.root.position.y = 0.1;

            // Bounce with high friction
            if (Math.abs(enemy.velocity.y) > 3.0) {
                enemy.velocity.y = -enemy.velocity.y * 0.25;
            } else {
                enemy.velocity.y = 0;
            }

            // Ground friction damping
            enemy.velocity.x *= 0.85;
            enemy.velocity.z *= 0.85;
            enemy.rotVelocity.multiplyScalar(0.75);

            // Lay flat on back/stomach
            enemy.root.rotation.x = THREE.MathUtils.lerp(enemy.root.rotation.x, Math.PI / 2, 0.15);
        }

        // Spin stun stars
        if (enemy.stunStarsGroup && enemy.stunStarsGroup.visible) {
            enemy.stunStarsGroup.rotation.y += delta * 6;
        }

        // Knockdown recovery timer
        enemy.knockdownTimer -= delta;
        if (enemy.knockdownTimer <= 0 && enemy.health > 0) {
            // Stand back up!
            this.recoverEnemy(enemy);
        }
    },

    // Enemy recovers from knockdown
    recoverEnemy(enemy) {
        enemy.isKnockedDown = false;
        enemy.isKnockdownHandled = false;
        enemy.velocity.set(0, 0, 0);
        enemy.rotVelocity.set(0, 0, 0);
        enemy.root.rotation.set(0, enemy.root.rotation.y, 0);
        enemy.root.position.y = 0;
        if (enemy.stunStarsGroup) enemy.stunStarsGroup.visible = false;

        // Reset weapon positions
        if (enemy.spearMesh) {
            enemy.spearMesh.rotation.set(Math.PI / 2.2, 0, 0);
            enemy.spearMesh.position.set(-0.25 * enemy.scale, 0.2 * enemy.scale, 0.5 * enemy.scale);
        }
        if (enemy.shieldMesh) {
            enemy.shieldMesh.rotation.set(0, 0, 0);
        }
    }
};

window.CombatPhysics = CombatPhysics;

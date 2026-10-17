// js/particles.js - Visual Particle Systems (Snow, Sparks, Hoof Plumes, Shockwaves)

class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.sparks = [];
        this.hoofPlumes = [];
        this.shockwaves = [];
        this.floatingTexts = [];

        this.initSnow();
    }

    // 1. Drifting Winter Snowfall
    initSnow() {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 1] = Math.random() * 35;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;

            velocities[i * 3 + 0] = (Math.random() - 0.5) * 1.5;
            velocities[i * 3 + 1] = -(1.5 + Math.random() * 2.5);
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Procedural snowflake canvas texture
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.5, 'rgba(220,240,255,0.8)');
        grad.addColorStop(1, 'rgba(220,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const snowTex = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({
            size: 0.65,
            map: snowTex,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.snowPoints = new THREE.Points(geo, mat);
        this.snowVelocities = velocities;
        this.scene.add(this.snowPoints);
    }

    // 2. Horse Gallop Snow Kick-Up
    spawnHoofKick(pos, direction, isSprint = false) {
        const count = isSprint ? 6 : 3;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.12);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);
            mesh.position.y = 0.15;

            // Velocity kicks backward and upward
            const vel = new THREE.Vector3(
                -direction.x * (2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5,
                1.5 + Math.random() * 2.5,
                -direction.z * (2 + Math.random() * 3) + (Math.random() - 0.5) * 1.5
            );

            this.scene.add(mesh);
            this.hoofPlumes.push({ mesh, vel, life: 0.45, maxLife: 0.45 });
        }
    }

    // 3. Collision / Knock-down Sparks & Debris
    spawnImpactSparks(pos, count = 16) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const color = (i % 2 === 0) ? 0xffcc00 : 0xffffff;
            const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1.0 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(pos);

            const speed = 4 + Math.random() * 8;
            const angle = Math.random() * Math.PI * 2;
            const elevation = (Math.random() - 0.2) * Math.PI;

            const vel = new THREE.Vector3(
                Math.cos(angle) * Math.cos(elevation) * speed,
                Math.sin(elevation) * speed + 2,
                Math.sin(angle) * Math.cos(elevation) * speed
            );

            this.scene.add(mesh);
            this.sparks.push({ mesh, vel, life: 0.6, maxLife: 0.6 });
        }
    }

    // 4. Stomp Shockwave Ring
    spawnShockwave(pos, maxRadius = 9.0) {
        const ringGeo = new THREE.RingGeometry(0.2, 0.6, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.position.copy(pos);
        mesh.position.y = 0.12;

        this.scene.add(mesh);
        this.shockwaves.push({ mesh, radius: 0.5, maxRadius, life: 0.6, maxLife: 0.6 });
    }

    // 5. Floating Text Banner Popup ("KNOCKDOWN!", "TRAMPLE x3!")
    spawnFloatingText(text, pos, color = '#ffd700') {
        const container = document.getElementById('combat-text-layer');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'floating-combat-text';
        el.textContent = text;
        el.style.color = color;
        container.appendChild(el);

        this.floatingTexts.push({
            el,
            pos: pos.clone(),
            time: 0,
            duration: 1.2
        });
    }

    update(delta, camera) {
        // Update Snow
        if (this.snowPoints) {
            const pos = this.snowPoints.geometry.attributes.position;
            const vel = this.snowVelocities;
            for (let i = 0; i < pos.count; i++) {
                let px = pos.getX(i) + vel[i * 3 + 0] * delta;
                let py = pos.getY(i) + vel[i * 3 + 1] * delta;
                let pz = pos.getZ(i) + vel[i * 3 + 2] * delta;

                // Reset snowflake when hitting ground
                if (py < 0.1) {
                    py = 30 + Math.random() * 5;
                    px = (Math.random() - 0.5) * 120;
                    pz = (Math.random() - 0.5) * 120;
                }

                pos.setXYZ(i, px, py, pz);
            }
            pos.needsUpdate = true;
        }

        // Update Hoof Plumes
        for (let i = this.hoofPlumes.length - 1; i >= 0; i--) {
            const p = this.hoofPlumes[i];
            p.life -= delta;
            p.mesh.position.addScaledVector(p.vel, delta);
            p.vel.y -= 9.8 * delta; // Gravity
            p.mesh.material.opacity = p.life / p.maxLife;

            if (p.life <= 0 || p.mesh.position.y < 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.hoofPlumes.splice(i, 1);
            }
        }

        // Update Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.life -= delta;
            s.mesh.position.addScaledVector(s.vel, delta);
            s.vel.y -= 14.0 * delta;
            s.mesh.rotation.x += delta * 10;
            s.mesh.rotation.y += delta * 12;
            s.mesh.material.opacity = s.life / s.maxLife;

            if (s.life <= 0 || s.mesh.position.y < 0) {
                this.scene.remove(s.mesh);
                s.mesh.geometry.dispose();
                s.mesh.material.dispose();
                this.sparks.splice(i, 1);
            }
        }

        // Update Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.life -= delta;
            const progress = 1 - sw.life / sw.maxLife;
            const curScale = 1 + progress * (sw.maxRadius - 1);
            sw.mesh.scale.set(curScale, curScale, 1);
            sw.mesh.material.opacity = (sw.life / sw.maxLife) * 0.8;

            if (sw.life <= 0) {
                this.scene.remove(sw.mesh);
                sw.mesh.geometry.dispose();
                sw.mesh.material.dispose();
                this.shockwaves.splice(i, 1);
            }
        }

        // Update Floating Combat Texts (Project 3D to 2D screen coordinates)
        if (camera) {
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.time += delta;

                // Project 3D pos to screen
                const screenPos = ft.pos.clone();
                screenPos.y += 1.8 + ft.time * 1.5; // Float upwards
                screenPos.project(camera);

                const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

                ft.el.style.left = `${x}px`;
                ft.el.style.top = `${y}px`;
                ft.el.style.opacity = Math.max(0, 1 - (ft.time / ft.duration));
                ft.el.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(ft.time * 6) * 0.15})`;

                if (ft.time >= ft.duration) {
                    ft.el.remove();
                    this.floatingTexts.splice(i, 1);
                }
            }
        }
    }
}

window.ParticleManager = ParticleManager;

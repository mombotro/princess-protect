// js/models.js - Procedural 3D Asset Creation
// Generates stylized 3D models for the Knight on Horse, Princess, Greek Warriors, and Environment.

const AssetFactory = {
    // Shared materials for performance & aesthetics
    materials: null,

    initMaterials() {
        if (this.materials) return;
        this.materials = {
            // Horse & Leather
            horseBrown: new THREE.MeshLambertMaterial({ color: 0x5a341a }),
            horseDark: new THREE.MeshLambertMaterial({ color: 0x331c0e }),
            horseWhite: new THREE.MeshLambertMaterial({ color: 0xede8e1 }),
            horseHoof: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
            leather: new THREE.MeshLambertMaterial({ color: 0x3d2314 }),
            saddleRed: new THREE.MeshLambertMaterial({ color: 0x8b1a1a }),
            goldTrim: new THREE.MeshLambertMaterial({ color: 0xd4af37 }),

            // Bogatyr / Knight
            chainmail: new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.4, metalness: 0.6 }),
            steel: new THREE.MeshStandardMaterial({ color: 0xbac3cb, roughness: 0.3, metalness: 0.8 }),
            redCape: new THREE.MeshLambertMaterial({ color: 0xb21818, side: THREE.DoubleSide }),
            skin: new THREE.MeshLambertMaterial({ color: 0xf3c7a2 }),
            wood: new THREE.MeshLambertMaterial({ color: 0x734824 }),

            // Princess
            princessDress: new THREE.MeshLambertMaterial({ color: 0x9b111e }),
            princessGold: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 }),
            princessHair: new THREE.MeshLambertMaterial({ color: 0xf5d061 }),
            kokoshnikPearl: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
            carpetRed: new THREE.MeshLambertMaterial({ color: 0x6e1018 }),

            // Greeks
            greekBronze: new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.35, metalness: 0.75 }),
            greekCrestRed: new THREE.MeshLambertMaterial({ color: 0x990000 }),
            greekCrestBlack: new THREE.MeshLambertMaterial({ color: 0x111111 }),
            greekTunicWhite: new THREE.MeshLambertMaterial({ color: 0xdedede }),
            greekTunicRed: new THREE.MeshLambertMaterial({ color: 0x800c0c }),
            greekShieldBronze: new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.4, metalness: 0.7 }),
            greekSpearWood: new THREE.MeshLambertMaterial({ color: 0x5c3a21 }),

            // Environment
            snow: new THREE.MeshLambertMaterial({ color: 0xf0f5ff }),
            logWood: new THREE.MeshLambertMaterial({ color: 0x5c3b1e }),
            logRoof: new THREE.MeshLambertMaterial({ color: 0x3d2411 }),
            onionGold: new THREE.MeshStandardMaterial({ color: 0xffb700, roughness: 0.25, metalness: 0.85 }),
            birchBark: new THREE.MeshLambertMaterial({ color: 0xefede6 }),
            pineNeedles: new THREE.MeshLambertMaterial({ color: 0x1c3a27 }),
            fireGlow: new THREE.MeshBasicMaterial({ color: 0xff6600 })
        };
    },

    // ==========================================
    // 1. KNIGHT ON HORSE (BOGATYR)
    // ==========================================
    createKnightAndHorse() {
        this.initMaterials();
        const root = new THREE.Group();
        root.name = 'KnightAndHorse';

        // Orientation wrapper: rotates model so horse's snout points straight forward (+Z)
        const modelWrapper = new THREE.Group();
        modelWrapper.name = 'ModelWrapper';
        modelWrapper.rotation.y = -Math.PI / 2;
        root.add(modelWrapper);

        // --- HORSE ROOT ---
        const horse = new THREE.Group();
        horse.name = 'Horse';
        modelWrapper.add(horse);

        // Torso / Barrel
        const bodyGeo = new THREE.CylinderGeometry(0.55, 0.65, 2.2, 8);
        bodyGeo.rotateZ(Math.PI / 2);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.horseBrown);
        bodyMesh.position.y = 1.35;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        horse.add(bodyMesh);

        // Horse Chest / Shoulder bulk
        const chestGeo = new THREE.SphereGeometry(0.65, 8, 8);
        const chestMesh = new THREE.Mesh(chestGeo, this.materials.horseBrown);
        chestMesh.position.set(0.9, 1.4, 0);
        chestMesh.scale.set(1, 1.1, 0.9);
        chestMesh.castShadow = true;
        horse.add(chestMesh);

        // Horse Rump
        const rumpGeo = new THREE.SphereGeometry(0.65, 8, 8);
        const rumpMesh = new THREE.Mesh(rumpGeo, this.materials.horseBrown);
        rumpMesh.position.set(-0.9, 1.35, 0);
        rumpMesh.scale.set(1, 1, 0.95);
        rumpMesh.castShadow = true;
        horse.add(rumpMesh);

        // Saddle & Caparison (Slavic barde)
        const saddlePadGeo = new THREE.BoxGeometry(1.2, 0.1, 1.1);
        const saddlePad = new THREE.Mesh(saddlePadGeo, this.materials.saddleRed);
        saddlePad.position.set(0.05, 1.72, 0);
        saddlePad.castShadow = true;
        horse.add(saddlePad);

        const saddleGeo = new THREE.BoxGeometry(0.7, 0.25, 0.8);
        const saddle = new THREE.Mesh(saddleGeo, this.materials.leather);
        saddle.position.set(0.05, 1.82, 0);
        horse.add(saddle);

        // Neck (Pivoting node)
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0.85, 1.6, 0);
        horse.add(neckPivot);

        const neckGeo = new THREE.CylinderGeometry(0.3, 0.45, 1.2, 8);
        neckGeo.rotateZ(-Math.PI / 4);
        const neckMesh = new THREE.Mesh(neckGeo, this.materials.horseBrown);
        neckMesh.position.set(0.35, 0.45, 0);
        neckMesh.castShadow = true;
        neckPivot.add(neckMesh);

        // Mane
        const maneGeo = new THREE.BoxGeometry(0.8, 0.4, 0.15);
        const maneMesh = new THREE.Mesh(maneGeo, this.materials.horseDark);
        maneMesh.position.set(0.3, 0.75, 0);
        maneMesh.rotation.z = -Math.PI / 4;
        neckPivot.add(maneMesh);

        // Head
        const headPivot = new THREE.Group();
        headPivot.position.set(0.7, 0.8, 0);
        neckPivot.add(headPivot);

        const headGeo = new THREE.BoxGeometry(0.8, 0.38, 0.38);
        const headMesh = new THREE.Mesh(headGeo, this.materials.horseBrown);
        headMesh.position.set(0.2, -0.05, 0);
        headMesh.castShadow = true;
        headPivot.add(headMesh);

        // Muzzle
        const muzzleGeo = new THREE.BoxGeometry(0.4, 0.3, 0.32);
        const muzzleMesh = new THREE.Mesh(muzzleGeo, this.materials.horseDark);
        muzzleMesh.position.set(0.65, -0.15, 0);
        headPivot.add(muzzleMesh);

        // Ears
        const earGeo = new THREE.ConeGeometry(0.09, 0.3, 4);
        const earL = new THREE.Mesh(earGeo, this.materials.horseBrown);
        earL.position.set(0, 0.22, 0.12);
        earL.rotation.z = -0.2;
        const earR = earL.clone();
        earR.position.z = -0.12;
        headPivot.add(earL);
        headPivot.add(earR);

        // Tail
        const tailPivot = new THREE.Group();
        tailPivot.position.set(-1.15, 1.45, 0);
        horse.add(tailPivot);

        const tailGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.3, 6);
        tailGeo.rotateZ(0.2);
        const tailMesh = new THREE.Mesh(tailGeo, this.materials.horseDark);
        tailMesh.position.set(-0.25, -0.6, 0);
        tailMesh.castShadow = true;
        tailPivot.add(tailMesh);

        // --- 4 LEGS WITH ARTICULATION ---
        const createLeg = (isFront, isLeft) => {
            const legRoot = new THREE.Group();
            const zOffset = isLeft ? 0.38 : -0.38;
            const xOffset = isFront ? 0.8 : -0.8;
            legRoot.position.set(xOffset, 1.25, zOffset);

            // Upper leg
            const upperGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.7, 6);
            const upperMesh = new THREE.Mesh(upperGeo, this.materials.horseBrown);
            upperMesh.position.y = -0.35;
            upperMesh.castShadow = true;
            legRoot.add(upperMesh);

            // Knee pivot
            const knee = new THREE.Group();
            knee.position.set(0, -0.7, 0);
            legRoot.add(knee);

            // Lower leg
            const lowerGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.65, 6);
            const lowerMesh = new THREE.Mesh(lowerGeo, this.materials.horseBrown);
            lowerMesh.position.y = -0.32;
            lowerMesh.castShadow = true;
            knee.add(lowerMesh);

            // Hoof
            const hoofGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.18, 6);
            const hoofMesh = new THREE.Mesh(hoofGeo, this.materials.horseHoof);
            hoofMesh.position.set(0.02, -0.68, 0);
            knee.add(hoofMesh);

            return { root: legRoot, upper: legRoot, knee: knee };
        };

        const legFL = createLeg(true, true);
        const legFR = createLeg(true, false);
        const legBL = createLeg(false, true);
        const legBR = createLeg(false, false);

        horse.add(legFL.root);
        horse.add(legFR.root);
        horse.add(legBL.root);
        horse.add(legBR.root);

        // --- BOGATYR KNIGHT (RIDER) ---
        const knight = new THREE.Group();
        knight.name = 'Knight';
        knight.position.set(0.05, 1.85, 0);
        modelWrapper.add(knight);

        // Torso / Chainmail & Armor Plate
        const torsoGeo = new THREE.BoxGeometry(0.5, 0.75, 0.6);
        const torsoMesh = new THREE.Mesh(torsoGeo, this.materials.chainmail);
        torsoMesh.position.y = 0.45;
        torsoMesh.castShadow = true;
        knight.add(torsoMesh);

        // Gold Slavic Belt & buckle
        const beltGeo = new THREE.BoxGeometry(0.53, 0.12, 0.63);
        const beltMesh = new THREE.Mesh(beltGeo, this.materials.goldTrim);
        beltMesh.position.y = 0.18;
        knight.add(beltMesh);

        // Knight Head & Helmet
        const headNode = new THREE.Group();
        headNode.position.set(0.05, 0.95, 0);
        knight.add(headNode);

        // Face
        const faceGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const faceMesh = new THREE.Mesh(faceGeo, this.materials.skin);
        faceMesh.castShadow = true;
        headNode.add(faceMesh);

        // Conical Slavic Pointed Helmet (Shlem)
        const helmGeo = new THREE.ConeGeometry(0.26, 0.55, 8);
        const helmMesh = new THREE.Mesh(helmGeo, this.materials.steel);
        helmMesh.position.y = 0.28;
        helmMesh.castShadow = true;
        headNode.add(helmMesh);

        // Helmet Spire (Gilded)
        const spireGeo = new THREE.CylinderGeometry(0.02, 0.05, 0.25, 6);
        const spireMesh = new THREE.Mesh(spireGeo, this.materials.goldTrim);
        spireMesh.position.y = 0.6;
        headNode.add(spireMesh);

        // Nose Guard (Nasal)
        const nasalGeo = new THREE.BoxGeometry(0.05, 0.22, 0.05);
        const nasalMesh = new THREE.Mesh(nasalGeo, this.materials.steel);
        nasalMesh.position.set(0.16, -0.02, 0);
        headNode.add(nasalMesh);

        // Flowing Red Cape (Plashch)
        const capePivot = new THREE.Group();
        capePivot.position.set(-0.25, 0.75, 0);
        knight.add(capePivot);

        const capeGeo = new THREE.BoxGeometry(0.1, 1.1, 0.7);
        const capeMesh = new THREE.Mesh(capeGeo, this.materials.redCape);
        capeMesh.position.set(-0.2, -0.5, 0);
        capeMesh.rotation.z = 0.2;
        capeMesh.castShadow = true;
        capePivot.add(capeMesh);

        // Rider Legs (Grip saddle)
        const legRiderLGeo = new THREE.BoxGeometry(0.3, 0.7, 0.2);
        const legRiderL = new THREE.Mesh(legRiderLGeo, this.materials.chainmail);
        legRiderL.position.set(0.1, 0.1, 0.38);
        legRiderL.rotation.x = -0.3;
        knight.add(legRiderL);

        const legRiderR = legRiderL.clone();
        legRiderR.position.z = -0.38;
        legRiderR.rotation.x = 0.3;
        knight.add(legRiderR);

        // Left Arm with Bogatyr Shield
        const armL = new THREE.Group();
        armL.position.set(0.1, 0.65, 0.38);
        knight.add(armL);

        const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.18), this.materials.chainmail);
        armLMesh.position.set(0.15, 0, 0);
        armL.add(armLMesh);

        // Teardrop / Kite Shield (Shchit)
        const shieldGeo = new THREE.CylinderGeometry(0.45, 0.15, 1.1, 8);
        shieldGeo.rotateZ(Math.PI / 2);
        const shieldMesh = new THREE.Mesh(shieldGeo, this.materials.saddleRed);
        shieldMesh.position.set(0.28, -0.1, 0.15);
        shieldMesh.rotation.y = -0.3;
        shieldMesh.castShadow = true;
        armL.add(shieldMesh);

        // Shield Golden Sun Boss
        const sunBoss = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), this.materials.goldTrim);
        sunBoss.position.set(0.35, -0.05, 0.15);
        armL.add(sunBoss);

        // Right Arm with Mighty Lance
        const armR = new THREE.Group();
        armR.position.set(0.1, 0.65, -0.38);
        knight.add(armR);

        const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.18), this.materials.chainmail);
        armRMesh.position.set(0.15, 0, 0);
        armR.add(armRMesh);

        // Lance Pivot (for thrusting, couching, sweeping)
        const lancePivot = new THREE.Group();
        lancePivot.position.set(0.35, 0, 0);
        lancePivot.rotation.z = 0.35; // Resting semi-upright
        armR.add(lancePivot);

        // Lance Pole
        const lancePoleGeo = new THREE.CylinderGeometry(0.045, 0.055, 3.8, 8);
        lancePoleGeo.rotateZ(Math.PI / 2);
        const lancePole = new THREE.Mesh(lancePoleGeo, this.materials.wood);
        lancePole.position.set(1.2, 0, 0);
        lancePole.castShadow = true;
        lancePivot.add(lancePole);

        // Lance Steel Spearhead
        const tipGeo = new THREE.ConeGeometry(0.1, 0.5, 6);
        tipGeo.rotateZ(-Math.PI / 2);
        const tipMesh = new THREE.Mesh(tipGeo, this.materials.steel);
        tipMesh.position.set(3.15, 0, 0);
        tipMesh.castShadow = true;
        lancePivot.add(tipMesh);

        // Pennon / Banner (Red & Gold Slavic flag on spear)
        const flagGeo = new THREE.BoxGeometry(0.65, 0.35, 0.03);
        const flagMesh = new THREE.Mesh(flagGeo, this.materials.saddleRed);
        flagMesh.position.set(2.6, -0.18, 0);
        lancePivot.add(flagMesh);

        return {
            root,
            horse,
            knight,
            lancePivot,
            armR,
            capePivot,
            neckPivot,
            headPivot,
            tailPivot,
            legs: { fl: legFL, fr: legFR, bl: legBL, br: legBR }
        };
    },

    // ==========================================
    // 2. RUSSIAN PRINCESS & ROYAL SANCTUARY
    // ==========================================
    createPrincess() {
        this.initMaterials();
        const root = new THREE.Group();
        root.name = 'PrincessSanctuary';

        // Building Group (for dynamic camera see-through transparency)
        const buildingGroup = new THREE.Group();
        buildingGroup.name = 'PrincessBuilding';
        root.add(buildingGroup);

        const makeTransMat = (baseMat) => {
            const m = baseMat.clone();
            m.transparent = true;
            m.opacity = 1.0;
            return m;
        };

        // Sanctuary Platform (Raised wooden dais with Slavic carved steps)
        const daisGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.8, 16);
        const daisMesh = new THREE.Mesh(daisGeo, makeTransMat(this.materials.logWood));
        daisMesh.position.y = 0.4;
        daisMesh.receiveShadow = true;
        buildingGroup.add(daisMesh);

        // Royal Red Carpet
        const carpetGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.82, 16);
        const carpetMesh = new THREE.Mesh(carpetGeo, makeTransMat(this.materials.carpetRed));
        carpetMesh.position.y = 0.41;
        carpetMesh.receiveShadow = true;
        buildingGroup.add(carpetMesh);

        // Ornate Russian Pavilion Pillars & Roof (Terem Gate)
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            const px = Math.cos(angle) * 3.2;
            const pz = Math.sin(angle) * 3.2;

            const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.8, 8);
            const pillar = new THREE.Mesh(pillarGeo, makeTransMat(this.materials.logWood));
            pillar.position.set(px, 2.3, pz);
            pillar.castShadow = true;
            buildingGroup.add(pillar);
        }

        // Pavilion Roof & Golden Onion Dome
        const roofGeo = new THREE.ConeGeometry(3.8, 2.0, 8);
        const roof = new THREE.Mesh(roofGeo, makeTransMat(this.materials.logRoof));
        roof.position.set(0, 4.8, 0);
        roof.castShadow = true;
        buildingGroup.add(roof);

        const domeGeo = new THREE.SphereGeometry(1.2, 12, 12);
        domeGeo.scale(1, 1.6, 1);
        const dome = new THREE.Mesh(domeGeo, makeTransMat(this.materials.onionGold));
        dome.position.set(0, 6.4, 0);
        dome.castShadow = true;
        buildingGroup.add(dome);

        // Golden Russian Cross atop dome
        const crossVert = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), makeTransMat(this.materials.onionGold));
        crossVert.position.set(0, 8.4, 0);
        const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.12), makeTransMat(this.materials.onionGold));
        crossHoriz.position.set(0, 8.5, 0);
        buildingGroup.add(crossVert);
        buildingGroup.add(crossHoriz);

        // Protective Sanctuary Aura (Translucent Golden dome)
        const auraGeo = new THREE.SphereGeometry(3.8, 16, 12);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.15,
            wireframe: false,
            side: THREE.DoubleSide
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);
        auraMesh.position.y = 1.2;
        root.add(auraMesh);

        // --- PRINCESS FIGURE (KNYAZHNA MILENA) ---
        const princess = new THREE.Group();
        princess.name = 'Princess';
        princess.position.set(0, 0.82, 0);
        root.add(princess);

        // Royal Sarafan Dress (Cone bell gown)
        const dressGeo = new THREE.CylinderGeometry(0.3, 0.85, 1.7, 12);
        const dress = new THREE.Mesh(dressGeo, this.materials.princessDress);
        dress.position.y = 0.85;
        dress.castShadow = true;
        princess.add(dress);

        // Golden Embroidered Front Placket
        const placketGeo = new THREE.BoxGeometry(0.14, 1.65, 0.05);
        const placket = new THREE.Mesh(placketGeo, this.materials.princessGold);
        placket.position.set(0, 0.85, 0.55);
        princess.add(placket);

        // Fur Hem Trim
        const furHemGeo = new THREE.CylinderGeometry(0.86, 0.9, 0.2, 12);
        const furHem = new THREE.Mesh(furHemGeo, this.materials.horseWhite);
        furHem.position.y = 0.1;
        princess.add(furHem);

        // Torso / Bodice
        const bodiceGeo = new THREE.BoxGeometry(0.45, 0.5, 0.35);
        const bodice = new THREE.Mesh(bodiceGeo, this.materials.princessDress);
        bodice.position.y = 1.85;
        bodice.castShadow = true;
        princess.add(bodice);

        // Princess Head
        const headNode = new THREE.Group();
        headNode.position.set(0, 2.25, 0);
        princess.add(headNode);

        const faceGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const face = new THREE.Mesh(faceGeo, this.materials.skin);
        headNode.add(face);

        // Golden Braided Hair
        const braidGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.2, 6);
        const braidL = new THREE.Mesh(braidGeo, this.materials.princessHair);
        braidL.position.set(0.18, -0.4, 0.1);
        headNode.add(braidL);

        // Ornate Kokoshnik Crown (Crescent Headdress)
        const crownShape = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12, 1, false, 0, Math.PI);
        crownShape.rotateX(Math.PI / 2);
        crownShape.scale(1.2, 1.5, 1.0);
        const crown = new THREE.Mesh(crownShape, this.materials.princessGold);
        crown.position.set(0, 0.22, -0.05);
        crown.castShadow = true;
        headNode.add(crown);

        // Pearls / Gemstones on Crown
        const jewelGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const jewel = new THREE.Mesh(jewelGeo, this.materials.kokoshnikPearl);
        jewel.position.set(0, 0.48, 0.05);
        headNode.add(jewel);

        // Princess Arms (Cheering / Praying pivots)
        const armL = new THREE.Group();
        armL.position.set(0.28, 1.95, 0);
        princess.add(armL);
        const armR = new THREE.Group();
        armR.position.set(-0.28, 1.95, 0);
        princess.add(armR);

        const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.6, 6), this.materials.horseWhite);
        sleeveL.position.y = -0.28;
        armL.add(sleeveL);

        const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.6, 6), this.materials.horseWhite);
        sleeveR.position.y = -0.28;
        armR.add(sleeveR);

        return {
            root,
            buildingGroup,
            princess,
            headNode,
            armL,
            armR,
            auraMesh
        };
    },

    // ==========================================
    // 3. GREEK WARRIORS (HOPLITE, PELTAST, CHAMPION)
    // ==========================================
    createGreekWarrior(type = 'hoplite') {
        this.initMaterials();
        const root = new THREE.Group();
        root.name = `Greek_${type}`;

        const isChampion = (type === 'champion');
        const isPeltast = (type === 'peltast');
        const scale = isChampion ? 1.25 : (isPeltast ? 0.95 : 1.0);

        // --- TORSO ---
        const tunicMat = isChampion ? this.materials.greekTunicRed : this.materials.greekTunicWhite;
        const armorMat = isChampion ? this.materials.onionGold : this.materials.greekBronze;

        const torsoGeo = new THREE.BoxGeometry(0.48 * scale, 0.65 * scale, 0.32 * scale);
        const torso = new THREE.Mesh(torsoGeo, isPeltast ? tunicMat : armorMat);
        torso.position.y = 1.0 * scale;
        torso.castShadow = true;
        root.add(torso);

        // Pteruges (Leather armor skirt flaps)
        const skirtGeo = new THREE.CylinderGeometry(0.28 * scale, 0.38 * scale, 0.35 * scale, 8);
        const skirt = new THREE.Mesh(skirtGeo, tunicMat);
        skirt.position.y = 0.65 * scale;
        root.add(skirt);

        // --- HEAD & CORINTHIAN HELMET ---
        const headNode = new THREE.Group();
        headNode.position.set(0, 1.45 * scale, 0);
        root.add(headNode);

        // Bronze Helmet
        const helmGeo = new THREE.SphereGeometry(0.22 * scale, 8, 8);
        const helm = new THREE.Mesh(helmGeo, armorMat);
        headNode.add(helm);

        // Face opening / Eyes cut
        const faceVisor = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.12 * scale, 0.1 * scale), this.materials.greekCrestBlack);
        faceVisor.position.set(0, -0.05 * scale, 0.16 * scale);
        headNode.add(faceVisor);

        // Helmet Crest (Horsehair Brush Plume)
        const crestMat = isChampion ? this.materials.goldTrim : this.materials.greekCrestRed;
        const crestGeo = isChampion
            ? new THREE.BoxGeometry(0.55 * scale, 0.28 * scale, 0.12 * scale) // Transverse crest for champion
            : new THREE.BoxGeometry(0.12 * scale, 0.28 * scale, 0.55 * scale); // Classic fore-aft crest

        const crest = new THREE.Mesh(crestGeo, crestMat);
        crest.position.y = 0.28 * scale;
        crest.castShadow = true;
        headNode.add(crest);

        // --- LEGS ---
        const legL = new THREE.Group();
        legL.position.set(0.15 * scale, 0.6 * scale, 0);
        root.add(legL);

        const legR = new THREE.Group();
        legR.position.set(-0.15 * scale, 0.6 * scale, 0);
        root.add(legR);

        const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.08 * scale, 0.6 * scale, 6), this.materials.skin);
        legMeshL.position.y = -0.3 * scale;
        legMeshL.castShadow = true;
        legL.add(legMeshL);

        // Bronze Greave (Shin armor)
        const greaveL = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.09 * scale, 0.35 * scale, 6), armorMat);
        greaveL.position.y = -0.32 * scale;
        legL.add(greaveL);

        const legMeshR = legMeshL.clone();
        legR.add(legMeshR);
        const greaveR = greaveL.clone();
        legR.add(greaveR);

        // --- ARMS & WEAPONS ---
        // Left Arm: Aspis Shield
        const armL = new THREE.Group();
        armL.position.set(0.32 * scale, 1.25 * scale, 0);
        root.add(armL);

        const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.07 * scale, 0.5 * scale, 6), this.materials.skin);
        armMeshL.position.set(0.15 * scale, -0.15 * scale, 0.1 * scale);
        armMeshL.rotation.z = -0.4;
        armL.add(armMeshL);

        // Round Bronze Aspis (Hoplon) Shield
        const shieldRadius = isPeltast ? 0.35 * scale : (isChampion ? 0.65 * scale : 0.52 * scale);
        const shieldGeo = new THREE.CylinderGeometry(shieldRadius, shieldRadius, 0.08 * scale, 12);
        shieldGeo.rotateX(Math.PI / 2);
        const shieldMesh = new THREE.Mesh(shieldGeo, this.materials.greekShieldBronze);
        shieldMesh.position.set(0.3 * scale, -0.1 * scale, 0.25 * scale);
        shieldMesh.castShadow = true;
        armL.add(shieldMesh);

        // Shield Emblem (Lambda or Medusa face)
        const emblemGeo = new THREE.CylinderGeometry(shieldRadius * 0.45, shieldRadius * 0.45, 0.09 * scale, 3);
        emblemGeo.rotateX(Math.PI / 2);
        const emblemMesh = new THREE.Mesh(emblemGeo, this.materials.greekCrestRed);
        emblemMesh.position.set(0.3 * scale, -0.1 * scale, 0.26 * scale);
        armL.add(emblemMesh);

        // Right Arm: Dory Spear or Javelin
        const armR = new THREE.Group();
        armR.position.set(-0.32 * scale, 1.25 * scale, 0);
        root.add(armR);

        const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.07 * scale, 0.5 * scale, 6), this.materials.skin);
        armMeshR.position.set(-0.15 * scale, -0.15 * scale, 0.1 * scale);
        armMeshR.rotation.z = 0.4;
        armR.add(armMeshR);

        // Greek Dory Spear
        const spearLength = isPeltast ? 1.6 * scale : (isChampion ? 3.2 * scale : 2.5 * scale);
        const spearGeo = new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, spearLength, 6);
        const spearMesh = new THREE.Mesh(spearGeo, this.materials.greekSpearWood);
        spearMesh.position.set(-0.25 * scale, 0.2 * scale, 0.5 * scale);
        spearMesh.rotation.x = Math.PI / 2.2;
        spearMesh.castShadow = true;
        armR.add(spearMesh);

        const spearTipGeo = new THREE.ConeGeometry(0.07 * scale, 0.35 * scale, 4);
        const spearTip = new THREE.Mesh(spearTipGeo, this.materials.steel);
        spearTip.position.y = spearLength / 2;
        spearMesh.add(spearTip);

        // Dizzy / Knocked Down Stun Stars
        const stunStarsGroup = new THREE.Group();
        stunStarsGroup.position.set(0, 1.85 * scale, 0);
        stunStarsGroup.visible = false;
        root.add(stunStarsGroup);

        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const starMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 * scale), this.materials.goldTrim);
            starMesh.position.set(Math.cos(angle) * 0.4 * scale, 0, Math.sin(angle) * 0.4 * scale);
            stunStarsGroup.add(starMesh);
        }

        return {
            root,
            torso,
            headNode,
            legL,
            legR,
            armL,
            armR,
            shieldMesh,
            spearMesh,
            stunStarsGroup,
            type,
            scale,
            isKnockedDown: false,
            knockdownTimer: 0,
            velocity: new THREE.Vector3(),
            rotVelocity: new THREE.Vector3()
        };
    },

    // ==========================================
    // 4. ENVIRONMENT: KREMLIN, BIRCH TREES, SNOW
    // ==========================================
    createEnvironment(scene) {
        this.initMaterials();

        // 1. Snow Terrain
        const groundGeo = new THREE.PlaneGeometry(240, 240, 32, 32);
        // Add gentle snow drifts to vertices
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            // Center is flatter for smooth horse galloping
            const noise = (Math.sin(x * 0.08) + Math.cos(y * 0.08)) * 0.6;
            const rimElevation = Math.max(0, (dist - 40) * 0.08);
            pos.setZ(i, noise + rimElevation);
        }
        groundGeo.computeVertexNormals();
        groundGeo.rotateX(-Math.PI / 2);

        const groundMesh = new THREE.Mesh(groundGeo, this.materials.snow);
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);

        // 2. Russian Palisade Wooden Walls (Kremlin perimeter)
        const wallGroup = new THREE.Group();
        scene.add(wallGroup);

        const radius = 55;
        const totalLogs = 70;
        for (let i = 0; i < totalLogs; i++) {
            const angle = (i / totalLogs) * Math.PI * 2;
            // Leave 4 gates open for enemy invaders (North, South, East, West)
            const isGate = Math.abs(angle) < 0.2 ||
                           Math.abs(angle - Math.PI / 2) < 0.2 ||
                           Math.abs(angle - Math.PI) < 0.2 ||
                           Math.abs(angle - Math.PI * 1.5) < 0.2;

            if (isGate) continue;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const height = 4.5 + Math.sin(i * 3) * 0.4;

            const logGeo = new THREE.CylinderGeometry(0.35, 0.4, height, 6);
            const logMesh = new THREE.Mesh(logGeo, this.materials.logWood);
            logMesh.position.set(x, height / 2, z);
            logMesh.castShadow = true;
            wallGroup.add(logMesh);

            // Spiked top
            const spikeGeo = new THREE.ConeGeometry(0.35, 0.8, 6);
            const spike = new THREE.Mesh(spikeGeo, this.materials.logWood);
            spike.position.set(x, height + 0.4, z);
            wallGroup.add(spike);
        }

        // 3. Watchtowers at the 4 Gates
        const gateAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
        gateAngles.forEach((gateAngle) => {
            [-0.28, 0.28].forEach((offset) => {
                const angle = gateAngle + offset;
                const tx = Math.cos(angle) * radius;
                const tz = Math.sin(angle) * radius;

                // Tower base
                const towerGeo = new THREE.BoxGeometry(3.5, 7, 3.5);
                const tower = new THREE.Mesh(towerGeo, this.materials.logWood);
                tower.position.set(tx, 3.5, tz);
                tower.castShadow = true;
                wallGroup.add(tower);

                // Tower Conical Roof
                const roofGeo = new THREE.ConeGeometry(2.8, 3.2, 4);
                roofGeo.rotateY(Math.PI / 4);
                const troof = new THREE.Mesh(roofGeo, this.materials.logRoof);
                troof.position.set(tx, 8.6, tz);
                troof.castShadow = true;
                wallGroup.add(troof);
            });
        });

        // 4. Russian Birch & Snowy Pine Trees
        const treeGroup = new THREE.Group();
        treeGroup.name = 'TreeGroup';
        scene.add(treeGroup);

        const trees = [];

        const makeBirchTree = (x, z) => {
            const tree = new THREE.Group();
            tree.position.set(x, 0, z);

            const trunkHeight = 6 + Math.random() * 2.5;
            const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, trunkHeight, 6);
            const trunkMat = this.materials.birchBark.clone();
            trunkMat.transparent = true;
            trunkMat.opacity = 1.0;
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            tree.add(trunk);

            // Foliage / Canopy
            const crownGeo = new THREE.SphereGeometry(1.6 + Math.random() * 0.5, 7, 6);
            crownGeo.scale(1, 1.4, 1);
            const crownMat = this.materials.pineNeedles.clone();
            crownMat.transparent = true;
            crownMat.opacity = 1.0;
            const crown = new THREE.Mesh(crownGeo, crownMat);
            crown.position.y = trunkHeight + 0.8;
            crown.castShadow = true;
            tree.add(crown);

            // Snow layer on top of tree
            const snowGeo = new THREE.ConeGeometry(1.6, 0.8, 6);
            const snowMat = this.materials.snow.clone();
            snowMat.transparent = true;
            snowMat.opacity = 1.0;
            const snowCap = new THREE.Mesh(snowGeo, snowMat);
            snowCap.position.y = trunkHeight + 2.0;
            tree.add(snowCap);

            trees.push({
                root: tree,
                pos: new THREE.Vector3(x, 0, z),
                meshes: [trunk, crown, snowCap]
            });

            return tree;
        };

        // Scatter birch trees outside the central arena
        for (let i = 0; i < 45; i++) {
            const dist = 14 + Math.random() * 80;
            // Keep center open
            if (dist < 12) continue;
            const angle = Math.random() * Math.PI * 2;
            const tx = Math.cos(angle) * dist;
            const tz = Math.sin(angle) * dist;
            treeGroup.add(makeBirchTree(tx, tz));
        }

        // 5. Fire Braziers / Torches lighting the arena
        const brazierPositions = [
            { x: 8, z: 8 }, { x: -8, z: 8 }, { x: 8, z: -8 }, { x: -8, z: -8 },
            { x: 18, z: 0 }, { x: -18, z: 0 }, { x: 0, z: 18 }, { x: 0, z: -18 }
        ];

        brazierPositions.forEach((pos) => {
            const brazier = new THREE.Group();
            brazier.position.set(pos.x, 0, pos.z);

            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.2, 6), this.materials.logWood);
            post.position.y = 1.1;
            post.castShadow = true;
            brazier.add(post);

            const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.25, 0.4, 8), this.materials.greekBronze);
            bowl.position.y = 2.3;
            brazier.add(bowl);

            const fire = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), this.materials.fireGlow);
            fire.position.y = 2.65;
            brazier.add(fire);

            // Warm flickering torch point light
            const torchLight = new THREE.PointLight(0xff7722, 1.2, 18, 1.8);
            torchLight.position.set(0, 2.8, 0);
            brazier.add(torchLight);

            scene.add(brazier);
        });

        return {
            wallGroup,
            treeGroup,
            trees
        };
    }
};

window.AssetFactory = AssetFactory;

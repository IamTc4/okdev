// Simplex Noise Implementation (Embedded for standalone use)
class SimplexNoise {
    constructor() {
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        this.perm = [];
        for(let i=0; i<512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    dot(g, x, y, z) {
        return g[0]*x + g[1]*y + g[2]*z;
    }

    noise(xin, yin, zin) {
        let n0, n1, n2, n3;
        const F3 = 1.0/3.0;
        const s = (xin+yin+zin)*F3;
        const i = Math.floor(xin+s);
        const j = Math.floor(yin+s);
        const k = Math.floor(zin+s);
        const G3 = 1.0/6.0;
        const t = (i+j+k)*G3;
        const X0 = i-t;
        const Y0 = j-t;
        const Z0 = k-t;
        const x0 = xin-X0;
        const y0 = yin-Y0;
        const z0 = zin-Z0;

        let i1, j1, k1;
        let i2, j2, k2;
        if(x0>=y0) {
            if(y0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
            else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
            else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
            if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
            else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
            else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }

        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0*G3;
        const y2 = y0 - j2 + 2.0*G3;
        const z2 = z0 - k2 + 2.0*G3;
        const x3 = x0 - 1.0 + 3.0*G3;
        const y3 = y0 - 1.0 + 3.0*G3;
        const z3 = z0 - 1.0 + 3.0*G3;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;

        const gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12;
        const gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12;
        const gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12;
        const gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12;

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        if(t0<0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
        }

        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        if(t1<0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
        }

        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        if(t2<0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
        }

        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        if(t3<0) n3 = 0.0;
        else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
        }

        return 32.0*(n0 + n1 + n2 + n3);
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
});

function initThreeJS() {
    // Check if container exists, if not create it
    let container = document.getElementById('three-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'three-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '-4';
        container.style.pointerEvents = 'none'; // Allow clicks to pass through
        document.body.prepend(container);
    }

    const scene = new THREE.Scene();
    // Add some fog for depth blending
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // --- 1. Liquid Blob (Morphing Sphere) ---
    const isMobile = window.innerWidth < 768;
    const detail = isMobile ? 64 : 128;
    const geometry = new THREE.SphereGeometry(2, detail, detail);

    // Store original positions for morphing reference
    const originalPositions = [];
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        originalPositions.push(new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        ));
    }

    // Glass-like / Liquid Metal Material
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x5FF7FF,       // Cyan base
        emissive: 0x000000,
        roughness: 0.1,        // Shiny
        metalness: 0.2,        // Slightly metallic
        reflectivity: 0.8,
        transmission: 0.6,     // Semi-transparent (glass-like)
        thickness: 1.5,        // Refraction volume
        clearcoat: 1.0,        // Polish
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        flatShading: false
    });

    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // --- 2. Ambient Particles (Starfield/Dust) ---
    const particleCount = isMobile ? 500 : 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for(let i=0; i<particleCount * 3; i++) {
        particlePositions[i] = (Math.random() - 0.5) * 50;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x5FF7FF,
        size: 0.1,
        map: sprite,
        transparent: true,
        opacity: 0.4,
        alphaTest: 0.5,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- 3. Lighting ---
    // Ambient light for base visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Key light (Cyan/Blue)
    const light1 = new THREE.PointLight(0x5FF7FF, 1.5, 20);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    // Fill light (Purple/Pink to create gradient reflection)
    const light2 = new THREE.PointLight(0xbd00ff, 1.2, 20);
    light2.position.set(-5, -3, 2);
    scene.add(light2);

    // Rim light (White/Bright)
    const light3 = new THREE.DirectionalLight(0xffffff, 1);
    light3.position.set(0, 10, -5);
    scene.add(light3);


    // --- 4. Animation & Noise ---
    const simplex = new SimplexNoise();
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.003; // Speed of morphing

        // --- Morphing Logic ---
        const positions = blob.geometry.attributes.position;
        const k = 1.5; // Noise frequency
        const amp = 0.4; // Noise amplitude

        for (let i = 0; i < positions.count; i++) {
            const orig = originalPositions[i];
            // 3D Noise based on position and time
            const noiseValue = simplex.noise(
                orig.x * k + time,
                orig.y * k + time,
                orig.z * k + time
            );

            // Displace vertex along its normal (which for a sphere is just its normalized position)
            // We approximate by scaling the original vector
            const displacement = 1 + noiseValue * amp;

            positions.setXYZ(
                i,
                orig.x * displacement,
                orig.y * displacement,
                orig.z * displacement
            );
        }

        blob.geometry.attributes.position.needsUpdate = true;
        // Recompute normals for correct lighting on distorted mesh
        blob.geometry.computeVertexNormals();

        // Slow rotation
        blob.rotation.y += 0.002;
        blob.rotation.z += 0.001;

        particles.rotation.y -= 0.0002;

        renderer.render(scene, camera);
    }

    animate();


    // --- 5. Responsiveness ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


    // --- 6. GSAP Scroll Interactions (Camera Fly-through) ---
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate the Blob: Move it as we scroll to interact with content
        // Initial State: Center
        // Section 1: Move Left
        // Section 2: Move Right, Change Color?

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5 // Smooth scrubbing
            }
        });

        tl.to(blob.position, {
            x: 3,
            y: -2,
            z: -2,
            duration: 5
        })
        .to(blob.rotation, {
            x: Math.PI,
            y: Math.PI * 2,
            duration: 5
        }, "<")
        .to(camera.position, {
            z: 4, // Zoom slightly in/out
            y: -3,
            duration: 5
        }, "<")
        // Mid-page interaction
        .to(blob.position, {
            x: -3,
            y: -8, // Move further down
            z: 0,
            duration: 5
        })
        .to(blob.material.color, {
            r: 0.2, g: 0.5, b: 1, // Shift slightly blue/purple
            duration: 5
        }, "<")
        // End of page interaction
        .to(blob.position, {
            x: 0,
            y: -15,
            z: -5,
            duration: 5
        });

        // Particles parallax
        gsap.to(particles.position, {
            y: 10,
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    }
}

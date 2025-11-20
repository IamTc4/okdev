
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let width, height;
let hexagons = [];
const hexSize = 20;
const hexWidth = hexSize * Math.sqrt(3);
const hexHeight = hexSize * 2;
const numCols = 50;
const numRows = 50;

const mouse = {
    x: undefined,
    y: undefined,
    radius: 150
};

const colors = ['#5FF7FF', '#40E0D0', '#00CED1', '#20B2AA', '#008B8B'];

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    hexagons = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * hexWidth + (row % 2) * (hexWidth / 2);
            const y = row * (hexHeight * 0.75);
            hexagons.push(new Hexagon(x, y));
        }
    }
}

class Hexagon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = hexSize;
        this.baseColor = 'rgba(10, 10, 10, 0.5)';
        this.color = this.baseColor;
        this.targetColor = this.baseColor;
        this.colorSpeed = 0.05;
    }

    draw() {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x_i = this.x + this.size * Math.cos(angle);
            const y_i = this.y + this.size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(x_i, y_i);
            } else {
                ctx.lineTo(x_i, y_i);
            }
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const index = Math.floor(distance / mouse.radius * colors.length);
            this.targetColor = colors[index];
        } else {
            this.targetColor = this.baseColor;
        }

        const parseColor = (color) => {
            if (color.startsWith('#')) {
                return [
                    parseInt(color.slice(1, 3), 16),
                    parseInt(color.slice(3, 5), 16),
                    parseInt(color.slice(5, 7), 16),
                    1
                ];
            }
            if (color.startsWith('rgba')) {
                return color.substring(5, color.length - 1).split(',').map(s => parseFloat(s.trim()));
            }
            if (color.startsWith('rgb')) {
                const values = color.substring(4, color.length - 1).split(',').map(s => parseFloat(s.trim()));
                return [values[0], values[1], values[2], 1];
            }
            return [0,0,0,0]; // Should not happen
        };

        const currentColor = parseColor(this.color);
        const targetColor = parseColor(this.targetColor);

        const r = currentColor[0] + (targetColor[0] - currentColor[0]) * this.colorSpeed;
        const g = currentColor[1] + (targetColor[1] - currentColor[1]) * this.colorSpeed;
        const b = currentColor[2] + (targetColor[2] - currentColor[2]) * this.colorSpeed;
        const a = currentColor[3] + (targetColor[3] - currentColor[3]) * this.colorSpeed;

        this.color = `rgba(${r}, ${g}, ${b}, ${a})`;

        this.draw();
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const hex of hexagons) {
        hex.update();
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

init();
animate();

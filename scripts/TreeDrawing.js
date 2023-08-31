const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let w = canvas.offsetWidth;
let h = canvas.offsetHeight;

canvas.width = w;
canvas.height = h;

let cashTree;

const ADD_R = -Math.PI / 2;
const SHIFT_MUL = 0.55;
const ANGLE_MUL = 0.1;
const TWOPI = Math.PI * 2;
const COLOR_SHIFT = 15;
const DRAWING_SHIFT = 0.1;
const cizesLvls = [20, 18, 16, 14, 12, 10, 8, 6, 4, 2];

function draw(tree) {
    ctx.clearRect(0, 0, w, h);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    cashTree = tree;
    let agents = [[w / 2, h * 0.9, 0, tree[0][2], tree[0][6], tree[0][7], tree[0][8]]];
    let _agnts = [];

    for (let genInd = 0; genInd < tree.length; genInd++) {
        let gen = tree[genInd];
        let branches = gen[14];
        let angleSize = gen[15] / (branches + 1);

        for (let agInd = 0; agInd < agents.length; agInd++) {
            let a = agents[agInd];

            let length = gen[0] + rand(gen[1]);
            let size = (a[3] - gen[2]) * gen[4] / 100 + gen[2];
            size = (cizesLvls[4] - size) * gen[5] / 100 + size;

            let r = (a[4] - gen[6]) * gen[12] / 100 + gen[6] + rand(gen[13] * 2) - gen[13];
            let g = (a[5] - gen[7]) * gen[12] / 100 + gen[7] + rand(gen[13] * 2) - gen[13];
            let b = (a[6] - gen[8]) * gen[12] / 100 + gen[8] + rand(gen[13] * 2) - gen[13];

            let turn = gen[17] * ANGLE_MUL;

            let addSize = (gen[3] - size) / length;
            
            for (let step = 0; step < length; step++) {
                
                drawCircle(a[0], a[1], size, r, g, b);
                
                size += addSize;
                r += gen[9];
                g += gen[10];
                b += gen[11];
                
                a[2] += turn + rand(gen[18] * 2) - gen[18];
                
                while (a[2] > 180) {
                    a[2] -= 180;
                }
                
                while (a[2] < -180) {
                    a[2] += 180;
                }
                
                if ((gen[19] < 0) && (180 - Math.abs(a[2]) < -gen[19] * ANGLE_MUL)) {
                    a[2] = 180;
                } else if ((gen[19] > 0) && (Math.abs(a[2]) < gen[19] * ANGLE_MUL)) {
                    a[2] = 0;
                } else {
                    if (a[2] < 0) {
                        a[2] += gen[19] * ANGLE_MUL;
                    } else if (a[2] > 0) {
                        a[2] -= gen[19] * ANGLE_MUL;
                    }
                }
                
                a[0] += Math.cos(a[2] / 180 * Math.PI + ADD_R) * Math.abs(size) * SHIFT_MUL;
                a[1] += Math.sin(a[2] / 180 * Math.PI + ADD_R) * Math.abs(size) * SHIFT_MUL;
            }

            let angle = (-gen[15] / 2 + angleSize);
            
            for (let i = 0; i < branches; i++) {
                _agnts.push([a[0], a[1], a[2] + angle + rand(gen[16] * 2) - gen[16], size, r, g, b]);
                angle += angleSize;
            }
        }
        agents = _agnts;
        _agnts = [];
    }
}

addEventListener('resize', () => {
    if (SETTINGS.autoRedraw) {
        redraw();
    }
});

function redraw() {
    if (cashTree) draw(cashTree);
}

function rand(n) {
    return Math.floor(Math.random() * n);
}

function drawCircle(x, y, size, r, g, b) {
    size = Math.abs(size);

    ctx.fillStyle = `rgb(${Math.max(r - COLOR_SHIFT, 0)}, ${Math.max(g - COLOR_SHIFT, 0)}, ${Math.max(b - COLOR_SHIFT, 0)})`;
    ctx.beginPath();
    ctx.arc(x - size * DRAWING_SHIFT, y - size * DRAWING_SHIFT, size, 0, TWOPI);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${Math.min(r + COLOR_SHIFT, 255)}, ${Math.min(g + COLOR_SHIFT, 255)}, ${Math.min(b + COLOR_SHIFT, 255)})`;
    ctx.beginPath();
    ctx.arc(x + size * DRAWING_SHIFT, y + size * DRAWING_SHIFT, size, 0, TWOPI);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TWOPI);
    ctx.closePath();
    ctx.fill();
}
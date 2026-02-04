const canvas = document.getElementById('webgl');
const ctx = canvas.getContext('2d');

// 调整大小
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// 线条粒子
const lines = [];
for(let i = 0; i < 50; i++) {
    lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 100 + 50,
        v: Math.random() * 2 + 1
    });
}

function draw() {
    // 关键：给上一帧留一点阴影，产生拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#4f46e5'; // 你的 CBS 标志性紫色
    ctx.lineWidth = 2;

    lines.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.len);
        ctx.stroke();

        l.y += l.v; // 向下移动
        if (l.y > canvas.height) {
            l.y = -l.len;
            l.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(draw);
}

draw();
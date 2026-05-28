/**
 * 等高模型交互演示 - 核心逻辑
 * 正确结构：A、B、C在同一直线上，D为公共顶点
 * 三角形ABD和三角形BCD共用顶点D
 * 支持共线模式和自由模式
 */

// ============ 全局变量 ============
let canvas, ctx;
let canvasWidth, canvasHeight;

// 三角形顶点 - A、B、C在同一直线，D为公共顶点
let pointA = { x: 0, y: 0 };   // 底边左端点
let pointB = { x: 0, y: 0 };   // 底边中间点（分割点）
let pointC = { x: 0, y: 0 };   // 底边右端点
let pointD = { x: 0, y: 0 };   // 公共顶点

// 可拖动点的识别范围
const DRAG_RADIUS = 15;

// 当前拖动状态
let isDragging = false;
let dragTarget = null; // 'A', 'B', 'C', 'D', or null

// 共线模式开关
let lineMode = true;  // true=共线模式, false=自由模式

// 颜色定义
const COLORS = {
    triangle1: '#A7D7FF',      // 蓝色 - 三角形ABD
    triangle2: '#FFA7D0',      // 粉色 - 三角形BCD
    triangle1Stroke: '#4A90E2',
    triangle2Stroke: '#FF6B6B',
    pointA: '#10B981',         // 绿色 - 点A
    pointB: '#FF6B6B',         // 红色 - 点B（分割点）
    pointC: '#8B5CF6',         // 紫色 - 点C
    pointD: '#FFD700',         // 黄色 - 公共顶点D
    pointBorder: '#333333',
    line: '#333333',
    grid: '#E5E7EB',
    baseLine: '#94A3B8'
};

// ============ 初始化 ============
function init() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 绑定鼠标事件
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // 绑定触摸事件
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // 初始绘制
    resetGeometry();
    draw();
}

// ============ 画布尺寸调整 ============
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    if (pointA.x === 0 && pointA.y === 0) {
        resetGeometry();
    }

    draw();
}

// ============ 重置为默认状态 ============
function resetGeometry() {
    const centerX = canvasWidth / 2;
    const baseY = canvasHeight * 0.75;
    const triangleHeight = canvasHeight * 0.45;
    const baseLength = canvasWidth * 0.7;

    // A、B、C共线（水平线）
    pointA = { x: centerX - baseLength / 2, y: baseY };
    pointB = { x: centerX, y: baseY };
    pointC = { x: centerX + baseLength / 2, y: baseY };
    pointD = { x: centerX, y: baseY - triangleHeight };

    updateDisplay();
}

// ============ 模式设置 ============
function setLineMode(isCollinear) {
    lineMode = isCollinear;
    
    // 更新按钮样式
    const btnCollinear = document.getElementById('btn-collinear');
    const btnFree = document.getElementById('btn-free');
    
    if (isCollinear) {
        btnCollinear.classList.remove('bg-gray-300', 'text-gray-700', 'hover:bg-gray-400');
        btnCollinear.classList.add('bg-primary', 'text-white', 'hover:bg-blue-600');
        btnFree.classList.remove('bg-primary', 'text-white', 'hover:bg-blue-600');
        btnFree.classList.add('bg-gray-300', 'text-gray-700', 'hover:bg-gray-400');
        
        // 切换到共线模式时，对齐三点
        alignABC();
    } else {
        btnFree.classList.remove('bg-gray-300', 'text-gray-700', 'hover:bg-gray-400');
        btnFree.classList.add('bg-primary', 'text-white', 'hover:bg-blue-600');
        btnCollinear.classList.remove('bg-primary', 'text-white', 'hover:bg-blue-600');
        btnCollinear.classList.add('bg-gray-300', 'text-gray-700', 'hover:bg-gray-400');
    }
    
    draw();
}

// 将A、B、C三点对齐到同一直线
function alignABC() {
    // 计算B在A-C线段上的投影
    const foot = getFootOfPerpendicular(pointB, pointA, pointC);
    pointB.x = foot.x;
    pointB.y = foot.y;
}

// ============ 核心绘制函数 ============
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGrid();
    drawBaseLine();
    drawHeightLines();
    drawTriangle(pointB, pointD, pointC, COLORS.triangle2, COLORS.triangle2Stroke, 'S2');
    drawTriangle(pointA, pointD, pointB, COLORS.triangle1, COLORS.triangle1Stroke, 'S1');
    drawDivisionLine();
    drawPoints();
    drawLabels();
    updateDisplay();
}

function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function drawBaseLine() {
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointC.x, pointC.y);
    ctx.strokeStyle = COLORS.baseLine;
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawHeightLines() {
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    const foot = getFootOfPerpendicular(pointD, pointA, pointC);
    ctx.moveTo(pointD.x, pointD.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawDivisionLine() {
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.moveTo(pointB.x, pointB.y);
    ctx.lineTo(pointD.x, pointD.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawTriangle(p1, p2, p3, fillColor, strokeColor, label) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
}

function drawPoints() {
    drawPoint(pointA, COLORS.pointA, 'A');
    drawPoint(pointB, COLORS.pointB, 'B');
    drawPoint(pointC, COLORS.pointC, 'C');
    drawPoint(pointD, COLORS.pointD, 'D');
}

function drawPoint(p, color, label) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, DRAG_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = COLORS.pointBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x - 3, p.y - 3, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, p.x, p.y);
}

function drawLabels() {
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('A', pointA.x, pointA.y + 30);
    ctx.fillText('B', pointB.x, pointB.y - 25);
    ctx.fillText('C', pointC.x, pointC.y + 30);
    ctx.fillText('D', pointD.x, pointD.y - 25);
    ctx.font = '13px Microsoft YaHei';
    ctx.fillStyle = '#64748B';
    const midAC = { x: (pointA.x + pointC.x) / 2, y: pointA.y + 15 };
    ctx.fillText('AC = ' + calculateDistance(pointA, pointC).toFixed(1), midAC.x, midAC.y);
}

// ============ 数学计算函数 ============
function getFootOfPerpendicular(p, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    if (dx === 0 && dy === 0) return lineStart;
    const t = ((p.x - lineStart.x) * dx + (p.y - lineStart.y) * dy) / (dx * dx + dy * dy);
    return {
        x: lineStart.x + t * dx,
        y: lineStart.y + t * dy
    };
}

function calculateTriangleArea(p1, p2, p3) {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getGCD(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b > 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a === 0 ? 1 : a;
}

function simplifyRatio(a, b) {
    if (a === 0 && b === 0) return { a: 0, b: 0 };
    if (a === 0) return { a: 0, b: 1 };
    if (b === 0) return { a: 1, b: 0 };
    const gcd = getGCD(a, b);
    return {
        a: Math.round(a / gcd),
        b: Math.round(b / gcd)
    };
}

// ============ 数据更新与显示 ============
function updateDisplay() {
    // 计算底边长度
    const lenAB = calculateDistance(pointA, pointB);
    const lenBC = calculateDistance(pointB, pointC);

    // 计算高度（垂直方向）
    const height = Math.abs(pointD.y - pointA.y);

    document.getElementById('baseA').textContent = lenAB.toFixed(1);
    document.getElementById('baseB').textContent = lenBC.toFixed(1);

    // 计算底边比
    const baseRatio = simplifyRatio(lenAB, lenBC);
    document.getElementById('baseRatio').textContent = baseRatio.a + ' : ' + baseRatio.b;

    // 缩放系数（使面积与底边数量级接近）
    const scaleFactor = 0.5;

    if (lineMode) {
        // 共线模式：面积比 = 底边比（精确）
        const area1 = lenAB * height / 2;
        const area2 = lenBC * height / 2;
        document.getElementById('area1').textContent = (area1 * scaleFactor).toFixed(1);
        document.getElementById('area2').textContent = (area2 * scaleFactor).toFixed(1);
        // 面积比直接使用底边比
        document.getElementById('areaRatio').textContent = baseRatio.a + ' : ' + baseRatio.b;
    } else {
        // 自由模式：使用实际几何面积计算
        const area1 = calculateTriangleArea(pointA, pointB, pointD);
        const area2 = calculateTriangleArea(pointB, pointC, pointD);
        document.getElementById('area1').textContent = (area1 * scaleFactor).toFixed(1);
        document.getElementById('area2').textContent = (area2 * scaleFactor).toFixed(1);
        // 面积比按实际计算
        const areaRatio = simplifyRatio(area1, area2);
        document.getElementById('areaRatio').textContent = areaRatio.a + ' : ' + areaRatio.b;
    }
}

// ============ 鼠标/触摸事件处理 ============
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPointInRange(mouseX, mouseY, pointB)) {
        dragTarget = 'B';
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    } else if (isPointInRange(mouseX, mouseY, pointA)) {
        dragTarget = 'A';
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    } else if (isPointInRange(mouseX, mouseY, pointC)) {
        dragTarget = 'C';
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    } else if (isPointInRange(mouseX, mouseY, pointD)) {
        dragTarget = 'D';
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging && dragTarget) {
        const newX = Math.max(30, Math.min(mouseX, canvasWidth - 30));
        const newY = Math.max(50, Math.min(mouseY, canvasHeight - 50));

        if (dragTarget === 'A') {
            if (lineMode) {
                // 共线模式：A移动时，保持A、B、C共线，且高不变
                const dy = newY - pointA.y;
                const dx = newX - pointA.x;
                
                pointA.x = newX;
                pointA.y = newY;
                
                // B和C也跟着移动，保持相对位置
                pointB.x += dx;
                pointB.y += dy;
                pointC.x += dx;
                pointC.y += dy;
                
                // D也跟着移动，保持高不变
                pointD.x += dx;
                pointD.y += dy;
            } else {
                pointA.x = newX;
                pointA.y = newY;
            }
        } else if (dragTarget === 'C') {
            if (lineMode) {
                const dy = newY - pointC.y;
                const dx = newX - pointC.x;
                
                pointC.x = newX;
                pointC.y = newY;
                
                pointA.x += dx;
                pointA.y += dy;
                pointB.x += dx;
                pointB.y += dy;
                
                pointD.x += dx;
                pointD.y += dy;
            } else {
                pointC.x = newX;
                pointC.y = newY;
            }
        } else if (dragTarget === 'B') {
            if (lineMode) {
                // B点自动吸附到A-C直线上
                const foot = getFootOfPerpendicular({ x: newX, y: newY }, pointA, pointC);
                
                // 检查B是否在A-C线段范围内
                const minX = Math.min(pointA.x, pointC.x);
                const maxX = Math.max(pointA.x, pointC.x);
                const minY = Math.min(pointA.y, pointC.y);
                const maxY = Math.max(pointA.y, pointC.y);
                
                if (foot.x >= minX - 10 && foot.x <= maxX + 10 && 
                    foot.y >= minY - 10 && foot.y <= maxY + 10) {
                    pointB.x = foot.x;
                    pointB.y = foot.y;
                }
            } else {
                pointB.x = Math.max(pointA.x + 20, Math.min(newX, pointC.x - 20));
                pointB.y = newY;
            }
        } else if (dragTarget === 'D') {
            pointD.x = newX;
            pointD.y = newY;
        }

        draw();
    } else {
        if (isPointInRange(mouseX, mouseY, pointA) ||
            isPointInRange(mouseX, mouseY, pointB) ||
            isPointInRange(mouseX, mouseY, pointC) ||
            isPointInRange(mouseX, mouseY, pointD)) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function handleMouseUp() {
    isDragging = false;
    dragTarget = null;
    canvas.style.cursor = 'default';
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchEnd(e) {
    handleMouseUp();
}

function isPointInRange(x, y, point) {
    const dx = x - point.x;
    const dy = y - point.y;
    return Math.sqrt(dx * dx + dy * dy) <= DRAG_RADIUS;
}

// ============ 比例设置函数（按共线模式）============
function setRatio(ratioType) {
    document.querySelectorAll('.ratio-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.getElementById('btn-' + ratioType).classList.add('active');

    const centerX = canvasWidth / 2;
    const baseY = canvasHeight * 0.75;
    const triangleHeight = canvasHeight * 0.45;
    const baseLength = canvasWidth * 0.7;

    // 水平底边A、B、C
    pointA = { x: centerX - baseLength / 2, y: baseY };
    pointC = { x: centerX + baseLength / 2, y: baseY };
    pointD = { x: centerX, y: baseY - triangleHeight };

    // 根据比例类型设置分割点B的位置（确保三点共线）
    switch (ratioType) {
        case 'midpoint':
            // AB:BC = 1:1，B在正中间
            pointB = { x: centerX, y: baseY };
            break;
        case 'third':
            // AB:BC = 1:2，B距离A为总长的1/3
            pointB = { x: pointA.x + baseLength / 3, y: baseY };
            break;
        case 'fourth':
            // AB:BC = 1:3，B距离A为总长的1/4
            pointB = { x: pointA.x + baseLength / 4, y: baseY };
            break;
        case 'half':
            // AB:BC = 1:1，等同中点
            pointB = { x: centerX, y: baseY };
            break;
        case 'third-inv':
            // AB:BC = 2:1，B距离A为总长的2/3
            pointB = { x: pointA.x + baseLength * 2 / 3, y: baseY };
            break;
    }

    draw();
}

// ============ 重置功能 ============
function resetToDefault() {
    document.querySelectorAll('.ratio-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.getElementById('btn-midpoint').classList.add('active');
    resetGeometry();
    draw();
}

// ============ 页面加载完成后初始化 ============
window.addEventListener('load', init);

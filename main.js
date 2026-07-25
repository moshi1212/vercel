// ==========================================
// 全局状态
// ==========================================
let canvas, ctx;
let currentImage = null;
let croppedImage = null;
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#2D3436';
let currentColorName = '黑色';
let brushSize = 1;
let zoom = 1;
let history = [];
let historyIndex = -1;
let isVerified = true;

// 参数
let gridWidth = 60;
let gridHeight = 60;
let brand = 'MARD';
let showGrid = true;
let showNumbers = true;
let showColorCode = false;
let showBlank = true;
let lockRatio = true;
let colorLimit = 0;
let enhance = false;
let dithering = false;
let brightness = 100;
let contrast = 100;
let saturation = 100;
let excludedColors = new Set();

// 拼豆尺寸
const BEAD_SIZE = 12;
const GRID_LINE_WIDTH = 1;
const NUMBER_FONT_SIZE = 8;

// ==========================================
// 颜色库
// ==========================================
const PERLER_COLORS = {
    MARD: [
        { code: '001', hex: '#FFFFFF', name: '白色' },
        { code: '002', hex: '#000000', name: '黑色' },
        { code: '003', hex: '#F5F5F5', name: '雪白' },
        { code: '004', hex: '#606060', name: '深灰' },
        { code: '005', hex: '#9E9E9E', name: '灰色' },
        { code: '006', hex: '#D0D0D0', name: '浅灰' },
        { code: '007', hex: '#FF0000', name: '红色' },
        { code: '008', hex: '#FF6464', name: '浅红' },
        { code: '009', hex: '#8B0000', name: '深红' },
        { code: '010', hex: '#FF7F00', name: '橙色' },
        { code: '011', hex: '#FFB347', name: '浅橙' },
        { code: '012', hex: '#CC5500', name: '深橙' },
        { code: '013', hex: '#FFD700', name: '黄色' },
        { code: '014', hex: '#FFFF00', name: '亮黄' },
        { code: '015', hex: '#B8860B', name: '暗黄' },
        { code: '016', hex: '#00FF00', name: '绿色' },
        { code: '017', hex: '#32CD32', name: '浅绿' },
        { code: '018', hex: '#006400', name: '深绿' },
        { code: '019', hex: '#00FFFF', name: '青色' },
        { code: '020', hex: '#008B8B', name: '深青' },
        { code: '021', hex: '#0000FF', name: '蓝色' },
        { code: '022', hex: '#4169E1', name: '浅蓝' },
        { code: '023', hex: '#000080', name: '深蓝' },
        { code: '024', hex: '#FF00FF', name: '品红' },
        { code: '025', hex: '#8B008B', name: '紫色' },
        { code: '026', hex: '#800080', name: '深紫' },
        { code: '027', hex: '#FFC0CB', name: '粉色' },
        { code: '028', hex: '#FF69B4', name: '深粉' },
        { code: '029', hex: '#A52A2A', name: '棕色' },
        { code: '030', hex: '#DEB887', name: '浅棕' },
        { code: '031', hex: '#8B4513', name: '深棕' },
        { code: '032', hex: '#FFA500', name: '橙黄' },
        { code: '033', hex: '#98FB98', name: '薄荷绿' },
        { code: '034', hex: '#DDA0DD', name: '梅红' },
        { code: '035', hex: '#87CEEB', name: '天蓝' },
        { code: '036', hex: '#F0E68C', name: '卡其色' },
        { code: '037', hex: '#E6E6FA', name: '淡紫' },
        { code: '038', hex: '#D2691E', name: '巧克力色' },
        { code: '039', hex: '#696969', name: '暗灰' },
        { code: '040', hex: '#BDB76B', name: '橄榄色' },
        { code: '041', hex: '#556B2F', name: '暗橄榄绿' },
        { code: '042', hex: '#6B8E23', name: '橄榄褐' },
        { code: '043', hex: '#483D8B', name: '暗蓝灰' },
        { code: '044', hex: '#2F4F4F', name: '暗青灰' },
        { code: '045', hex: '#9370DB', name: '中紫' },
        { code: '046', hex: '#3CB371', name: '中绿' },
        { code: '047', hex: '#7B68EE', name: '中蓝紫' },
        { code: '048', hex: '#00CED1', name: '暗绿松石' }
    ],
    Perler: [
        { code: 'P001', hex: '#FFFFFF', name: 'White' },
        { code: 'P002', hex: '#000000', name: 'Black' },
        { code: 'P003', hex: '#F5F5DC', name: 'Beige' },
        { code: 'P004', hex: '#808080', name: 'Gray' },
        { code: 'P005', hex: '#C0C0C0', name: 'Silver' },
        { code: 'P006', hex: '#FF0000', name: 'Red' },
        { code: 'P007', hex: '#FF7F50', name: 'Coral' },
        { code: 'P008', hex: '#8B0000', name: 'Dark Red' },
        { code: 'P009', hex: '#FFA500', name: 'Orange' },
        { code: 'P010', hex: '#FFD700', name: 'Gold' },
        { code: 'P011', hex: '#FFFF00', name: 'Yellow' },
        { code: 'P012', hex: '#9ACD32', name: 'Yellow Green' },
        { code: 'P013', hex: '#00FF00', name: 'Lime' },
        { code: 'P014', hex: '#008000', name: 'Green' },
        { code: 'P015', hex: '#00FFFF', name: 'Aqua' },
        { code: 'P016', hex: '#008080', name: 'Teal' },
        { code: 'P017', hex: '#0000FF', name: 'Blue' },
        { code: 'P018', hex: '#0000CD', name: 'Medium Blue' },
        { code: 'P019', hex: '#000080', name: 'Navy' },
        { code: 'P020', hex: '#FF00FF', name: 'Magenta' },
        { code: 'P021', hex: '#800080', name: 'Purple' },
        { code: 'P022', hex: '#FFC0CB', name: 'Pink' },
        { code: 'P023', hex: '#A52A2A', name: 'Brown' },
        { code: 'P024', hex: '#FFFAFA', name: 'Snow' }
    ],
    Hama: [
        { code: 'H001', hex: '#FFFFFF', name: 'White' },
        { code: 'H002', hex: '#000000', name: 'Black' },
        { code: 'H003', hex: '#F0F0F0', name: 'Off White' },
        { code: 'H004', hex: '#808080', name: 'Gray' },
        { code: 'H005', hex: '#C0C0C0', name: 'Light Gray' },
        { code: 'H006', hex: '#FF0000', name: 'Red' },
        { code: 'H007', hex: '#FF6666', name: 'Light Red' },
        { code: 'H008', hex: '#CC0000', name: 'Dark Red' },
        { code: 'H009', hex: '#FF9900', name: 'Orange' },
        { code: 'H010', hex: '#FFCC00', name: 'Yellow' },
        { code: 'H011', hex: '#FFFF66', name: 'Light Yellow' },
        { code: 'H012', hex: '#66CC00', name: 'Lime' },
        { code: 'H013', hex: '#00CC00', name: 'Green' },
        { code: 'H014', hex: '#009900', name: 'Dark Green' },
        { code: 'H015', hex: '#00CCCC', name: 'Turquoise' },
        { code: 'H016', hex: '#0099CC', name: 'Light Blue' },
        { code: 'H017', hex: '#0066CC', name: 'Blue' },
        { code: 'H018', hex: '#000099', name: 'Dark Blue' },
        { code: 'H019', hex: '#993399', name: 'Purple' },
        { code: 'H020', hex: '#FF99CC', name: 'Pink' },
        { code: 'H021', hex: '#CC6699', name: 'Rose' },
        { code: 'H022', hex: '#996633', name: 'Brown' },
        { code: 'H023', hex: '#CC9966', name: 'Tan' },
        { code: 'H024', hex: '#663300', name: 'Dark Brown' }
    ]
};

// ==========================================
// 初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initEventListeners();
    initColorPalette();
    loadHistory();
});

function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
}

function initEventListeners() {
    // 上传区域
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // 画布绘图
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // 触摸支持
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY, target: canvas });
    });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const touch = e.touches[0];
        draw({ clientX: touch.clientX, clientY: touch.clientY, target: canvas });
    });
    canvas.addEventListener('touchend', stopDrawing);
    
    // 参数控件
    document.getElementById('gridSize').addEventListener('input', e => {
        gridWidth = gridHeight = parseInt(e.target.value);
        document.getElementById('gridSizeValue').textContent = e.target.value;
        if (lockRatio) {
            document.getElementById('gridSize').value = gridWidth;
        }
        if (currentImage) regenerate();
    });
    
    document.getElementById('lockRatio').addEventListener('change', e => {
        lockRatio = e.target.checked;
    });
    
    document.getElementById('keepWhite').addEventListener('change', e => {
        showBlank = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('showGrid').addEventListener('change', e => {
        showGrid = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('showNumbers').addEventListener('change', e => {
        showNumbers = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('showColorCode').addEventListener('change', e => {
        showColorCode = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('colorLimit').addEventListener('input', e => {
        const val = parseInt(e.target.value);
        colorLimit = val;
        if (val === 0) {
            document.getElementById('colorLimitValue').textContent = '不限';
        } else {
            document.getElementById('colorLimitValue').textContent = val;
        }
        if (currentImage) regenerate();
    });
    
    document.getElementById('enhance').addEventListener('change', e => {
        enhance = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('dithering').addEventListener('change', e => {
        dithering = e.target.checked;
        if (currentImage) regenerate();
    });
    
    document.getElementById('brightness').addEventListener('input', e => {
        brightness = parseInt(e.target.value);
        document.getElementById('brightnessValue').textContent = brightness + '%';
        if (currentImage) regenerate();
    });
    
    document.getElementById('contrast').addEventListener('input', e => {
        contrast = parseInt(e.target.value);
        document.getElementById('contrastValue').textContent = contrast + '%';
        if (currentImage) regenerate();
    });
    
    document.getElementById('saturation').addEventListener('input', e => {
        saturation = parseInt(e.target.value);
        document.getElementById('saturationValue').textContent = saturation + '%';
        if (currentImage) regenerate();
    });
    
    document.getElementById('phone').addEventListener('input', e => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
    });
    
    document.getElementById('verifyBtn').addEventListener('click', verifyLicense);
    document.getElementById('license').addEventListener('keypress', e => {
        if (e.key === 'Enter') verifyLicense();
    });
}

function initColorPalette() {
    const palette = document.getElementById('colorPalette');
    const colors = PERLER_COLORS[brand];
    palette.innerHTML = colors.map(c => 
        `<div class="palette-color" style="background:${c.hex}" 
              data-hex="${c.hex}" data-name="${c.name}" data-code="${c.code}"
              onclick="selectColor('${c.hex}', '${c.name}', '${c.code}')"></div>`
    ).join('');
}

function selectColor(hex, name, code) {
    currentColor = hex;
    currentColorName = name;
    document.getElementById('currentColorPreview').style.background = hex;
    document.getElementById('currentColorCode').textContent = code + ' ' + hex.toUpperCase();
    document.getElementById('currentColorName').textContent = name;
    document.querySelectorAll('.palette-color').forEach(el => {
        el.classList.toggle('active', el.dataset.hex === hex);
    });
}

// ==========================================
// 图片加载
// ==========================================
function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadZone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) loadImage(file);
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            croppedImage = null;
            const uploadZone = document.getElementById('uploadZone');
            const canvasEditor = document.getElementById('canvasEditor');
            uploadZone.classList.add('hidden');
            canvasEditor.classList.remove('hidden');
            generatePerlerBeads();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==========================================
// 核心生成函数
// ==========================================
function generatePerlerBeads() {
    if (!currentImage) return;
    
    const img = croppedImage || currentImage;
    
    // 计算画布尺寸
    const numWidth = gridWidth;
    const numHeight = Math.round(gridHeight * (img.height / img.width));
    
    const canvasWidth = numWidth * BEAD_SIZE + 60;
    const canvasHeight = numHeight * BEAD_SIZE + 60;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 绘制背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制网格背景
    ctx.fillStyle = '#f8f8f8';
    for (let x = 0; x < numWidth; x++) {
        for (let y = 0; y < numHeight; y++) {
            if ((x + y) % 2 === 0) {
                ctx.fillRect(30 + x * BEAD_SIZE, 30 + y * BEAD_SIZE, BEAD_SIZE, BEAD_SIZE);
            }
        }
    }
    
    // 缩放图片
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = numWidth;
    tempCanvas.height = numHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 应用图像调节
    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    tempCtx.drawImage(img, 0, 0, numWidth, numHeight);
    
    // 获取像素数据
    const imgData = tempCtx.getImageData(0, 0, numWidth, numHeight);
    const pixels = imgData.data;
    
    // 颜色库
    const colorArray = PERLER_COLORS[brand];
    
    // 颜色量化
    const colorCounts = {};
    const beadData = [];
    
    for (let y = 0; y < numHeight; y++) {
        const row = [];
        for (let x = 0; x < numWidth; x++) {
            const i = (y * numWidth + x) * 4;
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let a = pixels[i + 3];
            
            // 处理透明/白色背景
            if (a < 128 || (showBlank && r > 240 && g > 240 && b > 240)) {
                row.push({ hex: '#FFFFFF', name: '留白', code: '---', bead: 'blank' });
                continue;
            }
            
            // 查找最接近的颜色
            const color = findClosestColor(r, g, b, colorArray);
            
            // 排除的颜色
            if (excludedColors.has(color.hex)) {
                row.push({ hex: '#FFFFFF', name: '留白', code: '---', bead: 'blank' });
                continue;
            }
            
            row.push({ hex: color.hex, name: color.name, code: color.code, bead: 'color' });
            
            // 统计颜色
            const key = color.hex;
            if (!colorCounts[key]) {
                colorCounts[key] = { ...color, count: 0 };
            }
            colorCounts[key].count++;
        }
        beadData.push(row);
    }
    
    // 限制颜色数量
    if (colorLimit > 0) {
        const sortedColors = Object.values(colorCounts).sort((a, b) => b.count - a.count);
        const allowedColors = new Set(sortedColors.slice(0, colorLimit).map(c => c.hex));
        
        for (let y = 0; y < numHeight; y++) {
            for (let x = 0; x < numWidth; x++) {
                const cell = beadData[y][x];
                if (cell.bead === 'color' && !allowedColors.has(cell.hex)) {
                    beadData[y][x] = { hex: '#FFFFFF', name: '留白', code: '---', bead: 'blank' };
                }
            }
        }
    }
    
    // 绘制拼豆
    for (let y = 0; y < numHeight; y++) {
        for (let x = 0; x < numWidth; x++) {
            const cell = beadData[y][x];
            const px = 30 + x * BEAD_SIZE;
            const py = 30 + y * BEAD_SIZE;
            
            if (cell.bead === 'color') {
                drawBead(px, py, cell.hex);
            } else if (showBlank) {
                drawBlankBead(px, py);
            }
        }
    }
    
    // 绘制网格线
    if (showGrid) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= numWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(30 + x * BEAD_SIZE, 30);
            ctx.lineTo(30 + x * BEAD_SIZE, 30 + numHeight * BEAD_SIZE);
            ctx.stroke();
        }
        
        for (let y = 0; y <= numHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(30, 30 + y * BEAD_SIZE);
            ctx.lineTo(30 + numWidth * BEAD_SIZE, 30 + y * BEAD_SIZE);
            ctx.stroke();
        }
    }
    
    // 行列编号
    if (showNumbers) {
        ctx.fillStyle = '#888';
        ctx.font = `${NUMBER_FONT_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let x = 0; x < numWidth; x++) {
            ctx.fillText(x + 1, 30 + x * BEAD_SIZE + BEAD_SIZE / 2, 18);
        }
        
        for (let y = 0; y < numHeight; y++) {
            ctx.fillText(y + 1, 15, 30 + y * BEAD_SIZE + BEAD_SIZE / 2);
        }
    }
    
    // 更新统计
    updateStats(beadData, colorCounts, numWidth, numHeight);
    
    // 保存历史
    saveHistory();
}

function findClosestColor(r, g, b, colorArray) {
    let minDist = Infinity;
    let closest = colorArray[0];
    
    for (const color of colorArray) {
        const hex = color.hex.replace('#', '');
        const cr = parseInt(hex.substr(0, 2), 16);
        const cg = parseInt(hex.substr(2, 2), 16);
        const cb = parseInt(hex.substr(4, 2), 16);
        
        const dist = Math.sqrt(
            Math.pow(r - cr, 2) +
            Math.pow(g - cg, 2) +
            Math.pow(b - cb, 2)
        );
        
        if (dist < minDist) {
            minDist = dist;
            closest = color;
        }
    }
    
    return closest;
}

function drawBead(x, y, color) {
    const size = BEAD_SIZE - 2;
    const cx = x + BEAD_SIZE / 2;
    const cy = y + BEAD_SIZE / 2;
    
    // 珠子主体
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // 高光
    ctx.beginPath();
    ctx.arc(cx - size / 6, cy - size / 6, size / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    
    // 边框
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawBlankBead(x, y) {
    const size = BEAD_SIZE - 2;
    const cx = x + BEAD_SIZE / 2;
    const cy = y + BEAD_SIZE / 2;
    
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
}

function updateStats(beadData, colorCounts, width, height) {
    let totalBeads = 0;
    let blankBeads = 0;
    const usedColors = new Set();
    
    for (const row of beadData) {
        for (const cell of row) {
            if (cell.bead === 'blank') {
                blankBeads++;
            } else {
                totalBeads++;
                usedColors.add(cell.hex);
            }
        }
    }
    
    document.getElementById('statSize').textContent = `${width}×${height}`;
    document.getElementById('statBeads').textContent = totalBeads;
    document.getElementById('statBlank').textContent = blankBeads;
    document.getElementById('statColors').textContent = usedColors.size;
    document.getElementById('statProgress').textContent = '0%';
    document.getElementById('totalBeads').textContent = totalBeads;
    
    // 颜色清单
    const colorList = document.getElementById('colorList');
    const sortedColors = Object.values(colorCounts)
        .filter(c => c.count > 0 && !excludedColors.has(c.hex))
        .sort((a, b) => b.count - a.count);
    
    if (sortedColors.length === 0) {
        colorList.innerHTML = '<p class="color-empty">生成图案后显示颜色清单</p>';
        return;
    }
    
    colorList.innerHTML = sortedColors.map(c => `
        <div class="color-item ${excludedColors.has(c.hex) ? 'excluded' : ''}" 
             onclick="toggleExcludeColor('${c.hex}')">
            <div class="color-swatch" style="background:${c.hex}"></div>
            <div class="color-details">
                <span class="color-code">${c.code}</span>
                <span class="color-name">${c.name}</span>
                <span class="color-count">×${c.count}</span>
            </div>
        </div>
    `).join('');
}

function toggleExcludeColor(hex) {
    if (excludedColors.has(hex)) {
        excludedColors.delete(hex);
    } else {
        excludedColors.add(hex);
    }
    if (currentImage) regenerate();
}

function regenerate() {
    if (currentImage) generatePerlerBeads();
}

function resetAdjustments() {
    brightness = 100;
    contrast = 100;
    saturation = 100;
    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('saturation').value = 100;
    document.getElementById('brightnessValue').textContent = '100%';
    document.getElementById('contrastValue').textContent = '100%';
    document.getElementById('saturationValue').textContent = '100%';
    if (currentImage) regenerate();
}

function setBrand(b) {
    brand = b;
    document.querySelectorAll('.brand-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.brand === b);
    });
    initColorPalette();
    if (currentImage) regenerate();
}

// ==========================================
// 绘图工具
// ==========================================
function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tool + 'Tool')?.classList.add('active');
}

function startDrawing(e) {
    if (!currentImage) return;
    isDrawing = true;
    saveHistory();
    draw(e);
}

function draw(e) {
    if (!isDrawing || !currentImage) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - 30) / BEAD_SIZE);
    const y = Math.floor((e.clientY - rect.top - 30) / BEAD_SIZE);
    
    if (x < 0 || y < 0) return;
    
    const px = 30 + x * BEAD_SIZE;
    const py = 30 + y * BEAD_SIZE;
    
    if (currentTool === 'brush') {
        drawBead(px, py, currentColor);
    } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(px, py, BEAD_SIZE, BEAD_SIZE);
        if ((x + y) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 1, py + 1, BEAD_SIZE - 2, BEAD_SIZE - 2);
        }
        if (showGrid) {
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(px, py, BEAD_SIZE, BEAD_SIZE);
        }
    } else if (currentTool === 'picker') {
        const pixel = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1).data;
        currentColor = '#' + [pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('');
        document.getElementById('currentColorPreview').style.background = currentColor;
        document.getElementById('currentColorCode').textContent = currentColor.toUpperCase();
    }
}

function stopDrawing() {
    isDrawing = false;
}

// ==========================================
// 历史记录
// ==========================================
function saveHistory() {
    if (!canvas) return;
    const data = canvas.toDataURL();
    history = history.slice(0, historyIndex + 1);
    history.push(data);
    if (history.length > 50) history.shift();
    historyIndex = history.length - 1;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = history[historyIndex];
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = history[historyIndex];
    }
}

function loadHistory() {
    const saved = localStorage.getItem('perlerHistory');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.canvas) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    currentImage = img;
                };
                img.src = data.canvas;
            }
        } catch (e) {}
    }
}

function showHistory() {
    document.getElementById('historyModal').classList.remove('hidden');
    const list = document.getElementById('historyList');
    const saved = JSON.parse(localStorage.getItem('perlerHistoryList') || '[]');
    
    if (saved.length === 0) {
        list.innerHTML = '<p class="history-empty">暂无历史记录</p>';
        return;
    }
    
    list.innerHTML = saved.map((item, i) => `
        <div class="history-item" onclick="loadHistoryItem(${i})">
            <img src="${item.thumb}" alt="">
            <div class="history-info">
                <span>${item.name}</span>
                <span>${item.date}</span>
            </div>
        </div>
    `).join('');
}

function loadHistoryItem(index) {
    closeHistory();
}

function closeHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

function showTutorial() {
    document.getElementById('tutorialModal').classList.remove('hidden');
}

function closeTutorial() {
    document.getElementById('tutorialModal').classList.add('hidden');
}

// ==========================================
// 下载功能
// ==========================================
function downloadImage() {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = '拼豆图纸_' + new Date().toLocaleDateString().replace(/\//g, '-') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadPDF() {
    alert('PDF下载功能开发中...');
}

// ==========================================
// 缩放控制
// ==========================================
function zoomIn() {
    zoom = Math.min(zoom * 1.2, 5);
    canvas.style.transform = `scale(${zoom})`;
}

function zoomOut() {
    zoom = Math.max(zoom / 1.2, 0.2);
    canvas.style.transform = `scale(${zoom})`;
}

function fitToScreen() {
    zoom = 1;
    canvas.style.transform = 'scale(1)';
}

function toggleFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    const fsCanvas = document.getElementById('fullscreenCanvas');
    
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        fsCanvas.width = canvas.width;
        fsCanvas.height = canvas.height;
        fsCanvas.getContext('2d').drawImage(canvas, 0, 0);
    } else {
        overlay.classList.add('hidden');
    }
}

// ==========================================
// 卡密验证
// ==========================================
function verifyLicense() {
    const phone = document.getElementById('phone').value;
    const license = document.getElementById('license').value;
    const message = document.getElementById('message');
    
    if (phone.length !== 11) {
        message.textContent = '请输入11位手机号';
        message.className = 'message error';
        return;
    }
    
    if (license.length !== 10) {
        message.textContent = '请输入10位卡密';
        message.className = 'message error';
        return;
    }
    
    message.textContent = '验证中...';
    message.className = 'message info';
    
    fetch('https://vercelapp-opal-omega.vercel.app/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, license })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            message.textContent = '验证成功！';
            message.className = 'message success';
            isVerified = true;
            localStorage.setItem('verified_' + license, 'true');
            setTimeout(() => {
                closeLicenseModal();
            }, 1000);
        } else {
            message.textContent = data.message || '验证失败';
            message.className = 'message error';
        }
    })
    .catch(() => {
        message.textContent = '验证服务暂不可用';
        message.className = 'message error';
    });
}

function closeLicenseModal() {
    document.getElementById('licenseModal').classList.add('hidden');
}

// ==========================================
// PixelBead 像素拼豆工坊 - 核心脚本
// ==========================================

// ---------- 全局状态 ----------
let canvas, ctx, mainCanvasEl;
let currentImage = null;
let beadData = null; // 二维数组存储每个格子的颜色
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#000000';
let currentColorName = '黑色';
let currentColorCode = '002';
let brushSize = 1;
let history = [];
let historyIndex = -1;

// 画布参数
let gridWidth = 52;
let gridHeight = 52;
let brand = 'MARD';
let showGrid = true;
let showNumbers = true;
let showColorCode = false;
let showBlank = true;
let lockRatio = true;
let colorLimit = 24;
let noiseReduction = true;
let brightness = 100;
let contrast = 100;
let saturation = 100;
let excludedColors = new Set();

// 局部放大
let magnifierZoom = 4;
let magnifierActive = false;
let magCanvas, magCtx;

// 选择区域
let selection = null;
let isSelecting = false;
let selStartX, selStartY;

// 替换颜色（魔棒用）
let wandFromColor = null;
let canvasScale = 1;  // 画布缩放倍数
let showBeadNumbers = true;  // 是否显示每个豆子的序号

// 珠子尺寸
const BEAD_SIZE = 22;
const GRID_LINE = 1;
const MARGIN = 38;
const NUMBER_FONT = 11;

// ---------- 颜色库 ----------
const PERLER_COLORS = {
    MARD: [
        {code:'001',hex:'#FFFFFF',name:'白色'},{code:'002',hex:'#000000',name:'黑色'},{code:'003',hex:'#F5F5F5',name:'雪白'},
        {code:'004',hex:'#606060',name:'深灰'},{code:'005',hex:'#9E9E9E',name:'灰色'},{code:'006',hex:'#D0D0D0',name:'浅灰'},
        {code:'007',hex:'#FF0000',name:'红色'},{code:'008',hex:'#FF6464',name:'浅红'},{code:'009',hex:'#8B0000',name:'深红'},
        {code:'010',hex:'#FF7F00',name:'橙色'},{code:'011',hex:'#FFB347',name:'浅橙'},{code:'012',hex:'#CC5500',name:'深橙'},
        {code:'013',hex:'#FFD700',name:'黄色'},{code:'014',hex:'#FFFF00',name:'亮黄'},{code:'015',hex:'#B8860B',name:'暗黄'},
        {code:'016',hex:'#00FF00',name:'绿色'},{code:'017',hex:'#32CD32',name:'浅绿'},{code:'018',hex:'#006400',name:'深绿'},
        {code:'019',hex:'#00FFFF',name:'青色'},{code:'020',hex:'#008B8B',name:'深青'},{code:'021',hex:'#0000FF',name:'蓝色'},
        {code:'022',hex:'#4169E1',name:'浅蓝'},{code:'023',hex:'#000080',name:'深蓝'},{code:'024',hex:'#FF00FF',name:'品红'},
        {code:'025',hex:'#8B008B',name:'紫色'},{code:'026',hex:'#800080',name:'深紫'},{code:'027',hex:'#FFC0CB',name:'粉色'},
        {code:'028',hex:'#FF69B4',name:'深粉'},{code:'029',hex:'#A52A2A',name:'棕色'},{code:'030',hex:'#DEB887',name:'浅棕'},
        {code:'031',hex:'#8B4513',name:'深棕'},{code:'032',hex:'#FFA500',name:'橙黄'},{code:'033',hex:'#98FB98',name:'薄荷绿'},
        {code:'034',hex:'#DDA0DD',name:'梅红'},{code:'035',hex:'#87CEEB',name:'天蓝'},{code:'036',hex:'#F0E68C',name:'卡其色'},
        {code:'037',hex:'#E6E6FA',name:'淡紫'},{code:'038',hex:'#D2691E',name:'巧克力'},{code:'039',hex:'#696969',name:'暗灰'},
        {code:'040',hex:'#BDB76B',name:'橄榄色'},{code:'041',hex:'#556B2F',name:'暗橄榄绿'},{code:'042',hex:'#6B8E23',name:'橄榄褐'},
        {code:'043',hex:'#483D8B',name:'暗蓝灰'},{code:'044',hex:'#2F4F4F',name:'暗青灰'},{code:'045',hex:'#9370DB',name:'中紫'},
        {code:'046',hex:'#3CB371',name:'中绿'},{code:'047',hex:'#7B68EE',name:'中蓝紫'},{code:'048',hex:'#00CED1',name:'暗绿松石'}
    ],
    Perler: [
        {code:'P001',hex:'#FFFFFF',name:'White'},{code:'P002',hex:'#000000',name:'Black'},{code:'P003',hex:'#F5F5DC',name:'Beige'},
        {code:'P004',hex:'#808080',name:'Gray'},{code:'P005',hex:'#C0C0C0',name:'Silver'},{code:'P006',hex:'#FF0000',name:'Red'},
        {code:'P007',hex:'#FF7F50',name:'Coral'},{code:'P008',hex:'#8B0000',name:'Dark Red'},{code:'P009',hex:'#FFA500',name:'Orange'},
        {code:'P010',hex:'#FFD700',name:'Gold'},{code:'P011',hex:'#FFFF00',name:'Yellow'},{code:'P012',hex:'#9ACD32',name:'Yellow Green'},
        {code:'P013',hex:'#00FF00',name:'Lime'},{code:'P014',hex:'#008000',name:'Green'},{code:'P015',hex:'#00FFFF',name:'Aqua'},
        {code:'P016',hex:'#008080',name:'Teal'},{code:'P017',hex:'#0000FF',name:'Blue'},{code:'P018',hex:'#0000CD',name:'Medium Blue'},
        {code:'P019',hex:'#000080',name:'Navy'},{code:'P020',hex:'#FF00FF',name:'Magenta'},{code:'P021',hex:'#800080',name:'Purple'},
        {code:'P022',hex:'#FFC0CB',name:'Pink'},{code:'P023',hex:'#A52A2A',name:'Brown'},{code:'P024',hex:'#FFFAFA',name:'Snow'}
    ],
    Hama: [
        {code:'H001',hex:'#FFFFFF',name:'White'},{code:'H002',hex:'#000000',name:'Black'},{code:'H003',hex:'#F0F0F0',name:'Off White'},
        {code:'H004',hex:'#808080',name:'Gray'},{code:'H005',hex:'#C0C0C0',name:'Light Gray'},{code:'H006',hex:'#FF0000',name:'Red'},
        {code:'H007',hex:'#FF6666',name:'Light Red'},{code:'H008',hex:'#CC0000',name:'Dark Red'},{code:'H009',hex:'#FF9900',name:'Orange'},
        {code:'H010',hex:'#FFCC00',name:'Yellow'},{code:'H011',hex:'#FFFF66',name:'Light Yellow'},{code:'H012',hex:'#66CC00',name:'Lime'},
        {code:'H013',hex:'#00CC00',name:'Green'},{code:'H014',hex:'#009900',name:'Dark Green'},{code:'H015',hex:'#00CCCC',name:'Turquoise'},
        {code:'H016',hex:'#0099CC',name:'Light Blue'},{code:'H017',hex:'#0066CC',name:'Blue'},{code:'H018',hex:'#000099',name:'Dark Blue'},
        {code:'H019',hex:'#993399',name:'Purple'},{code:'H020',hex:'#FF99CC',name:'Pink'},{code:'H021',hex:'#CC6699',name:'Rose'},
        {code:'H022',hex:'#996633',name:'Brown'},{code:'H023',hex:'#CC9966',name:'Tan'},{code:'H024',hex:'#663300',name:'Dark Brown'}
    ],
    Artkal: [
        {code:'A001',hex:'#FFFFFF',name:'White'},{code:'A002',hex:'#000000',name:'Black'},{code:'A003',hex:'#F0F0F0',name:'Off White'},
        {code:'A004',hex:'#808080',name:'Gray'},{code:'A005',hex:'#C0C0C0',name:'Silver'},{code:'A006',hex:'#FF0000',name:'Red'},
        {code:'A007',hex:'#FF4444',name:'Bright Red'},{code:'A008',hex:'#CC0000',name:'Dark Red'},{code:'A009',hex:'#FF6600',name:'Orange'},
        {code:'A010',hex:'#FF9900',name:'Light Orange'},{code:'A011',hex:'#FFD700',name:'Gold'},{code:'A012',hex:'#FFFF00',name:'Yellow'},
        {code:'A013',hex:'#FFCC00',name:'Sun Yellow'},{code:'A014',hex:'#99CC00',name:'Lime'},{code:'A015',hex:'#00CC00',name:'Green'},
        {code:'A016',hex:'#009900',name:'Dark Green'},{code:'A017',hex:'#00CCCC',name:'Turquoise'},{code:'A018',hex:'#0099CC',name:'Sky Blue'},
        {code:'A019',hex:'#0066CC',name:'Blue'},{code:'A020',hex:'#000099',name:'Dark Blue'},{code:'A021',hex:'#993399',name:'Purple'},
        {code:'A022',hex:'#FF66CC',name:'Rose'},{code:'A023',hex:'#FF99CC',name:'Pink'},{code:'A024',hex:'#996633',name:'Brown'}
    ]
};

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
    mainCanvasEl = document.getElementById('mainCanvas');
    canvas = mainCanvasEl;
    ctx = canvas.getContext('2d');
    magCanvas = document.getElementById('magCanvas');
    magCtx = magCanvas.getContext('2d');
    initEventListeners();
    initColorPalette();
    loadHistory();
    // 默认选中画笔
    selectTool('brush');
});

// ---------- 事件监听 ----------
function initEventListeners() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // 画布鼠标事件
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', onCanvasLeave);

    // 触摸
    canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; onCanvasMouseDown({clientX:t.clientX, clientY:t.clientY}); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; onCanvasMouseMove({clientX:t.clientX, clientY:t.clientY}); });
    canvas.addEventListener('touchend', stopDrawing);

    // 放大镜鼠标跟踪
    canvas.addEventListener('mousemove', updateMagnifier);
    canvas.addEventListener('click', updateMagnifier);
    document.getElementById('magBody').addEventListener('mousedown', onMagMouseDown);
    document.getElementById('magBody').addEventListener('mousemove', onMagMouseMove);
    document.getElementById('magBody').addEventListener('mouseup', () => isDrawing = false);

    // 放大镜窗口拖动
    makeDraggable('magnifierWindow');

    // 参数控件
    document.getElementById('gridW').addEventListener('input', e => {
        const w = parseInt(e.target.value);
        document.getElementById('gridWValue').textContent = w;
        gridWidth = w;
        if (lockRatio) {
            gridHeight = w;
            document.getElementById('gridH').value = w;
            document.getElementById('gridHValue').textContent = w;
        }
    });
    document.getElementById('gridH').addEventListener('input', e => {
        const h = parseInt(e.target.value);
        document.getElementById('gridHValue').textContent = h;
        gridHeight = h;
        if (lockRatio) {
            gridWidth = h;
            document.getElementById('gridW').value = h;
            document.getElementById('gridWValue').textContent = h;
        }
    });
    document.getElementById('lockRatio').addEventListener('change', e => { lockRatio = e.target.checked; });
    document.getElementById('keepWhite').addEventListener('change', e => { showBlank = e.target.checked; if (beadData) regenerate(); });
    document.getElementById('colorLimit').addEventListener('input', e => {
        colorLimit = parseInt(e.target.value);
        document.getElementById('colorLimitValue').textContent = colorLimit;
    });
    document.getElementById('noiseReduction').addEventListener('change', e => { noiseReduction = e.target.checked; });
    document.getElementById('brightness').addEventListener('input', onParamChange);
    document.getElementById('contrast').addEventListener('input', onParamChange);
    document.getElementById('saturation').addEventListener('input', onParamChange);
    document.getElementById('phone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g,'').slice(0,11); });
    document.getElementById('license').addEventListener('keypress', e => { if(e.key==='Enter') verifyLicense(); });
    document.getElementById('verifyBtn').addEventListener('click', verifyLicense);
}

function onParamChange(e) {
    const id = e.target.id;
    const val = parseInt(e.target.value);
    const label = document.getElementById(id + 'Value');
    if (label) label.textContent = val + '%';
    if (id === 'brightness') brightness = val;
    if (id === 'contrast') contrast = val;
    if (id === 'saturation') saturation = val;
    if (beadData) regenerate();
}

function resetAdjustments() {
    brightness = 100; contrast = 100; saturation = 100;
    ['brightness','contrast','saturation'].forEach(id => {
        document.getElementById(id).value = 100;
        document.getElementById(id+'Value').textContent = '100%';
    });
    if (beadData) regenerate();
}

// ---------- 预设规格 ----------
function setPresetGrid(size) {
    gridWidth = gridHeight = size;
    document.getElementById('gridW').value = size;
    document.getElementById('gridWValue').textContent = size;
    document.getElementById('gridH').value = size;
    document.getElementById('gridHValue').textContent = size;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if (beadData) regenerate();
}

// ---------- 色板 ----------
function initColorPalette() {
    const palette = document.getElementById('colorPalette');
    const colors = PERLER_COLORS[brand];
    palette.innerHTML = colors.map(c =>
        `<div class="palette-color" style="background:${c.hex}" data-hex="${c.hex}" data-name="${c.name}" data-code="${c.code}" onclick="selectColor('${c.hex}','${c.name}','${c.code}')"></div>`
    ).join('');
    selectColor('#000000', '黑色', '002');
}

function selectColor(hex, name, code) {
    currentColor = hex;
    currentColorName = name || '';
    currentColorCode = code || '';
    document.getElementById('currentColorPreview').style.background = hex;
    document.getElementById('currentColorCode').textContent = (code||'') + ' ' + hex.toUpperCase();
    document.getElementById('currentColorName').textContent = name || '';
    document.querySelectorAll('.palette-color').forEach(el => {
        el.classList.toggle('active', el.dataset.hex === hex);
    });
}

function setBrand(b) {
    brand = b;
    document.querySelectorAll('.brand-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.brand === b));
    initColorPalette();
    if (beadData) regenerate();
}

// ---------- 图片加载 ----------
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
            // 显示裁剪弹窗
            showCropModal(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ---------- 核心生成函数 ----------
function generatePerlerBeads() {
    if (!currentImage) return;

    const img = currentImage;
    const numW = gridWidth;
    const numH = gridHeight;

    const cW = numW * BEAD_SIZE + MARGIN * 2;
    const cH = numH * BEAD_SIZE + MARGIN * 2;
    // 高分辨率屏幕（Retina/手机）清晰渲染
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cW * dpr;
    canvas.height = cH * dpr;
    canvas.style.width = cW + 'px';
    canvas.style.height = cH + 'px';
    ctx.scale(dpr, dpr);

    canvas.height = cH;

    // 预处理缩放
    const tmp = document.createElement('canvas');
    tmp.width = numW;
    tmp.height = numH;
    const tctx = tmp.getContext('2d');
    tctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    tctx.drawImage(img, 0, 0, numW, numH);
    const imgData = tctx.getImageData(0, 0, numW, numH);
    const pix = imgData.data;

    const colorArr = PERLER_COLORS[brand];
    beadData = [];

    for (let y = 0; y < numH; y++) {
        const row = [];
        for (let x = 0; x < numW; x++) {
            const i = (y * numW + x) * 4;
            const r = pix[i], g = pix[i+1], b = pix[i+2], a = pix[i+3];
            if (a < 128 || (showBlank && r > 240 && g > 240 && b > 240)) {
                row.push({hex:'#FFFFFF', name:'留白', code:'---', type:'blank'});
            } else {
                const col = findClosestColor(r, g, b, colorArr);
                row.push({hex:col.hex, name:col.name, code:col.code, type:'color'});
            }
        }
        beadData.push(row);
    }

    // 颜色数量限制
    if (colorLimit > 0) {
        const counts = {};
        for (let y = 0; y < numH; y++)
            for (let x = 0; x < numW; x++) {
                const cell = beadData[y][x];
                if (cell.type === 'color' && !excludedColors.has(cell.hex))
                    counts[cell.hex] = (counts[cell.hex] || 0) + 1;
            }
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
        const allowed = new Set(sorted.slice(0, colorLimit).map(e=>e[0]));
        for (let y=0; y<numH; y++)
            for (let x=0; x<numW; x++) {
                const cell = beadData[y][x];
                if (cell.type==='color' && !allowed.has(cell.hex))
                    beadData[y][x] = {hex:'#FFFFFF',name:'留白',code:'---',type:'blank'};
            }
    }

    // 降噪（消除单点杂色）
    if (noiseReduction) applyNoiseReduction();

    // 渲染
    renderCanvas();
    updateStats();
    saveHistory();
    document.getElementById('statusTip').textContent = '生成完成！打开放大镜精细微调';
}

function findClosestColor(r, g, b, arr) {
    let min = Infinity, closest = arr[0];
    for (const c of arr) {
        const h = c.hex.replace('#','');
        const dr = parseInt(h.substr(0,2),16), dg = parseInt(h.substr(2,2),16), db = parseInt(h.substr(4,2),16);
        const d = Math.sqrt((r-dr)**2+(g-dg)**2+(b-db)**2);
        if (d < min) { min = d; closest = c; }
    }
    return closest;
}

function applyNoiseReduction() {
    const h = beadData.length, w = beadData[0].length;
    for (let y = 1; y < h-1; y++) {
        for (let x = 1; x < w-1; x++) {
            const cell = beadData[y][x];
            if (cell.type !== 'color') continue;
            // 统计4邻域
            const neighbors = [
                beadData[y-1][x], beadData[y+1][x],
                beadData[y][x-1], beadData[y][x+1]
            ];
            const same = neighbors.filter(n => n.type==='color' && n.hex===cell.hex).length;
            if (same === 0) {
                // 周围都是不同色→变成留白
                beadData[y][x] = {hex:'#FFFFFF',name:'留白',code:'---',type:'blank'};
            }
        }
    }
}

function renderCanvas() {
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    const cW = w * BEAD_SIZE + MARGIN * 2;
    const cH = h * BEAD_SIZE + MARGIN * 2;
        // 高分辨率屏幕清晰渲染
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cW * dpr;
    canvas.height = cH * dpr;
    canvas.style.width = cW + 'px';
    canvas.style.height = cH + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
    ctx.scale(dpr, dpr);


    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cW, cH);

    // 行列间隔填充（每10格高亮一列/行）
    for (let x = 10; x <= w; x+=10) {
        ctx.fillStyle = '#fff8e1';
        ctx.fillRect(MARGIN + x*BEAD_SIZE - 0.5, MARGIN, 1, h*BEAD_SIZE);
    }
    for (let y = 10; y <= h; y+=10) {
        ctx.fillStyle = '#fff8e1';
        ctx.fillRect(MARGIN, MARGIN + y*BEAD_SIZE - 0.5, w*BEAD_SIZE, 1);
    }

    // 绘制珠子（带序号）
    let beadNum = 1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const cell = beadData[y][x];
            const px = MARGIN + x * BEAD_SIZE;
            const py = MARGIN + y * BEAD_SIZE;
            if (cell.type === 'color') {
                drawBead(px, py, cell.hex, showBeadNumbers ? beadNum++ : 0);
            } else if (showBlank) {
                drawBlankBead(px, py);
            }
        }
    }

    // 网格线
    if (showGrid) {
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = GRID_LINE;
        for (let x = 0; x <= w; x++) {
            ctx.beginPath();
            ctx.moveTo(MARGIN + x*BEAD_SIZE, MARGIN);
            ctx.lineTo(MARGIN + x*BEAD_SIZE, MARGIN + h*BEAD_SIZE);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y++) {
            ctx.beginPath();
            ctx.moveTo(MARGIN, MARGIN + y*BEAD_SIZE);
            ctx.lineTo(MARGIN + w*BEAD_SIZE, MARGIN + y*BEAD_SIZE);
            ctx.stroke();
        }
    }

    // 色号文字
    if (showColorCode) {
        ctx.fillStyle = '#333';
        ctx.font = `bold ${BEAD_SIZE * 0.45}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const cell = beadData[y][x];
                if (cell.type === 'color') {
                    const code = cell.code.replace(/[A-Z]/g,'');
                    ctx.fillText(code, Math.round(MARGIN + x*BEAD_SIZE + BEAD_SIZE/2), Math.round(MARGIN + y*BEAD_SIZE + BEAD_SIZE/2));

                }
            }
        }
    }

    // 行列编号（坐标轴标签）
    if (showNumbers) {
        ctx.fillStyle = '#666';
        ctx.font = `bold ${NUMBER_FONT}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 顶部 X 轴（1,2,3...）
        for (let x = 0; x < w; x++) {
            ctx.fillText(x+1, MARGIN + x*BEAD_SIZE + BEAD_SIZE/2, MARGIN - 16);
        }
        // 左侧 Y 轴（1,2,3...）
        ctx.textAlign = 'right';
        for (let y = 0; y < h; y++) {
            ctx.fillText(y+1, MARGIN - 8, MARGIN + y*BEAD_SIZE + BEAD_SIZE/2);
        }
    }

    // 选择框
    if (selection) drawSelection();
}

function drawBead(x, y, color, num) {
    // 方块填满（和参考图一致）
    ctx.fillStyle = color;
    ctx.fillRect(x, y, BEAD_SIZE, BEAD_SIZE);
    // 豆子编号（格子左上角，清晰小号）
    if (num && num > 0) {
        const fontSize = Math.max(7, Math.floor(BEAD_SIZE * 0.36));
        ctx.font = `${fontSize}px Arial`;
        // 白底描边
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(num, x + 1, y);
        ctx.fillStyle = '#333';
        ctx.fillText(num, x + 1, y);
    }
}

function drawBlankBead(x, y) {
    // 空白格子：细虚线边框
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    ctx.strokeRect(x + 2, y + 2, BEAD_SIZE - 4, BEAD_SIZE - 4);
    ctx.setLineDash([]);
}

function updateStats() {
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    let total = 0, blank = 0;
    const colorCounts = {};
    const usedColors = new Set();
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const cell = beadData[y][x];
            if (cell.type === 'blank') { blank++; continue; }
            if (excludedColors.has(cell.hex)) { blank++; continue; }
            total++;
            usedColors.add(cell.hex);
            if (!colorCounts[cell.hex]) colorCounts[cell.hex] = { ...cell, count:0 };
            colorCounts[cell.hex].count++;
        }
    }
    document.getElementById('statSize').textContent = `${w}×${h}`;
    document.getElementById('statBeads').textContent = total;
    document.getElementById('statBlank').textContent = blank;
    document.getElementById('statColors').textContent = usedColors.size;
    document.getElementById('totalBeads').textContent = total;
    document.getElementById('totalBeads2').textContent = total+'颗';

    const colorList = document.getElementById('colorList');
    const sorted = Object.values(colorCounts).filter(c=>c.count>0).sort((a,b)=>b.count-a.count);
    if (sorted.length === 0) {
        colorList.innerHTML = '<p class="color-empty">生成图案后显示颜色清单</p>';
        return;
    }
    colorList.innerHTML = sorted.map(c => `
        <div class="color-item ${excludedColors.has(c.hex)?'excluded':''}" onclick="toggleExcludeColor('${c.hex}')">
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
    if (excludedColors.has(hex)) excludedColors.delete(hex);
    else excludedColors.add(hex);
    renderCanvas();
    updateStats();
}

function regenerate() {
    if (!currentImage) return;
    generatePerlerBeads();
}

// ---------- 画布鼠标操作 ----------
function onCanvasMouseDown(e) {
    if (!beadData) return;
    saveHistory();
    isDrawing = true;
    handleDraw(e);
}
function onCanvasMouseMove(e) {
    if (!beadData) return;
    updateCursorPos(e);
    if (isDrawing) handleDraw(e);
}
function onCanvasLeave() {
    isDrawing = false;
    document.getElementById('cursorPos').textContent = '坐标: --';
    document.getElementById('hoverColor').textContent = '颜色: --';
}
function updateCursorPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX * scaleX - rect.left * scaleX - MARGIN) / BEAD_SIZE);
    const y = Math.floor((e.clientY * scaleY - rect.top * scaleY - MARGIN) / BEAD_SIZE);
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    if (x >= 0 && x < w && y >= 0 && y < h) {
        const cell = beadData[y][x];
        document.getElementById('cursorPos').textContent = `坐标: (${x+1},${y+1})`;
        document.getElementById('hoverColor').textContent = cell.type==='color' ? `颜色: ${cell.code} ${cell.name}` : '颜色: 留白';
    }
}

function handleDraw(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX * scaleX - rect.left * scaleX - MARGIN) / BEAD_SIZE);
    const y = Math.floor((e.clientY * scaleY - rect.top * scaleY - MARGIN) / BEAD_SIZE);
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    if (x < 0 || x >= w || y < 0 || y >= h) return;

    if (currentTool === 'brush') {
        beadData[y][x] = {hex:currentColor, name:currentColorName, code:currentColorCode, type:'color'};
        renderCanvas();
        updateStats();
    } else if (currentTool === 'eraser') {
        beadData[y][x] = {hex:'#FFFFFF',name:'留白',code:'---',type:'blank'};
        renderCanvas();
        updateStats();
    } else if (currentTool === 'picker') {
        const cell = beadData[y][x];
        if (cell.type === 'color') {
            selectColor(cell.hex, cell.name, cell.code);
            selectTool('brush');
        }
    } else if (currentTool === 'fill') {
        floodFill(x, y, beadData[y][x]);
        renderCanvas();
        updateStats();
    } else if (currentTool === 'wand') {
        wandSelect(x, y);
    } else if (currentTool === 'select') {
        if (!isSelecting) {
            isSelecting = true;
            selStartX = x; selStartY = y;
            selection = {x1:x, y1:y, x2:x, y2:y};
        } else {
            selection = {
                x1: Math.min(selStartX, x), y1: Math.min(selStartY, y),
                x2: Math.max(selStartX, x), y2: Math.max(selStartY, y)
            };
            isSelecting = false;
            renderCanvas();
        }
    }
}

function stopDrawing() { isDrawing = false; }

// ---------- 填充工具（洪水填充） ----------
function floodFill(startX, startY, targetColor) {
    const h = beadData.length, w = beadData[0].length;
    const cell = beadData[startY][startX];
    if (cell.type !== targetColor.type) return;
    if (cell.type === 'color' && cell.hex === currentColor) return;
    const stack = [[startX, startY]];
    const visited = new Set();
    while (stack.length) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        if (visited.has(key) || x<0||x>=w||y<0||y>=h) continue;
        const c = beadData[y][x];
        if (c.type !== targetColor.type) continue;
        if (c.type === 'color' && c.hex !== targetColor.hex) continue;
        visited.add(key);
        beadData[y][x] = {hex:currentColor, name:currentColorName, code:currentColorCode, type:'color'};
        stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
}

// ---------- 魔棒工具 ----------
function wandSelect(startX, startY) {
    if (!beadData) return;
    const cell = beadData[startY][startX];
    if (cell.type !== 'color') return;
    wandFromColor = {hex:cell.hex, name:cell.name, code:cell.code, type:cell.type};
    // 打开替换颜色弹窗
    const preview = document.getElementById('fromColorPreview');
    preview.style.background = cell.hex;
    document.getElementById('fromColorInfo').textContent = `${cell.code} ${cell.name}`;
    openReplaceModal();
}

function openReplaceModal() {
    document.getElementById('licenseModal').classList.add('hidden');
    document.getElementById('replaceColorModal').classList.remove('hidden');
    const palette = document.getElementById('replacePalette');
    const colors = PERLER_COLORS[brand];
    palette.innerHTML = colors.map(c =>
        `<div class="palette-color" style="background:${c.hex}" data-hex="${c.hex}" data-name="${c.name}" data-code="${c.code}" onclick="selectReplaceColor('${c.hex}','${c.name}','${c.code}')"></div>`
    ).join('');
}

function selectReplaceColor(hex, name, code) {
    document.getElementById('replaceToPreview').style.background = hex;
    document.getElementById('replaceToCode').textContent = code + ' ' + hex.toUpperCase();
    document.getElementById('replaceToName').textContent = name;
    document.querySelectorAll('#replacePalette .palette-color').forEach(el => el.classList.toggle('active', el.dataset.hex===hex));
    document.getElementById('replaceToPreview').dataset.hex = hex;
    document.getElementById('replaceToPreview').dataset.name = name;
    document.getElementById('replaceToPreview').dataset.code = code;
}
function closeReplaceModal() { document.getElementById('replaceColorModal').classList.add('hidden'); }

function confirmReplaceColor() {
    if (!wandFromColor || !beadData) return;
    const toEl = document.getElementById('replaceToPreview');
    const toHex = toEl.dataset.hex;
    const toName = toEl.dataset.name;
    const toCode = toEl.dataset.code;
    if (!toHex) return;
    const h = beadData.length, w = beadData[0].length;
    let count = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const cell = beadData[y][x];
            if (cell.type==='color' && cell.hex===wandFromColor.hex) {
                beadData[y][x] = {hex:toHex, name:toName, code:toCode, type:'color'};
                count++;
            }
        }
    closeReplaceModal();
    renderCanvas();
    updateStats();
    document.getElementById('statusTip').textContent = `已替换 ${count} 个格子`;
}

// ---------- 工具选择 ----------
function selectTool(tool) {
    currentTool = tool;
    ['brush','eraser','picker','fill','wand','select'].forEach(t => {
        document.getElementById('tool'+capitalize(t))?.classList.toggle('active', t===tool);
    });
    canvas.style.cursor = tool==='picker' ? 'crosshair' : tool==='select' ? 'crosshair' : 'default';
}
function capitalize(s) { return s.charAt(0).toUpperCase()+s.slice(1); }

// ---------- 辅助显示切换 ----------
let gridOn = true, numbersOn = true, colorCodeOn = false;
function toggleGridLines() {
    gridOn = !gridOn;
    showGrid = gridOn;
    document.getElementById('btnGrid').classList.toggle('active', gridOn);
    if (beadData) renderCanvas();
}
function toggleColorCode() {
    colorCodeOn = !colorCodeOn;
    showColorCode = colorCodeOn;
    document.getElementById('btnColorCode').classList.toggle('active', colorCodeOn);
    if (beadData) renderCanvas();
}
function toggleNumbers() {
    numbersOn = !numbersOn;
    showNumbers = numbersOn;
    document.getElementById('btnNumbers').classList.toggle('active', numbersOn);
    if (beadData) renderCanvas();
}
function drawSelection() {
    if (!selection) return;
    const {x1,y1,x2,y2} = selection;
    ctx.strokeStyle = '#ff9f43';
    ctx.lineWidth = 2;
    ctx.setLineDash([4,4]);
    ctx.strokeRect(
        MARGIN + x1*BEAD_SIZE, MARGIN + y1*BEAD_SIZE,
        (x2-x1+1)*BEAD_SIZE, (y2-y1+1)*BEAD_SIZE
    );
    ctx.setLineDash([]);
}

// ---------- 旋转 & 镜像 ----------
function rotateCanvas(deg) {
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    const newData = [];
    if (deg === 180) {
        for (let y = h-1; y >= 0; y--) {
            const row = [];
            for (let x = w-1; x >= 0; x--) row.push(beadData[y][x]);
            newData.push(row);
        }
    } else {
        // 90° - 转置+翻转
        const nh = w, nw = h;
        for (let x = w-1; x >= 0; x--) {
            const row = [];
            for (let y = 0; y < h; y++) row.push(beadData[y][x]);
            newData.push(row);
        }
        gridWidth = nh; gridHeight = nw;
        document.getElementById('gridW').value = nh; document.getElementById('gridWValue').textContent = nh;
        document.getElementById('gridH').value = nw; document.getElementById('gridHValue').textContent = nw;
    }
    beadData = newData;
    gridWidth = beadData[0].length;
    gridHeight = beadData.length;
    renderCanvas();
    updateStats();
}
function flipCanvas(dir) {
    if (!beadData) return;
    const h = beadData.length;
    if (dir === 'h') {
        beadData = beadData.map(row => [...row].reverse());
    } else {
        beadData = [...beadData].reverse();
    }
    renderCanvas();
    updateStats();
}

// ---------- 局部放大镜 ----------
function toggleMagnifier() {
    const win = document.getElementById('magnifierWindow');
    const isHidden = win.classList.contains('hidden');
    win.classList.toggle('hidden');
    magnifierActive = !isHidden;
    if (magnifierActive) updateMagnifier({clientX:0, clientY:0});
}

function setMagZoom(z) {
    magnifierZoom = z;
    document.querySelectorAll('.mag-zoom-btn').forEach(b => b.classList.toggle('active', parseInt(b.textContent)===z));
}

function updateMagnifier(e) {
    if (!magnifierActive || !beadData) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX * scaleX - rect.left * scaleX - MARGIN) / BEAD_SIZE;
    const cy = (e.clientY * scaleY - rect.top * scaleY - MARGIN) / BEAD_SIZE;
    const h = beadData.length, w = beadData[0].length;

    const magSize = 256;
    const gridPx = BEAD_SIZE * (canvas.width / (w * BEAD_SIZE + MARGIN * 2)) * magnifierZoom;
    const displaySize = Math.max(gridPx, 20);

    magCanvas.width = magSize;
    magCanvas.height = magSize;
    magCtx.fillStyle = '#fff';
    magCtx.fillRect(0, 0, magSize, magSize);

    // 绘制周围9宫格
    const range = Math.ceil(magSize / 2 / gridPx) + 1;
    const startX = Math.max(0, Math.floor(cx - range));
    const startY = Math.max(0, Math.floor(cy - range));

    magCtx.save();
    magCtx.translate(magSize/2 - cx * gridPx, magSize/2 - cy * gridPx);

    for (let gy = startY; gy < startY + range*2+1 && gy < h; gy++) {
        for (let gx = startX; gx < startX + range*2+1 && gx < w; gx++) {
            if (gx < 0 || gy < 0) continue;
            const cell = beadData[gy][gx];
            const px = MARGIN + gx * BEAD_SIZE * (canvas.width/(w*BEAD_SIZE+MARGIN*2));
            const py = MARGIN + gy * BEAD_SIZE * (canvas.height/(h*BEAD_SIZE+MARGIN*2));
            const bz = BEAD_SIZE * (canvas.width/(w*BEAD_SIZE+MARGIN*2));
            if (cell.type === 'color') {
                magCtx.beginPath();
                magCtx.arc(px + bz/2, py + bz/2, bz/2 - 1, 0, Math.PI*2);
                magCtx.fillStyle = cell.hex;
                magCtx.fill();
                magCtx.strokeStyle = 'rgba(0,0,0,0.2)';
                magCtx.lineWidth = 0.5;
                magCtx.stroke();
            } else if (showBlank) {
                magCtx.strokeStyle = '#ddd';
                magCtx.lineWidth = 0.5;
                magCtx.beginPath();
                magCtx.arc(px + bz/2, py + bz/2, bz/2-1, 0, Math.PI*2);
                magCtx.setLineDash([2,2]);
                magCtx.stroke();
                magCtx.setLineDash([]);
            }
        }
    }

    // 中心十字
    magCtx.restore();
    magCtx.strokeStyle = '#ff9f43';
    magCtx.lineWidth = 2;
    magCtx.beginPath();
    magCtx.moveTo(magSize/2, 0); magCtx.lineTo(magSize/2, magSize);
    magCtx.moveTo(0, magSize/2); magCtx.lineTo(magSize, magSize/2);
    magCtx.stroke();

    // 当前格子信息
    if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
        document.getElementById('magCoord').textContent = `网格坐标: (${Math.floor(cx)+1}, ${Math.floor(cy)+1})`;
    } else {
        document.getElementById('magCoord').textContent = '网格坐标: --';
    }
}

function onMagMouseDown(e) {
    if (!beadData) return;
    isDrawing = true;
    onMagMouseMove(e);
}
function onMagMouseMove(e) {
    if (!isDrawing || !beadData) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX * scaleX - rect.left * scaleX - MARGIN) / BEAD_SIZE);
    const y = Math.floor((e.clientY * scaleY - rect.top * scaleY - MARGIN) / BEAD_SIZE);
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    if (currentTool === 'brush') {
        beadData[y][x] = {hex:currentColor, name:currentColorName, code:currentColorCode, type:'color'};
        renderCanvas();
        updateStats();
    } else if (currentTool === 'eraser') {
        beadData[y][x] = {hex:'#FFFFFF',name:'留白',code:'---',type:'blank'};
        renderCanvas();
        updateStats();
    }
}

// ---------- 窗口拖动 ----------
function makeDraggable(id) {
    const el = document.getElementById(id);
    const header = el.querySelector('.magnifier-header') || el;
    let dragging = false, offsetX, offsetY;
    header.addEventListener('mousedown', e => {
        if (e.target.tagName === 'BUTTON') return;
        dragging = true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
    });
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
    });
    document.addEventListener('mouseup', () => dragging = false);
}

// ---------- 历史记录 ----------
function saveHistory() {
    if (!canvas) return;
    history = history.slice(0, historyIndex + 1);
    history.push(canvas.toDataURL());
    if (history.length > 50) { history.shift(); } else { historyIndex++; }
}
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
        img.src = history[historyIndex];
    }
}
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
        img.src = history[historyIndex];
    }
}
function loadHistory() {}
function showHistory() {
    document.getElementById('historyModal').classList.remove('hidden');
    document.getElementById('historyList').innerHTML = '<p class="history-empty">当前会话历史由内存保存，刷新将清除</p>';
}
function closeHistory() { document.getElementById('historyModal').classList.add('hidden'); }
function showTutorial() { document.getElementById('tutorialModal').classList.remove('hidden'); }
function closeTutorial() { document.getElementById('tutorialModal').classList.add('hidden'); }

// ---------- 全屏 ----------
function toggleFullscreen() {
    const el = document.getElementById('fullscreenOverlay');
    const fs = document.getElementById('fullscreenCanvas');
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        fs.width = canvas.width; fs.height = canvas.height;
        fs.getContext('2d').drawImage(canvas, 0, 0);
    } else {
        el.classList.add('hidden');
    }
}

// ---------- 画布缩放 ----------
function applyCanvasZoom() {
    const wrapper = document.getElementById('canvasWrapper');
    if (!wrapper) return;
    wrapper.style.transform = `scale(${canvasScale})`;
    wrapper.style.transformOrigin = 'top left';
    // wrapper 宽度需要重新计算
    const w = canvas.width * canvasScale;
    const h = canvas.height * canvasScale;
    wrapper.style.width = w + 'px';
    wrapper.style.height = h + 'px';
}

// 平移偏移量（拖动画布）
let panOffsetX = 0;
let panOffsetY = 0;

function applyCanvasTransform() {
    const wrapper = document.getElementById('canvasWrapper');
    if (!wrapper) return;
    wrapper.style.transform = `translate(${panOffsetX}px, ${panOffsetY}px) scale(${canvasScale})`;
    wrapper.style.transformOrigin = 'top left';
}

function resetPan() {
    panOffsetX = 0;
    panOffsetY = 0;
    applyCanvasTransform();
}

// 拖动画布（按住空格 + 拖动，或工具栏外区域拖动）
let isPanning = false;
let panStart = {x:0, y:0, ox:0, oy:0};
let spaceDown = false;

function initCanvasPan() {
    const editor = document.getElementById('canvasEditor');
    if (!editor) return;
    editor.style.cursor = '';

    editor.addEventListener('mousedown', (e) => {
        // 仅在中间按键、空格、或工具栏外按住时拖动
        if (e.button === 1 || spaceDown) {
            e.preventDefault();
            isPanning = true;
            panStart = {x: e.clientX, y: e.clientY, ox: panOffsetX, oy: panOffsetY};
            editor.style.cursor = 'grabbing';
        }
    });
    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panOffsetX = panStart.ox + (e.clientX - panStart.x);
        panOffsetY = panStart.oy + (e.clientY - panStart.y);
        applyCanvasTransform();
    });
    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            editor.style.cursor = spaceDown ? 'grab' : '';
        }
    });

    // Ctrl+滚轮 = 缩放；普通滚轮 = 不滚动（画布已缩放，自动溢出即可）
    editor.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) zoomCanvasIn();
            else zoomCanvasOut();
        }
    }, {passive:false});

    // 空格按下后画布变 grab 光标
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'INPUT') {
            spaceDown = true;
            editor.style.cursor = 'grab';
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spaceDown = false;
            editor.style.cursor = '';
        }
    });
}

function zoomCanvasIn() {
    canvasScale = Math.min(canvasScale + 0.25, 8);
    applyCanvasTransform();
}
function zoomCanvasOut() {
    canvasScale = Math.max(canvasScale - 0.25, 0.2);
    applyCanvasTransform();
}
function zoomCanvasFit() {
    canvasScale = 1;
    panOffsetX = 0;
    panOffsetY = 0;
    applyCanvasTransform();
}
function toggleBeadNumbers() {
    showBeadNumbers = !showBeadNumbers;
    document.getElementById('btnBeadNums').classList.toggle('active', showBeadNumbers);
    if (beadData) renderCanvas();
}

// ---------- 保存/加载 ----------
function saveProject() {
    if (!beadData) { alert('请先生成图案'); return; }
    const data = JSON.stringify({ beadData, gridWidth, gridHeight, brand });
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pixelbead_project.json'; a.click();
    URL.revokeObjectURL(url);
    document.getElementById('statusTip').textContent = '项目已保存为 .json 文件';
}
function loadProject() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const obj = JSON.parse(ev.target.result);
                beadData = obj.beadData;
                gridWidth = obj.gridWidth;
                gridHeight = obj.gridHeight;
                brand = obj.brand || 'MARD';
                document.getElementById('gridW').value = gridWidth;
                document.getElementById('gridWValue').textContent = gridWidth;
                document.getElementById('gridH').value = gridHeight;
                document.getElementById('gridHValue').textContent = gridHeight;
                setBrand(brand);
                document.getElementById('uploadZone').classList.add('hidden');
                document.getElementById('canvasEditor').classList.remove('hidden');
                document.getElementById('toolbarArea').classList.remove('hidden');
                renderCanvas();
                updateStats();
                document.getElementById('statusTip').textContent = '项目已加载';
            } catch(e) { alert('文件格式错误'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ---------- 物料清单 ----------
function exportExcel() {
    if (!beadData) { alert('请先生成图案'); return; }
    const h = beadData.length, w = beadData[0].length;
    const counts = {};
    for (let y=0; y<h; y++)
        for (let x=0; x<w; x++) {
            const cell = beadData[y][x];
            if (cell.type==='color' && !excludedColors.has(cell.hex)) {
                if (!counts[cell.hex]) counts[cell.hex] = {...cell, count:0};
                counts[cell.hex].count++;
            }
        }
    const sorted = Object.values(counts).filter(c=>c.count>0).sort((a,b)=>b.count-a.count);
    let total = 0;
    const rows = sorted.map(c => { total += c.count; return [c.code, c.name, c.hex, c.count]; });
    rows.push(['总计', '', '', total]);
    const csv = ['色号,颜色名,色值,数量'].concat(rows.map(r=>r.join(','))).join('\n');
    const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '拼豆物料清单.csv'; a.click();
    URL.revokeObjectURL(url);
    document.getElementById('statusTip').textContent = '物料清单已下载';
}
function showExcelModal() {
    if (!beadData) return;
    const h = beadData.length, w = beadData[0].length;
    const counts = {};
    for (let y=0; y<h; y++)
        for (let x=0; x<w; x++) {
            const cell = beadData[y][x];
            if (cell.type==='color' && !excludedColors.has(cell.hex)) {
                if (!counts[cell.hex]) counts[cell.hex] = {...cell, count:0};
                counts[cell.hex].count++;
            }
        }
    const sorted = Object.values(counts).filter(c=>c.count>0).sort((a,b)=>b.count-a.count);
    let total = 0, html = '<table class="excel-table"><thead><tr><th>色号</th><th>颜色名</th><th>色值</th><th>数量</th></tr></thead><tbody>';
    sorted.forEach(c => { total += c.count; html += `<tr><td>${c.code}</td><td>${c.name}</td><td><span style="display:inline-block;width:16px;height:16px;background:${c.hex};border-radius:3px;vertical-align:middle;margin-right:6px"></span>${c.hex}</td><td>${c.count}</td></tr>`; });
    html += `<tr class="total-row"><td colspan=3>总计</td><td>${total}颗</td></tr></tbody></table>`;
    html += '<button class="btn-generate" style="margin-top:12px" onclick="exportExcel()">📥 下载 CSV</button>';
    document.getElementById('excelContent').innerHTML = html;
    document.getElementById('excelModal').classList.remove('hidden');
}
function closeExcelModal() { document.getElementById('excelModal').classList.add('hidden'); }

// ---------- 下载 ----------
function downloadImage() {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'pixelbead_' + new Date().toLocaleDateString().replace(/\//g,'-') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
function downloadPDF() {
    if (!beadData) { 
        alert('请先生成图案'); 
        return; 
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: beadData[0].length > beadData.length ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const titleHeight = 15;
    const footerHeight = 20;
    
    // 标题
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PixelBead 拼豆图纸', pageWidth / 2, margin + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${gridWidth} x ${gridHeight} | 品牌: ${brand} | 生成时间: ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 13, { align: 'center' });
    
    // 计算画布尺寸
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2 - titleHeight - footerHeight;
    const cellSize = Math.min(availableWidth / gridWidth, availableHeight / gridHeight);
    const canvasWidth = cellSize * gridWidth;
    const canvasHeight = cellSize * gridHeight;
    const startX = (pageWidth - canvasWidth) / 2;
    const startY = margin + titleHeight + 5;
    
    // 绘制网格和颜色
    doc.setLineWidth(0.1);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = beadData[y][x];
            const px = startX + x * cellSize;
            const py = startY + y * cellSize;
            
            // 填充颜色
            if (cell && cell.hex) {
                const rgb = hexToRgb(cell.hex);
                doc.setFillColor(rgb.r, rgb.g, rgb.b);
                doc.rect(px, py, cellSize, cellSize, 'F');
            }
            
            // 网格线
            doc.setDrawColor(180, 180, 180);
            doc.rect(px, py, cellSize, cellSize, 'S');
            
            // 色号标注（网格较大时显示）
            if (cell && cell.code && cellSize > 5) {
                doc.setFontSize(Math.max(2, cellSize * 0.4));
                doc.setTextColor(50, 50, 50);
                doc.text(cell.code, px + cellSize / 2, py + cellSize / 2 + 0.5, { align: 'center' });
            }
        }
    }
    
    // 物料清单（第二页）
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('物料清单', pageWidth / 2, margin + 8, { align: 'center' });
    
    const counts = {};
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = beadData[y][x];
            if (cell && cell.code) {
                const key = `${cell.code}|${cell.hex}|${cell.name}`;
                counts[key] = (counts[key] || 0) + 1;
            }
        }
    }
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let lineY = margin + 20;
    doc.setTextColor(80, 80, 80);
    doc.text('色号', margin, lineY);
    doc.text('颜色', margin + 30, lineY);
    doc.text('名称', margin + 50, lineY);
    doc.text('数量', margin + 90, lineY);
    doc.text('小计', margin + 110, lineY);
    
    lineY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, lineY, pageWidth - margin, lineY);
    lineY += 5;
    
    let totalBeads = 0;
    let colorCount = 0;
    
    sorted.forEach(([key, count]) => {
        const [code, hex, name] = key.split('|');
        const rgb = hexToRgb(hex);
        
        // 色块
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(margin + 25, lineY - 3, 15, 6, 'F');
        doc.setDrawColor(150, 150, 150);
        doc.rect(margin + 25, lineY - 3, 15, 6, 'S');
        
        doc.setTextColor(50, 50, 50);
        doc.text(code, margin + 5, lineY);
        doc.text(name || '-', margin + 50, lineY);
        doc.text(count.toString(), margin + 90, lineY);
        doc.text(count.toString(), margin + 110, lineY);
        
        lineY += 8;
        totalBeads += count;
        colorCount++;
        
        if (lineY > pageHeight - margin - 20) {
            doc.addPage();
            lineY = margin + 15;
        }
    });
    
    // 总计
    lineY += 5;
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, lineY, pageWidth - margin, lineY);
    lineY += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 120, 240);
    doc.text(`总计: ${colorCount} 种颜色 | ${totalBeads} 颗豆子`, margin, lineY);
    
    // 下载
    const filename = `PixelBead_${gridWidth}x${gridHeight}_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
    
    document.getElementById('statusTip').textContent = 'PDF 已下载: ' + filename;
}

// 十六进制转 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

// ---------- 卡密验证 ----------
function verifyLicense() {
    const phone = document.getElementById('phone').value;
    const license = document.getElementById('license').value;
    const msg = document.getElementById('message');
    if (phone.length !== 11) { msg.textContent='请输入11位手机号'; msg.className='message error'; return; }
    if (license.length !== 10) { msg.textContent='请输入10位卡密'; msg.className='message error'; return; }
    msg.textContent='验证中...'; msg.className='message info';
    fetch('https://vercelapp-opal-omega.vercel.app/api/verify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({phone, license})
    })
    .then(r=>r.json())
    .then(d=>{
        if (d.success) {
            msg.textContent='验证成功！'; msg.className='message success';
            setTimeout(()=>closeLicenseModal(), 1000);
        } else { msg.textContent=d.message||'验证失败'; msg.className='message error'; }
    })
    .catch(()=>{ msg.textContent='验证服务暂不可用'; msg.className='message error'; });
}
function closeLicenseModal() { document.getElementById('licenseModal').classList.add('hidden'); }

// 初始化画布平移交互
initCanvasPan();

// ---------- 模式切换 ----------
let currentMode = 'simple'; // 'simple' | 'pro'

function switchMode(mode) {
    currentMode = mode;
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('.header');
    const statusBar = document.getElementById('statusBar');
    const canvasEditor = document.getElementById('canvasEditor');
    
    // 更新按钮状态
    document.querySelectorAll('.mode-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    if (mode === 'pro') {
        // 专业全屏：隐藏侧边栏和头部，画布全屏
        sidebar.style.display = 'none';
        header.style.display = 'none';
        statusBar.style.display = 'none';
        document.body.classList.add('pro-mode');
        
        // 显示底部抽屉工具栏
        showProDrawer();
    } else {
        // 极简模式：恢复默认布局
        sidebar.style.display = '';
        header.style.display = '';
        statusBar.style.display = '';
        document.body.classList.remove('pro-mode');
        
        // 隐藏底部抽屉
        hideProDrawer();
    }
    
    // 重新计算画布尺寸
    if (beadData) {
        setTimeout(() => renderCanvas(), 100);
    }
}

// ---------- 专业全屏底部抽屉 ----------
let proDrawer = null;

function showProDrawer() {
    if (!proDrawer) {
        proDrawer = document.createElement('div');
        proDrawer.id = 'proDrawer';
        proDrawer.innerHTML = `
            <div class="pro-drawer-inner">
                <div class="pro-tools">
                    <button class="pro-tool" onclick="setTool('drag')" title="拖动">✋</button>
                    <button class="pro-tool" onclick="setTool('brush')" title="画笔">✏️</button>
                    <button class="pro-tool" onclick="setTool('eraser')" title="橡皮">🧽</button>
                    <button class="pro-tool" onclick="setTool('picker')" title="吸管">💉</button>
                    <button class="pro-tool" onclick="setTool('wand')" title="魔棒">🪄</button>
                    <button class="pro-tool" onclick="setTool('fill')" title="填充">🪣</button>
                    <span class="pro-divider"></span>
                    <button class="pro-tool" onclick="rotateCanvas(90)" title="旋转">↻</button>
                    <button class="pro-tool" onclick="flipCanvas('h')" title="镜像">⇄</button>
                    <span class="pro-divider"></span>
                    <button class="pro-tool" onclick="downloadImage()" title="下载PNG">💾</button>
                    <button class="pro-tool exit" onclick="switchMode('simple')" title="退出全屏">✕ 退出</button>
                </div>
                <div class="pro-colors" id="proColorPalette"></div>
            </div>
        `;
        document.body.appendChild(proDrawer);
        
        // 填充颜色面板
        const colorPalette = document.getElementById('proColorPalette');
        const colors = getCurrentColors();
        colors.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'pro-color-btn';
            btn.style.backgroundColor = c.hex;
            btn.title = c.name;
            btn.onclick = () => {
                currentColor = c.hex;
                currentColorName = c.name;
                currentColorCode = c.code || '';
                document.querySelectorAll('.pro-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            colorPalette.appendChild(btn);
        });
    }
    proDrawer.style.display = 'block';
}

function hideProDrawer() {
    if (proDrawer) {
        proDrawer.style.display = 'none';
    }
}

// ---------- 裁剪弹窗 ----------
let cropModal = null;
let cropCanvas, cropCtx;
let cropImage = null;
let cropX = 0, cropY = 0, cropW = 100, cropH = 100;
let cropScale = 1;
let cropRatio = 'free'; // 'free', '1:1', '4:3', '16:9', '3:4', '9:16'
let isDraggingCrop = false;
let dragCropStart = { x: 0, y: 0 };

function showCropModal(img) {
    cropImage = img;
    
    if (!cropModal) {
        cropModal = document.createElement('div');
        cropModal.id = 'cropModal';
        cropModal.className = 'modal-overlay';
        cropModal.innerHTML = `
            <div class="modal-content crop-modal-content">
                <div class="modal-header">
                    <h3>✂️ 裁剪图片</h3>
                    <button class="modal-close" onclick="closeCropModal()">✕</button>
                </div>
                <div class="crop-body">
                    <div class="crop-preview-area">
                        <canvas id="cropCanvas"></canvas>
                        <div class="crop-box" id="cropBox"></div>
                    </div>
                    <div class="crop-controls">
                        <div class="crop-control-group">
                            <label>缩放</label>
                            <input type="range" id="cropScaleSlider" min="10" max="200" value="100" oninput="updateCropScale(this.value)">
                            <span id="cropScaleValue">100%</span>
                        </div>
                        <div class="crop-control-group">
                            <label>裁剪框大小</label>
                            <input type="range" id="cropSizeSlider" min="50" max="500" value="200" oninput="updateCropSize(this.value)">
                            <span id="cropSizeValue">200px</span>
                        </div>
                        <div class="crop-control-group">
                            <label>比例预设</label>
                            <div class="crop-ratio-btns">
                                <button class="ratio-btn active" onclick="setCropRatio('free')">自由</button>
                                <button class="ratio-btn" onclick="setCropRatio('1:1')">1:1</button>
                                <button class="ratio-btn" onclick="setCropRatio('4:3')">4:3</button>
                                <button class="ratio-btn" onclick="setCropRatio('3:4')">3:4</button>
                                <button class="ratio-btn" onclick="setCropRatio('16:9')">16:9</button>
                            </div>
                        </div>
                        <div class="crop-control-group">
                            <button class="btn-secondary" onclick="resetCrop()">重置</button>
                            <button class="btn-secondary" onclick="centerCrop()">居中</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="skipCrop()">跳过裁剪</button>
                    <button class="btn-primary" onclick="applyCrop()">确认裁剪</button>
                </div>
            </div>
        `;
        document.body.appendChild(cropModal);
        
        cropCanvas = document.getElementById('cropCanvas');
        cropCtx = cropCanvas.getContext('2d');
        
        // 裁剪框拖动
        const cropBox = document.getElementById('cropBox');
        cropBox.addEventListener('mousedown', startDragCrop);
        cropBox.addEventListener('touchstart', startDragCrop);
        document.addEventListener('mousemove', dragCrop);
        document.addEventListener('touchmove', dragCrop);
        document.addEventListener('mouseup', stopDragCrop);
        document.addEventListener('touchend', stopDragCrop);
    }
    
    // 初始化裁剪参数
    const maxSize = Math.min(img.width, img.height, 400);
    cropW = maxSize;
    cropH = maxSize;
    cropX = (img.width - cropW) / 2;
    cropY = (img.height - cropH) / 2;
    cropScale = 100;
    
    document.getElementById('cropScaleSlider').value = 100;
    document.getElementById('cropScaleValue').textContent = '100%';
    document.getElementById('cropSizeSlider').value = maxSize;
    document.getElementById('cropSizeValue').textContent = maxSize + 'px';
    
    drawCropPreview();
    cropModal.classList.add('show');
}

function drawCropPreview() {
    if (!cropImage) return;
    
    const canvasSize = 400;
    cropCanvas.width = canvasSize;
    cropCanvas.height = canvasSize;
    
    // 绘制棋盘格背景
    const checkSize = 10;
    for (let y = 0; y < canvasSize; y += checkSize) {
        for (let x = 0; x < canvasSize; x += checkSize) {
            cropCtx.fillStyle = ((x + y) / checkSize % 2 === 0) ? '#f0f0f0' : '#ffffff';
            cropCtx.fillRect(x, y, checkSize, checkSize);
        }
    }
    
    // 计算缩放后的图片尺寸和位置
    const scale = cropScale / 100;
    const imgW = cropImage.width * scale;
    const imgH = cropImage.height * scale;
    const imgX = (canvasSize - imgW) / 2;
    const imgY = (canvasSize - imgH) / 2;
    
    // 绘制图片
    cropCtx.drawImage(cropImage, imgX, imgY, imgW, imgH);
    
    // 绘制遮罩层（裁剪框外半透明）
    cropCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // 计算裁剪框在 canvas 中的位置
    const boxX = imgX + cropX * scale;
    const boxY = imgY + cropY * scale;
    const boxW = cropW * scale;
    const boxH = cropH * scale;
    
    // 遮罩（四个区域）
    cropCtx.fillRect(0, 0, canvasSize, boxY); // 上
    cropCtx.fillRect(0, boxY + boxH, canvasSize, canvasSize - boxY - boxH); // 下
    cropCtx.fillRect(0, boxY, boxX, boxH); // 左
    cropCtx.fillRect(boxX + boxW, boxY, canvasSize - boxX - boxW, boxH); // 右
    
    // 裁剪框边框
    cropCtx.strokeStyle = '#2b78f0';
    cropCtx.lineWidth = 2;
    cropCtx.strokeRect(boxX, boxY, boxW, boxH);
    
    // 更新裁剪框 DOM 元素位置
    const cropBox = document.getElementById('cropBox');
    cropBox.style.left = boxX + 'px';
    cropBox.style.top = boxY + 'px';
    cropBox.style.width = boxW + 'px';
    cropBox.style.height = boxH + 'px';
}

function updateCropScale(val) {
    cropScale = parseInt(val);
    document.getElementById('cropScaleValue').textContent = val + '%';
    drawCropPreview();
}

function updateCropSize(val) {
    const size = parseInt(val);
    document.getElementById('cropSizeValue').textContent = size + 'px';
    
    // 根据比例调整裁剪框
    if (cropRatio === 'free') {
        cropW = size;
        cropH = size;
    } else if (cropRatio === '1:1') {
        cropW = size;
        cropH = size;
    } else if (cropRatio === '4:3') {
        cropW = size;
        cropH = size * 0.75;
    } else if (cropRatio === '3:4') {
        cropW = size;
        cropH = size * 1.33;
    } else if (cropRatio === '16:9') {
        cropW = size;
        cropH = size * 0.5625;
    }
    
    // 确保裁剪框不超出图片范围
    const scale = cropScale / 100;
    const imgW = cropImage.width * scale;
    const imgH = cropImage.height * scale;
    cropW = Math.min(cropW, imgW);
    cropH = Math.min(cropH, imgH);
    
    drawCropPreview();
}

function setCropRatio(ratio) {
    cropRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === (ratio === 'free' ? '自由' : ratio));
    });
    
    // 根据比例调整裁剪框
    const currentSize = cropW;
    updateCropSize(currentSize);
}

function resetCrop() {
    const maxSize = Math.min(cropImage.width, cropImage.height, 400);
    cropW = maxSize;
    cropH = maxSize;
    cropX = (cropImage.width - cropW) / 2;
    cropY = (cropImage.height - cropH) / 2;
    cropScale = 100;
    cropRatio = 'free';
    
    document.getElementById('cropScaleSlider').value = 100;
    document.getElementById('cropScaleValue').textContent = '100%';
    document.getElementById('cropSizeSlider').value = maxSize;
    document.getElementById('cropSizeValue').textContent = maxSize + 'px';
    
    document.querySelectorAll('.ratio-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.ratio-btn').classList.add('active');
    
    drawCropPreview();
}

function centerCrop() {
    cropX = (cropImage.width - cropW) / 2;
    cropY = (cropImage.height - cropH) / 2;
    drawCropPreview();
}

function startDragCrop(e) {
    isDraggingCrop = true;
    const pos = getEventPos(e);
    dragCropStart = { x: pos.x, y: pos.y };
}

function dragCrop(e) {
    if (!isDraggingCrop) return;
    
    const pos = getEventPos(e);
    const dx = pos.x - dragCropStart.x;
    const dy = pos.y - dragCropStart.y;
    
    // 移动裁剪框（考虑缩放）
    const scale = cropScale / 100;
    cropX -= dx / scale;
    cropY -= dy / scale;
    
    // 边界限制
    cropX = Math.max(0, Math.min(cropX, cropImage.width - cropW));
    cropY = Math.max(0, Math.min(cropY, cropImage.height - cropH));
    
    dragCropStart = { x: pos.x, y: pos.y };
    drawCropPreview();
}

function stopDragCrop() {
    isDraggingCrop = false;
}

function getEventPos(e) {
    const rect = cropCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function closeCropModal() {
    if (cropModal) {
        cropModal.classList.remove('show');
    }
}

function skipCrop() {
    closeCropModal();
    // 直接使用原图生成
    beadData = null;
    document.getElementById('uploadZone').classList.add('hidden');
    document.getElementById('canvasEditor').classList.remove('hidden');
    document.getElementById('toolbarArea').classList.remove('hidden');
    document.getElementById('statusTip').textContent = '提示：按空格+拖动平移，Ctrl+滚轮缩放';
    setTimeout(() => generatePerlerBeads(), 100);
}

function applyCrop() {
    if (!cropImage) return;
    
    // 创建裁剪后的图片
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = cropW;
    tempCanvas.height = cropH;
    
    // 绘制裁剪区域
    tempCtx.drawImage(
        cropImage,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
    );
    
    // 转换为 Image 对象
    const croppedImg = new Image();
    croppedImg.onload = () => {
        currentImage = croppedImg;
        closeCropModal();
        
        beadData = null;
        document.getElementById('uploadZone').classList.add('hidden');
        document.getElementById('canvasEditor').classList.remove('hidden');
        document.getElementById('toolbarArea').classList.remove('hidden');
        document.getElementById('statusTip').textContent = '已裁剪，按空格+拖动平移，Ctrl+滚轮缩放';
        setTimeout(() => generatePerlerBeads(), 100);
    };
    croppedImg.src = tempCanvas.toDataURL();
}


function getCurrentColors() {
    const brands = {
        MARD: MARD_COLORS,
        MARD_FULL: MARD_FULL,
        Perler: PERLER_COLORS,
        Hama: HAMA_COLORS,
        Artkal: ARTKAL_COLORS
    };
    return brands[brand] || MARD_COLORS;
}

// ---------- 色板管理弹窗 ----------
let paletteModal = null;

function openPaletteModal() {
    if (!paletteModal) {
        paletteModal = document.createElement('div');
        paletteModal.id = 'paletteModal';
        paletteModal.className = 'modal-overlay';
        paletteModal.innerHTML = `
            <div class="modal-content palette-modal-content">
                <div class="modal-header">
                    <h3>🎨 色板管理</h3>
                    <button class="modal-close" onclick="closePaletteModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="palette-brand-tabs">
                        <button class="brand-tab active" onclick="switchPaletteBrand('MARD')">MARD</button>
                        <button class="brand-tab" onclick="switchPaletteBrand('Perler')">Perler</button>
                        <button class="brand-tab" onclick="switchPaletteBrand('Hama')">Hama</button>
                        <button class="brand-tab" onclick="switchPaletteBrand('Artkal')">Artkal</button>
                    </div>
                    <div class="palette-search">
                        <input type="text" placeholder="搜索色号或颜色名..." id="paletteSearchInput" oninput="filterPalette()">
                    </div>
                    <div class="palette-actions">
                        <button onclick="selectAllPalette()">全选</button>
                        <button onclick="deselectAllPalette()">全不选</button>
                        <button onclick="importPalette()">导入</button>
                        <button onclick="exportPalette()">导出</button>
                    </div>
                    <div class="palette-grid-container" id="paletteGridContainer">
                        <!-- 动态填充 -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePaletteModal()">取消</button>
                    <button class="btn-primary" onclick="applyPalette()">保存并应用</button>
                </div>
            </div>
        `;
        document.body.appendChild(paletteModal);
    }
    
    // 填充当前品牌的色板
    switchPaletteBrand(brand);
    
    paletteModal.classList.add('show');
}

function closePaletteModal() {
    if (paletteModal) {
        paletteModal.classList.remove('show');
    }
}

let selectedPaletteBrand = 'MARD';
let selectedPaletteColors = new Set();

function switchPaletteBrand(b) {
    selectedPaletteBrand = b;
    document.querySelectorAll('.brand-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent === b);
    });
    
    const container = document.getElementById('paletteGridContainer');
    if (!container) return;
    
    const colors = getCurrentColors();
    container.innerHTML = '';
    
    colors.forEach((c, i) => {
        const div = document.createElement('div');
        div.className = 'palette-item';
        div.innerHTML = `
            <div class="palette-swatch" style="background:${c.hex}"></div>
            <div class="palette-info">
                <span class="palette-code">${c.code || ''}</span>
                <span class="palette-name">${c.name}</span>
            </div>
            <input type="checkbox" class="palette-checkbox" data-index="${i}" ${selectedPaletteColors.has(i) ? 'checked' : ''}>
        `;
        div.onclick = (e) => {
            if (e.target.type !== 'checkbox') {
                const cb = div.querySelector('.palette-checkbox');
                cb.checked = !cb.checked;
                if (cb.checked) {
                    selectedPaletteColors.add(i);
                } else {
                    selectedPaletteColors.delete(i);
                }
            }
        };
        container.appendChild(div);
    });
}

function filterPalette() {
    const query = document.getElementById('paletteSearchInput').value.toLowerCase();
    document.querySelectorAll('.palette-item').forEach(item => {
        const code = item.querySelector('.palette-code').textContent.toLowerCase();
        const name = item.querySelector('.palette-name').textContent.toLowerCase();
        item.style.display = (code.includes(query) || name.includes(query)) ? '' : 'none';
    });
}

function selectAllPalette() {
    document.querySelectorAll('.palette-checkbox').forEach(cb => {
        cb.checked = true;
        selectedPaletteColors.add(parseInt(cb.dataset.index));
    });
}

function deselectAllPalette() {
    document.querySelectorAll('.palette-checkbox').forEach(cb => {
        cb.checked = false;
        selectedPaletteColors.delete(parseInt(cb.dataset.index));
    });
}

function importPalette() {
    alert('导入功能开发中...');
}

function exportPalette() {
    alert('导出功能开发中...');
}

function applyPalette() {
    // 应用选中的颜色到色板
    alert('已应用 ' + selectedPaletteColors.size + ' 个颜色');
    closePaletteModal();
}

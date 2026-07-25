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
// 颜色库（简化版，完整版需要加载外部数据）
// ==========================================
const PERLER_COLORS = {
    MARD: [
        { code: '001', hex: '#FFFFFF', name: '白色' },
        { code: '002', hex: '#000000', name: '黑色' },
        { code: '003', hex: '#FEFEFE', name: '雪白' },
        { code: '004', hex: '#404040', name: '深灰' },
        { code: '005', hex: '#808080', name: '灰色' },
        { code: '006', hex: '#C0C0C0', name: '浅灰' },
        { code: '007', hex: '#FF0000', name: '红色' },
        { code: '008', hex: '#E02000', name: '深红' },
        { code: '009', hex: '#FF6B6B', name: '珊瑚红' },
        { code: '010', hex: '#FF8080', name: '浅红' },
        { code: '011', hex: '#800000', name: '酒红' },
        { code: '012', hex: '#A52A2A', name: '棕色' },
        { code: '013', hex: '#8B4513', name: '深棕' },
        { code: '014', hex: '#D2691E', name: '巧克力' },
        { code: '015', hex: '#F5DEB3', name: '米色' },
        { code: '016', hex: '#FFD700', name: '金色' },
        { code: '017', hex: '#FFA500', name: '橙色' },
        { code: '018', hex: '#FF9F43', name: '蜜橙' },
        { code: '019', hex: '#FECA57', name: '黄色' },
        { code: '020', hex: '#FFFF00', name: '亮黄' },
        { code: '021', hex: '#808000', name: '橄榄绿' },
        { code: '022', hex: '#009432', name: '深绿' },
        { code: '023', hex: '#00B894', name: '薄荷绿' },
        { code: '024', hex: '#96ceb4', name: '浅绿' },
        { code: '025', hex: '#00FF00', name: '亮绿' },
        { code: '026', hex: '#008080', name: '青色' },
        { code: '027', hex: '#00CED1', name: '深青' },
        { code: '028', hex: '#00D2D3', name: '湖蓝' },
        { code: '029', hex: '#45B7D1', name: '天蓝' },
        { code: '030', hex: '#54A0FF', name: '蓝色' },
        { code: '031', hex: '#0000FF', name: '宝蓝' },
        { code: '032', hex: '#000080', name: '深蓝' },
        { code: '033', hex: '#5F27CD', name: '紫色' },
        { code: '034', hex: '#9B59B6', name: '淡紫' },
        { code: '035', hex: '#800080', name: '品红' },
        { code: '036', hex: '#FF00FF', name: '洋红' },
        { code: '037', hex: '#FF9FF3', name: '粉色' },
        { code: '038', hex: '#FFC0CB', name: '粉红' },
        { code: '039', hex: '#FF69B4', name: '热粉' },
        { code: '040', hex: '#DC143C', name: '深粉' },
        { code: '041', hex: '#FFC59F', name: '杏色' },
        { code: '042', hex: '#FFDAB9', name: '桃色' },
        { code: '043', hex: '#FFE4C4', name: '贝壳白' },
        { code: '044', hex: '#FA8072', name: '三文鱼' },
        { code: '045', hex: '#E9967A', name: '暗橙红' },
        { code: '046', hex: '#F08080', name: '淡红' },
        { code: '047', hex: '#CD853F', name: '秘鲁色' },
        { code: '048', hex: '#D2B48C', name: '棕褐色' }
    ],
    Perler: [
        { code: '000', hex: '#FFFFFF', name: 'White' },
        { code: '100', hex: '#000000', name: 'Black' },
        { code: '110', hex: '#FEFEFE', name: 'Snow White' },
        { code: '120', hex: '#414139', name: 'Dark Gray' },
        { code: '130', hex: '#6F6E62', name: 'Medium Gray' },
        { code: '151', hex: '#9B9B93', name: 'Light Gray' },
        { code: '151', hex: '#C5C5BC', name: 'Pearl' },
        { code: '200', hex: '#FF4D00', name: 'Turbo Red' },
        { code: '210', hex: '#FF0000', name: 'Bright Red' },
        { code: '211', hex: '#D60000', name: 'Cherry Red' },
        { code: '220', hex: '#FFA9A9', name: 'Salmon' },
        { code: '221', hex: '#FF8080', name: 'Light Salmon' },
        { code: '222', hex: '#C80000', name: 'Dark Red' },
        { code: '230', hex: '#A80000', name: 'Burgundy' },
        { code: '240', hex: '#940094', name: 'Magenta' },
        { code: '250', hex: '#FF66FF', name: 'Bright Pink' },
        { code: '300', hex: '#FFA300', name: 'Orange' },
        { code: '301', hex: '#FF7800', name: 'Dark Orange' },
        { code: '310', hex: '#FFD9A0', name: 'Light Peach' },
        { code: '311', hex: '#FFBA59', name: 'Peach' },
        { code: '320', hex: '#FFFF00', name: 'Yellow' },
        { code: '321', hex: '#FFE600', name: 'Canary Yellow' },
        { code: '322', hex: '#FFD700', name: 'Sunflower' },
        { code: '330', hex: '#FFD700', name: 'Gold' },
        { code: '400', hex: '#006E2C', name: 'Dark Green' },
        { code: '401', hex: '#009A33', name: 'Emerald' },
        { code: '410', hex: '#80FF80', name: 'Light Green' },
        { code: '411', hex: '#00B400', name: 'Lime' },
        { code: '420', hex: '#007F7F', name: 'Teal' },
        { code: '430', hex: '#00FFA5', name: 'Mint' },
        { code: '440', hex: '#008080', name: 'Turquoise' },
        { code: '450', hex: '#007FBF', name: 'Lake Blue' },
        { code: '460', hex: '#0099CC', name: 'Sky Blue' },
        { code: '470', hex: '#0000FF', name: 'Bright Blue' },
        { code: '471', hex: '#0033AA', name: 'Royal Blue' },
        { code: '500', hex: '#5F2C93', name: 'Grape' },
        { code: '510', hex: '#8B4CA8', name: 'Light Grape' },
        { code: '520', hex: '#330099', name: 'Violet' },
        { code: '530', hex: '#9933CC', name: 'Medium Violet' },
        { code: '540', hex: '#FF66CC', name: 'Bright Magenta' },
        { code: '550', hex: '#FF66FF', name: 'Hot Pink' },
        { code: '600', hex: '#8B5A2B', name: 'Sienna' },
        { code: '601', hex: '#A0522D', name: 'Saddle Brown' },
        { code: '602', hex: '#CD853F', name: 'Tan' },
        { code: '603', hex: '#D2691E', name: 'Chocolate' },
        { code: '604', hex: '#F5DEB3', name: 'Wheat' },
        { code: '605', hex: '#FFE4C4', name: 'Bisque' }
    ],
    Hama: [
        { code: '001', hex: '#FFFFFF', name: 'White' },
        { code: '002', hex: '#000000', name: 'Black' },
        { code: '003', hex: '#F5F5F5', name: 'Off-White' },
        { code: '010', hex: '#FF0000', name: 'Red' },
        { code: '011', hex: '#CC0000', name: 'Dark Red' },
        { code: '012', hex: '#FF6666', name: 'Light Red' },
        { code: '020', hex: '#FF6600', name: 'Orange' },
        { code: '021', hex: '#FF9900', name: 'Light Orange' },
        { code: '030', hex: '#FFCC00', name: 'Yellow' },
        { code: '031', hex: '#FFFF66', name: 'Light Yellow' },
        { code: '040', hex: '#00CC00', name: 'Green' },
        { code: '041', hex: '#66FF66', name: 'Light Green' },
        { code: '042', hex: '#006600', name: 'Dark Green' },
        { code: '050', hex: '#0099FF', name: 'Light Blue' },
        { code: '051', hex: '#0000CC', name: 'Dark Blue' },
        { code: '052', hex: '#00CCCC', name: 'Turquoise' },
        { code: '060', hex: '#9933FF', name: 'Purple' },
        { code: '061', hex: '#FF66FF', name: 'Light Purple' },
        { code: '070', hex: '#FF6699', name: 'Pink' },
        { code: '071', hex: '#FF99CC', name: 'Light Pink' },
        { code: '080', hex: '#996633', name: 'Brown' },
        { code: '081', hex: '#CC9966', name: 'Light Brown' },
        { code: '090', hex: '#808080', name: 'Gray' },
        { code: '091', hex: '#C0C0C0', name: 'Light Gray' },
        { code: '092', hex: '#404040', name: 'Dark Gray' }
    ]
};

// 创建简化颜色查找表
function createColorLookup() {
    const lookup = {};
    for (const brandKey of Object.keys(PERLER_COLORS)) {
        lookup[brandKey] = {};
        for (const color of PERLER_COLORS[brandKey]) {
            lookup[brandKey][color.hex.toUpperCase()] = color;
        }
    }
    return lookup;
}

const colorLookup = createColorLookup();

// ==========================================
// 初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initEventListeners();
    initColorPalette();
    checkVerification();
});

function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
}

function initEventListeners() {
    // 上传
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // 参数滑块
    document.getElementById('gridSize').addEventListener('input', e => {
        gridWidth = parseInt(e.target.value);
        document.getElementById('gridSizeValue').textContent = gridWidth;
        if (lockRatio) {
            // 保持宽高比
        }
    });
    
    document.getElementById('colorLimit').addEventListener('input', e => {
        colorLimit = parseInt(e.target.value);
        const display = colorLimit === 0 ? '不限' : colorLimit;
        document.getElementById('colorLimitValue').textContent = display;
    });
    
    // 图像调节
    document.getElementById('brightness').addEventListener('input', e => {
        brightness = parseInt(e.target.value);
        document.getElementById('brightnessValue').textContent = brightness + '%';
    });
    
    document.getElementById('contrast').addEventListener('input', e => {
        contrast = parseInt(e.target.value);
        document.getElementById('contrastValue').textContent = contrast + '%';
    });
    
    document.getElementById('saturation').addEventListener('input', e => {
        saturation = parseInt(e.target.value);
        document.getElementById('saturationValue').textContent = saturation + '%';
    });
    
    // 开关
    document.getElementById('lockRatio').addEventListener('change', e => lockRatio = e.target.checked);
    document.getElementById('keepWhite').addEventListener('change', e => showBlank = e.target.checked);
    document.getElementById('showGrid').addEventListener('change', e => { showGrid = e.target.checked; regenerate(); });
    document.getElementById('showNumbers').addEventListener('change', e => { showNumbers = e.target.checked; regenerate(); });
    document.getElementById('showColorCode').addEventListener('change', e => { showColorCode = e.target.checked; regenerate(); });
    document.getElementById('enhance').addEventListener('change', e => enhance = e.target.checked);
    document.getElementById('dithering').addEventListener('change', e => dithering = e.target.checked);
    
    // 画布事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // 触摸
    canvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; startDrawing({ clientX: t.clientX, clientY: t.clientY }); }, { passive: false });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); const t = e.touches[0]; draw({ clientX: t.clientX, clientY: t.clientY }); }, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    
    // 验证
    document.getElementById('verifyBtn')?.addEventListener('click', verifyLicense);
}

function initColorPalette() {
    const colors = PERLER_COLORS[brand] || PERLER_COLORS.MARD;
    const palette = document.getElementById('colorPalette');
    if (!palette) return;
    
    palette.innerHTML = colors.map(c => `
        <div class="color-item ${c.hex.toUpperCase() === currentColor.toUpperCase() ? 'active' : ''}" 
             style="background:${c.hex}" 
             data-color="${c.hex}"
             data-code="${c.code}"
             data-name="${c.name}"
             onclick="selectColor('${c.hex}', '${c.code}', '${c.name}')"
             title="${c.name} (${c.code})">
        </div>
    `).join('');
}

function selectColor(hex, code, name) {
    currentColor = hex.toUpperCase();
    currentColorName = name;
    document.getElementById('currentColorPreview').style.background = hex;
    document.getElementById('currentColorCode').textContent = code + ' ' + hex;
    document.getElementById('currentColorName').textContent = name;
    
    document.querySelectorAll('.color-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.color-item[data-color="${hex}"]`)?.classList.add('active');
}

function setBrand(b) {
    brand = b;
    document.querySelectorAll('.brand-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.brand-tab[data-brand="${b}"]`)?.classList.add('active');
    initColorPalette();
    if (currentImage) regenerate();
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

// ==========================================
// 图片处理
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
            triggerCrop();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function triggerCrop() {
    if (!currentImage) return;
    
    const cropContainer = document.getElementById('cropContainer');
    const cropImage = document.getElementById('cropImage');
    const uploadZone = document.getElementById('uploadZone');
    
    cropImage.src = currentImage.src;
    cropContainer.classList.remove('hidden');
    uploadZone.classList.add('hidden');
    
    initCrop();
}

function initCrop() {
    const wrapper = document.getElementById('cropWrapper');
    const cropBox = document.getElementById('cropBox');
    const cropImage = document.getElementById('cropImage');
    const overlay = document.getElementById('cropOverlay');
    
    // 等待图片加载
    cropImage.onload = () => {
        const imgRect = cropImage.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // 计算缩放比例
        const scaleX = cropImage.naturalWidth / imgRect.width;
        const scaleY = cropImage.naturalHeight / imgRect.height;
        
        // 默认选区为整张图片的80%
        const selectW = imgRect.width * 0.8;
        const selectH = imgRect.height * 0.8;
        const selectX = (imgRect.width - selectW) / 2;
        const selectY = (imgRect.height - selectH) / 2;
        
        cropBox.style.left = selectX + 'px';
        cropBox.style.top = selectY + 'px';
        cropBox.style.width = selectW + 'px';
        cropBox.style.height = selectH + 'px';
        
        // 拖动选区
        let isDragging = false;
        let isResizing = false;
        let resizeHandle = null;
        let startX, startY, startLeft, startTop, startW, startH;
        
        cropBox.onmousedown = e => {
            if (e.target.classList.contains('crop-handle')) {
                isResizing = true;
                resizeHandle = e.target.className.split(' ')[1];
            } else {
                isDragging = true;
            }
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(cropBox.style.left);
            startTop = parseFloat(cropBox.style.top);
            startW = parseFloat(cropBox.style.width);
            startH = parseFloat(cropBox.style.height);
            e.stopPropagation();
        };
        
        document.onmousemove = e => {
            if (!isDragging && !isResizing) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            if (isDragging) {
                cropBox.style.left = Math.max(0, Math.min(imgRect.width - startW, startLeft + dx)) + 'px';
                cropBox.style.top = Math.max(0, Math.min(imgRect.height - startH, startTop + dy)) + 'px';
            } else if (isResizing) {
                let newLeft = startLeft;
                let newTop = startTop;
                let newW = startW;
                let newH = startH;
                
                if (resizeHandle.includes('left')) {
                    newLeft = Math.max(0, startLeft + dx);
                    newW = startW - dx;
                }
                if (resizeHandle.includes('right')) {
                    newW = Math.max(50, Math.min(imgRect.width - newLeft, startW + dx));
                }
                if (resizeHandle.includes('top')) {
                    newTop = Math.max(0, startTop + dy);
                    newH = startH - dy;
                }
                if (resizeHandle.includes('bottom')) {
                    newH = Math.max(50, Math.min(imgRect.height - newTop, startH + dy));
                }
                
                cropBox.style.left = newLeft + 'px';
                cropBox.style.top = newTop + 'px';
                cropBox.style.width = newW + 'px';
                cropBox.style.height = newH + 'px';
            }
        };
        
        document.onmouseup = () => {
            isDragging = false;
            isResizing = false;
        };
    };
}

function cancelCrop() {
    document.getElementById('cropContainer').classList.add('hidden');
    document.getElementById('uploadZone').classList.remove('hidden');
}

function confirmCrop() {
    const cropBox = document.getElementById('cropBox');
    const cropImage = document.getElementById('cropImage');
    
    const imgRect = cropImage.getBoundingClientRect();
    const scaleX = cropImage.naturalWidth / imgRect.width;
    const scaleY = cropImage.naturalHeight / imgRect.height;
    
    const left = parseFloat(cropBox.style.left) * scaleX;
    const top = parseFloat(cropBox.style.top) * scaleY;
    const width = parseFloat(cropBox.style.width) * scaleX;
    const height = parseFloat(cropBox.style.height) * scaleY;
    
    // 创建裁剪后的图片
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(currentImage, left, top, width, height, 0, 0, width, height);
    
    const img = new Image();
    img.onload = () => {
        croppedImage = img;
        currentImage = img;
        
        // 计算高度
        const aspectRatio = img.height / img.width;
        gridHeight = Math.round(gridWidth * aspectRatio);
        
        document.getElementById('cropContainer').classList.add('hidden');
        document.getElementById('uploadZone').classList.add('hidden');
        document.getElementById('canvasEditor').classList.remove('hidden');
        
        generatePerlerBeads();
    };
    img.src = tempCanvas.toDataURL();
}

// ==========================================
// 核心：生成拼豆图纸
// ==========================================
function generatePerlerBeads() {
    if (!currentImage) {
        alert('请先上传图片');
        return;
    }
    
    document.getElementById('uploadZone')?.classList.add('hidden');
    document.getElementById('canvasEditor')?.classList.remove('hidden');
    
    const img = croppedImage || currentImage;
    const aspectRatio = img.height / img.width;
    gridHeight = Math.round(gridWidth * aspectRatio);
    
    // 统计信息
    document.getElementById('statSize').textContent = `${gridWidth}×${gridHeight}`;
    document.getElementById('resolutionTag') && (document.getElementById('resolutionTag').textContent = `${gridWidth}×${gridHeight}`);
    
    // 尺寸计算
    const numberWidth = showNumbers ? 20 : 0;
    const numberHeight = showNumbers ? 16 : 0;
    const canvasWidth = gridWidth * BEAD_SIZE + numberWidth;
    const canvasHeight = gridHeight * BEAD_SIZE + numberHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // 创建临时画布处理图片
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = gridWidth;
    tempCanvas.height = gridHeight;
    
    // 应用图像调节
    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    tempCtx.drawImage(img, 0, 0, gridWidth, gridHeight);
    tempCtx.filter = 'none';
    
    // 图像增强
    if (enhance) {
        const imageData = tempCtx.getImageData(0, 0, gridWidth, gridHeight);
        enhanceImageData(imageData);
        tempCtx.putImageData(imageData, 0, 0);
    }
    
    // 获取像素数据
    const imageData = tempCtx.getImageData(0, 0, gridWidth, gridHeight);
    let pixels = imageData.data;
    
    // 抖动处理
    if (dithering) {
        pixels = floydSteinbergDither(pixels, gridWidth, gridHeight);
    }
    
    // 颜色映射
    const colorMap = {};
    const grid = [];
    
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            const i = (y * gridWidth + x) * 4;
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let a = pixels[i + 3];
            
            // 白色留白
            const isWhite = r > 245 && g > 245 && b > 245;
            if (isWhite && showBlank) {
                grid[y][x] = { color: null, isBlank: true };
                continue;
            }
            
            if (a < 128) {
                grid[y][x] = { color: null, isBlank: true };
                continue;
            }
            
            // 找到最接近的颜色
            const matchedColor = findClosestColor(r, g, b);
            
            if (excludedColors.has(matchedColor.code)) {
                grid[y][x] = { color: null, isBlank: true };
                continue;
            }
            
            grid[y][x] = { color: matchedColor, isBlank: false };
            
            // 统计
            const key = matchedColor.code;
            if (!colorMap[key]) {
                colorMap[key] = { ...matchedColor, count: 0 };
            }
            colorMap[key].count++;
        }
    }
    
    // 应用颜色限制
    if (colorLimit > 0) {
        const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);
        const allowedColors = new Set(sortedColors.slice(0, colorLimit).map(c => c.code));
        
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (grid[y][x].color && !allowedColors.has(grid[y][x].color.code)) {
                    // 找到下一个允许的颜色
                    const closest = findClosestColorFromSet(
                        grid[y][x].color.r, grid[y][x].color.g, grid[y][x].color.b, allowedColors
                    );
                    if (closest) {
                        grid[y][x].color = closest;
                        colorMap[closest.code].count++;
                    } else {
                        grid[y][x] = { color: null, isBlank: true };
                    }
                }
            }
        }
    }
    
    // 绘制
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    const offsetX = numberWidth;
    const offsetY = numberHeight;
    
    // 绘制拼豆
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = grid[y][x];
            
            if (cell.isBlank) {
                continue;
            }
            
            const px = offsetX + x * BEAD_SIZE;
            const py = offsetY + y * BEAD_SIZE;
            
            drawBead(px, py, cell.color.hex);
            
            // 色号标注
            if (showColorCode && BEAD_SIZE >= 10) {
                ctx.fillStyle = getContrastColor(cell.color.hex);
                ctx.font = `${Math.max(6, BEAD_SIZE * 0.35)}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.color.code.slice(-2), px + BEAD_SIZE / 2, py + BEAD_SIZE / 2);
            }
        }
    }
    
    // 绘制网格
    if (showGrid) {
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = GRID_LINE_WIDTH;
        
        for (let x = 0; x <= gridWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + x * BEAD_SIZE, offsetY);
            ctx.lineTo(offsetX + x * BEAD_SIZE, offsetY + gridHeight * BEAD_SIZE);
            ctx.stroke();
        }
        
        for (let y = 0; y <= gridHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + y * BEAD_SIZE);
            ctx.lineTo(offsetX + gridWidth * BEAD_SIZE, offsetY + y * BEAD_SIZE);
            ctx.stroke();
        }
    }
    
    // 行列编号
    if (showNumbers) {
        ctx.fillStyle = '#666';
        ctx.font = `${NUMBER_FONT_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 列编号
        for (let x = 0; x < gridWidth; x++) {
            if (x % 5 === 0) {
                ctx.fillText((x + 1).toString(), offsetX + x * BEAD_SIZE + BEAD_SIZE / 2, numberHeight / 2);
            }
        }
        
        // 行编号
        ctx.textAlign = 'center';
        for (let y = 0; y < gridHeight; y++) {
            if (y % 5 === 0) {
                ctx.fillText((y + 1).toString(), numberWidth / 2, offsetY + y * BEAD_SIZE + BEAD_SIZE / 2);
            }
        }
    }
    
    // 边框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, gridWidth * BEAD_SIZE, gridHeight * BEAD_SIZE);
    
    // 更新颜色清单
    updateColorList(colorMap);
    
    // 更新统计
    const total = Object.values(colorMap).reduce((sum, c) => sum + c.count, 0);
    const blankCount = gridWidth * gridHeight - total;
    document.getElementById('statBeads').textContent = total;
    document.getElementById('statBlank').textContent = blankCount;
    document.getElementById('statColors').textContent = Object.keys(colorMap).length;
    document.getElementById('totalBeads').textContent = total;
    
    saveHistory();
}

function drawBead(x, y, color) {
    const size = BEAD_SIZE;
    const padding = 0.5;
    const radius = (size - padding * 2) / 2;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 主体
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // 高光
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.25, centerY - radius * 0.25, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    
    // 边框
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

function findClosestColor(r, g, b) {
    const colors = PERLER_COLORS[brand] || PERLER_COLORS.MARD;
    let minDist = Infinity;
    let closest = colors[0];
    
    for (const color of colors) {
        const rgb = hexToRgb(color.hex);
        const dist = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);
        if (dist < minDist) {
            minDist = dist;
            closest = { ...color, r, g, b };
        }
    }
    
    return closest;
}

function findClosestColorFromSet(r, g, b, allowedCodes) {
    const colors = PERLER_COLORS[brand] || PERLER_COLORS.MARD;
    let minDist = Infinity;
    let closest = null;
    
    for (const color of colors) {
        if (!allowedCodes.has(color.code)) continue;
        
        const rgb = hexToRgb(color.hex);
        const dist = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b);
        if (dist < minDist) {
            minDist = dist;
            closest = { ...color, r, g, b };
        }
    }
    
    return closest;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(2 * Math.pow(r1 - r2, 2) + 4 * Math.pow(g1 - g2, 2) + 3 * Math.pow(b1 - b2, 2));
}

function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Floyd-Steinberg 抖动
function floydSteinbergDither(pixels, width, height) {
    const data = new Uint8ClampedArray(pixels);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            const oldR = data[i];
            const oldG = data[i + 1];
            const oldB = data[i + 2];
            
            const matched = findClosestColor(oldR, oldG, oldB);
            const newRgb = hexToRgb(matched.hex);
            
            data[i] = newRgb.r;
            data[i + 1] = newRgb.g;
            data[i + 2] = newRgb.b;
            
            const errR = oldR - newRgb.r;
            const errG = oldG - newRgb.g;
            const errB = oldB - newRgb.b;
            
            // 传播误差
            if (x + 1 < width) {
                const i2 = i + 4;
                data[i2] += errR * 7 / 16;
                data[i2 + 1] += errG * 7 / 16;
                data[i2 + 2] += errB * 7 / 16;
            }
            if (y + 1 < height) {
                if (x > 0) {
                    const i3 = (y + 1) * width * 4 + (x - 1) * 4;
                    data[i3] += errR * 3 / 16;
                    data[i3 + 1] += errG * 3 / 16;
                    data[i3 + 2] += errB * 3 / 16;
                }
                const i4 = (y + 1) * width * 4 + x * 4;
                data[i4] += errR * 5 / 16;
                data[i4 + 1] += errG * 5 / 16;
                data[i4 + 2] += errB * 5 / 16;
                if (x + 1 < width) {
                    const i5 = (y + 1) * width * 4 + (x + 1) * 4;
                    data[i5] += errR * 1 / 16;
                    data[i5 + 1] += errG * 1 / 16;
                    data[i5 + 2] += errB * 1 / 16;
                }
            }
        }
    }
    
    return data;
}

// 图像增强
function enhanceImageData(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // 增加对比度和饱和度
        data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * 1.2) + 128));
        data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * 1.2) + 128));
        data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * 1.2) + 128));
    }
}

function updateColorList(colorMap) {
    const list = document.getElementById('colorList');
    if (!list) return;
    
    const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count);
    
    list.innerHTML = sorted.slice(0, 20).map(c => `
        <div class="color-item-row ${excludedColors.has(c.code) ? 'excluded' : ''}" 
             data-code="${c.code}"
             onclick="toggleExcludeColor('${c.code}')">
            <div class="color-preview" style="background:${c.hex}"></div>
            <div class="color-name">${c.code} ${c.name}</div>
            <div class="color-count">${c.count}颗</div>
        </div>
    `).join('') || '<p class="color-empty">未检测到颜色</p>';
}

function toggleExcludeColor(code) {
    if (excludedColors.has(code)) {
        excludedColors.delete(code);
    } else {
        excludedColors.add(code);
    }
    regenerate();
}

function regenerate() {
    if (currentImage) generatePerlerBeads();
}

// ==========================================
// 绘图工具
// ==========================================
function selectTool(tool) {
    currentTool = tool;
    document.getElementById('brushTool')?.classList.toggle('active', tool === 'brush');
    document.getElementById('eraserTool')?.classList.toggle('active', tool === 'eraser');
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const numberWidth = showNumbers ? 20 : 0;
    const numberHeight = showNumbers ? 16 : 0;
    const offsetX = numberWidth;
    const offsetY = numberHeight;
    
    // 计算网格坐标
    const gridX = Math.floor((x - offsetX) / BEAD_SIZE);
    const gridY = Math.floor((y - offsetY) / BEAD_SIZE);
    
    if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) return;
    
    const px = offsetX + gridX * BEAD_SIZE;
    const py = offsetY + gridY * BEAD_SIZE;
    
    if (currentTool === 'brush') {
        drawBead(px, py, currentColor);
    } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 1, py + 1, BEAD_SIZE - 2, BEAD_SIZE - 2);
    } else if (currentTool === 'picker') {
        // 吸管
        const imageData = ctx.getImageData(px + BEAD_SIZE / 2, py + BEAD_SIZE / 2, 1, 1);
        const [r, g, b] = imageData.data;
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        const matched = findClosestColor(r, g, b);
        selectColor(matched.hex, matched.code, matched.name);
        currentTool = 'brush';
    }
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveHistory();
    }
}

// ==========================================
// 历史记录
// ==========================================
function saveHistory() {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push(canvas.toDataURL());
    if (history.length > 20) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        loadHistory();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadHistory();
    }
}

function loadHistory() {
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };
    img.src = history[historyIndex];
}

// ==========================================
// 缩放
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

// ==========================================
// 全屏
// ==========================================
function toggleFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    const fsCanvas = document.getElementById('fullscreenCanvas');
    
    overlay.classList.toggle('hidden');
    
    if (!overlay.classList.contains('hidden')) {
        fsCanvas.width = canvas.width;
        fsCanvas.height = canvas.height;
        const fsCtx = fsCanvas.getContext('2d');
        fsCtx.drawImage(canvas, 0, 0);
    }
}

// ==========================================
// 下载
// ==========================================
function downloadImage() {
    const link = document.createElement('a');
    link.download = `小猫拼豆_${gridWidth}x${gridHeight}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // 保存到历史记录
    const historyData = localStorage.getItem('perlerHistory') || '[]';
    const historyList = JSON.parse(historyData);
    historyList.unshift({
        url: canvas.toDataURL('image/png'),
        size: `${gridWidth}×${gridHeight}`,
        time: new Date().toLocaleString()
    });
    localStorage.setItem('perlerHistory', JSON.stringify(historyList.slice(0, 20)));
}

function downloadPDF() {
    // 创建简单的PDF（使用canvas转图片+jsPDF）
    const link = document.createElement('a');
    link.download = `小猫拼豆_${gridWidth}x${gridHeight}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    alert('PDF功能开发中，当前下载PNG图片可用作打印。\n\n提示：在浏览器中按 Ctrl+P 可打印当前图纸。');
}

function showHistory() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    
    const historyData = localStorage.getItem('perlerHistory') || '[]';
    const historyList = JSON.parse(historyData);
    
    if (historyList.length === 0) {
        list.innerHTML = '<p class="history-empty">暂无历史记录</p>';
    } else {
        list.innerHTML = historyList.map((item, i) => `
            <div class="history-item" onclick="loadHistoryItem(${i})">
                <img src="${item.url}" alt="历史${i + 1}">
                <div class="history-info">
                    <span>${item.size}</span>
                    <span>${item.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.remove('hidden');
}

function loadHistoryItem(index) {
    const historyData = JSON.parse(localStorage.getItem('perlerHistory') || '[]');
    const item = historyData[index];
    if (!item) return;
    
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        document.getElementById('uploadZone')?.classList.add('hidden');
        document.getElementById('canvasEditor')?.classList.remove('hidden');
        document.getElementById('historyModal').classList.add('hidden');
    };
    img.src = item.url;
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
// 卡密验证
// ==========================================
async function verifyLicense() {
    const phone = document.getElementById('phone')?.value.trim();
    const license = document.getElementById('license')?.value.trim();
    const messageDiv = document.getElementById('message');
    const verifyBtn = document.getElementById('verifyBtn');
    
    if (!/^1\d{10}$/.test(phone)) {
        if (messageDiv) { messageDiv.className = 'message error'; messageDiv.textContent = '请输入正确的11位手机号'; }
        return;
    }
    if (license.length !== 10) {
        if (messageDiv) { messageDiv.className = 'message error'; messageDiv.textContent = '卡密必须为10位'; }
        return;
    }
    
    if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = '验证中...'; }
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, license })
        });
        const data = await response.json();
        
        if (data.success) {
            if (messageDiv) { messageDiv.className = 'message success'; messageDiv.textContent = '验证成功！'; }
            localStorage.setItem('lastVerify', new Date().toISOString());
            setTimeout(closeLicenseModal, 1000);
        } else {
            if (messageDiv) { messageDiv.className = 'message error'; messageDiv.textContent = data.message || '验证失败'; }
        }
    } catch (error) {
        if (messageDiv) { messageDiv.className = 'message error'; messageDiv.textContent = '网络错误'; }
    } finally {
        if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = '验证卡密'; }
    }
}

function closeLicenseModal() {
    document.getElementById('licenseModal')?.classList.add('hidden');
}

function checkVerification() {
    const lastVerify = localStorage.getItem('lastVerify');
    if (lastVerify) {
        const verifyTime = new Date(lastVerify).getTime();
        const now = Date.now();
        if (now - verifyTime < 24 * 60 * 60 * 1000) {
            isVerified = true;
            return;
        }
    }
    isVerified = true; // 调试模式
}

// 暴露给全局
window.toggleExcludeColor = toggleExcludeColor;
window.selectColor = selectColor;
window.setBrand = setBrand;
window.loadHistoryItem = loadHistoryItem;

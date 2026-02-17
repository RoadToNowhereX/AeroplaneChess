/**
 * 棋盘格子点击弹窗文本配置
 * 
 * 键为格子ID（对应 Coord.js 中的 id），值为点击该格子时弹窗显示的文本。
 * 未配置的格子将默认显示 "empty"。
 * 
 * 主路径格子 ID: 1-52（顺时针环形路径）
 * 红色跑道 ID: 61-66（66为终点）
 * 蓝色跑道 ID: 71-76（76为终点）
 * 黄色跑道 ID: 81-86（86为终点）
 * 绿色跑道 ID: 91-96（96为终点）
 * 待起飞点 ID: 100=红色, 101=蓝色, 102=黄色, 103=绿色
 * 
 * 注意：四个角落的机库区域没有路径ID，不可点击，无需配置。
 */
var cellInfoData = {
    // ===== 主路径（顺时针 1-52）=====
    1: 'empty',
    2: 'empty',
    3: 'empty',
    4: 'empty',
    5: 'empty',
    6: 'empty',
    7: 'empty',
    8: 'empty',
    9: 'empty',
    10: 'empty',
    11: 'empty',
    12: 'empty',
    13: 'empty',
    14: 'empty',
    15: 'empty',
    16: 'empty',
    17: 'empty',
    18: 'empty',
    19: 'empty',
    20: 'empty',
    21: 'empty',
    22: 'empty',
    23: 'empty',
    24: 'empty',
    25: 'empty',
    26: 'empty',
    27: 'empty',
    28: 'empty',
    29: 'empty',
    30: 'empty',
    31: 'empty',
    32: 'empty',
    33: 'empty',
    34: 'empty',
    35: 'empty',
    36: 'empty',
    37: 'empty',
    38: 'empty',
    39: 'empty',
    40: 'empty',
    41: 'empty',
    42: 'empty',
    43: 'empty',
    44: 'empty',
    45: 'empty',
    46: 'empty',
    47: 'empty',
    48: 'empty',
    49: 'empty',
    50: 'empty',
    51: 'empty',
    52: 'empty',

    // ===== 红色跑道（61-66）=====
    61: 'empty',
    62: 'empty',
    63: 'empty',
    64: 'empty',
    65: 'empty',
    66: 'empty',

    // ===== 蓝色跑道（71-76）=====
    71: 'empty',
    72: 'empty',
    73: 'empty',
    74: 'empty',
    75: 'empty',
    76: 'empty',

    // ===== 黄色跑道（81-86）=====
    81: 'empty',
    82: 'empty',
    83: 'empty',
    84: 'empty',
    85: 'empty',
    86: 'empty',

    // ===== 绿色跑道（91-96）=====
    91: 'empty',
    92: 'empty',
    93: 'empty',
    94: 'empty',
    95: 'empty',
    96: 'empty',

    // ===== 待起飞点 =====
    100: 'empty',  // 红色待起飞点
    101: 'empty',  // 蓝色待起飞点
    102: 'empty',  // 黄色待起飞点
    103: 'empty'   // 绿色待起飞点
};

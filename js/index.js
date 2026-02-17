var DICE;   //骰子
var diceNum = 1;    //骰子所得数
var sixTime = 0;    //连投6的次数
var nextStep = false;   //是否可以执行下一步

/**
 * 新建飞机
 * @param type   red/blue/yellow/green
 */
function createPlane(type) {
    if (type && type.length > 0) {
        for (var i = 0; i < type.length; i++) {
            if (type[i].state != 'close') {
                switch (type[i].color) {
                    case 'red':
                        addPlaneDiv(type[i].color, 73, 770);
                        break;
                    case 'blue':
                        addPlaneDiv(type[i].color, 771, 770);
                        break;
                    case 'yellow':
                        addPlaneDiv(type[i].color, 771, 71);
                        break;
                    case 'green':
                        addPlaneDiv(type[i].color, 73, 71);
                        break;
                }
            }
        }
    }
}

/**
 * 添加飞机div
 * @param type
 * @param top
 * @param left
 */
function addPlaneDiv(type, top, left) {
    var count = planeOption.pieceCount || 4;
    for (var i = 0; i < count; i++) {
        var plane = document.createElement('div');
        plane.className = 'plane';
        //plane.innerHTML = i + 1;
        switch (i) {
            case 1:
                left += 95;
                break;
            case 2:
                top += 92;
                left -= 95;
                break;
            case 3:
                left += 95;
                break;
        }
        var colorMap = { 'yellow': '#FFA500', 'red': 'red', 'blue': 'blue', 'green': 'green' };
        var heartColor = colorMap[type] || type;
        $j(plane).attr({ 'type': type, 'num': i + 1, 'state': 'unready' }).css({
            'top': top + 'px',
            'left': left + 'px',
            'color': heartColor,
            'box-shadow': '0 0 4px rgba(0,0,0,0.4)',
            'border': '2px solid #ddd'
        });
        $j('.main').append(plane);
    }
}

/**
 * 骰子投后事件
 * @param $el
 * @param active
 */
function onComplete($el, active) {
    $j("#dice").removeClass('dice-rolling');
    diceNum = active.index + 1;
    if (rule.countSixTime()) {
        return;
    }
    $j("#sdn" + planeOption.currentUser).text(diceNum);
    addPlaneEvent(userState(planeOption.currentUser));
}

/**
 * 投骰子后给当前用户飞机添加事件
 * @param state 当前用户状态
 */
function addPlaneEvent(state) {
    var flag = false;
    var canTakeoff = planeOption.takeoffNums.indexOf(diceNum) !== -1;
    $j('.plane').each(function () {
        var currentUserPlane = ($j(this).attr('type') == planeOption.currentUser ? $j(this) : undefined);
        if (currentUserPlane) {
            if (canTakeoff) {

                if ($j(this).attr('state') != 'win') {
                    currentUserPlane.click(function () {
                        movePlane(this);
                    }).addClass('pointer plane-glow');
                    flag = true;
                }
            } else {
                if ($j(this).attr('state') == 'ready' || $j(this).attr('state') == 'running') {
                    currentUserPlane.click(function () {
                        movePlane(this);
                    }).addClass('pointer plane-glow');
                    flag = true;
                }
            }
        }
    });
    if (!flag) {
        setTimeout(nextUser(), 1000);
    }
}

/**
 * 点击飞机移动事件
 * @param obj
 */
function movePlane(obj) {
    var coordId = 0, step = 0;
    $j(obj).unbind('click').removeClass('pointer plane-glow');
    $j(obj).siblings('[type=' + planeOption.currentUser + ']').unbind('click').removeClass('pointer plane-glow');
    if ($j(obj).attr('state') == 'unready') {
        var unTop, unLeft;
        switch (planeOption.currentUser) {
            case 'red':
                unTop = '45px';
                unLeft = '678px';
                break;
            case 'blue':
                unTop = '678px';
                unLeft = '896px';
                coordId = 13;
                break;
            case 'yellow':
                unTop = '892px';
                unLeft = '258px';
                coordId = 26;
                break;
            case 'green':
                unTop = '259px';
                unLeft = '45px';
                coordId = 39;
                break;
        }

        $j(obj).animate({ top: unTop, left: unLeft }, 1500, function () {
            $j(obj).attr({ 'state': 'ready', 'coordId': coordId, 'step': step }).unbind('click').removeClass('pointer plane-glow');
            if (diceNum != 6) {
                nextUser();
            } else {    //6可连续投骰
                addDiceEvent();
                nextStep = true;
            }
        });
    } else {
        $j(obj).attr({ 'state': 'running' });
        var yuanCoord = $j(obj).attr('coordId') ? parseInt($j(obj).attr('coordId')) : 0;
        var yuanStep = $j(obj).attr('step') ? parseInt($j(obj).attr('step')) : 0;
        step = yuanStep + diceNum;
        var coordValue, currentStep = 0, i = 1, stopFlag = false, superTime = 0, backStepFlag = false, superFlag = false, currentUser = planeOption.currentUser;
        var flyAttackFlag = true;
        moveCoord();

        function moveCoord() {
            if (i > diceNum) {  //当走完最后一步时执行的
                if (coordValue.state != null && coordValue.state == 'win') {
                    rule.planeBack('win', $j(this).attr('type'), $j(this));
                    if (rule.victory()) {

                        alert(planeOption.currentUser + '用户胜利!');
                        return;
                    }

                }
                stopFlag = rule.attactPlane(coordValue, obj, superFlag);
                if (coordValue.coordColor == $j(obj).attr('type') && coordValue.superCoord != null && !stopFlag) {
                    superTime++;
                    coordValue = selectCoordValue(coordValue.superCoord);
                    coordId = parseInt(coordValue.id);
                    step += 12;
                    superFlag = true;

                    $j(obj).animate({ 'top': coordValue.top, 'left': coordValue.left }, 600);
                    if (superTime == 1) {
                        moveCoord();
                        flyAttackFlag = false;
                    } else {    //飞越后检测是否有攻击的飞机
                        rule.attactPlane(coordValue, obj, superFlag);
                        flyAttackFlag = true;
                    }
                } else if (coordValue.coordColor == $j(obj).attr('type') && !stopFlag && coordValue.r == null) {
                    superTime++;
                    coordId += 4;
                    if (coordId > 52) {
                        coordId -= 52;
                    }
                    coordValue = selectCoordValue(coordId);
                    coordId = parseInt(coordValue.id);
                    step += 4;

                    $j(obj).animate({ 'top': coordValue.top, 'left': coordValue.left }, 600);
                    if (coordValue.superCoord != null) {
                        moveCoord();
                        flyAttackFlag = false;
                    } else {    //飞越后检测是否有攻击的飞机
                        rule.attactPlane(coordValue, obj, superFlag);
                        flyAttackFlag = true;
                    }
                }
                if (flyAttackFlag) {
                    $j(obj).attr({ 'coordId': coordValue.id, 'step': step }).unbind('click').removeClass('pointer plane-glow');
                    if (diceNum != 6) {
                        nextUser();
                    } else {    //6可连续投骰
                        addDiceEvent();
                        nextStep = true;
                    }
                }
                return;
            }

            if (backStepFlag) {
                coordId--;
            } else {
                coordId = yuanCoord + i;
            }
            currentStep = yuanStep + i;
            if (coordId > 52 && currentStep < 50) {
                coordId -= 52;
            }
            if (currentStep > 50 && !backStepFlag) {
                switch (currentUser) {
                    case 'red':
                        if (yuanCoord < 61) {
                            coordId = yuanCoord + i + 10;
                        }
                        if (coordId > 66) {
                            backStepFlag = true;
                            coordId = 65;
                        }
                        break;
                    case 'blue':
                        if (yuanCoord < 71) {
                            coordId = yuanCoord + i + 59;
                        }
                        if (coordId > 76) {
                            backStepFlag = true;
                            coordId = 75;
                        }
                        break;
                    case 'yellow':
                        if (yuanCoord < 81) {
                            coordId = yuanCoord + i + 56;
                        }
                        if (coordId > 86) {
                            backStepFlag = true;
                            coordId = 85;
                        }
                        break;
                    case 'green':
                        if (yuanCoord < 91) {
                            coordId = yuanCoord + i + 53;
                        }
                        if (coordId > 96) {
                            backStepFlag = true;
                            coordId = 95;
                        }
                        break;
                }
            }
            coordValue = selectCoordValue(coordId);
            i++;
            $j(obj).animate({ 'top': coordValue.top, 'left': coordValue.left }, 300, moveCoord);
        }
    }
}

/**
 * 根据coordId查询坐标数据
 * @param coordId
 * @returns {{id: *, top: number, left: number, coordColor: string, superCoord: null, r: null}}
 */
function selectCoordValue(coordId) {
    var coord = {
        id: coordId,
        top: 0,
        left: 0,
        coordColor: '',
        superCoord: null,
        r: null,
        state: null
    };
    if (!coordId) {
        return null;
    }
    for (var j = 0; j < COORD.length; j++) {
        if (COORD[j].id == coordId) {
            coord.top = COORD[j].top + 'px';
            coord.left = COORD[j].left + 'px';
            coord.coordColor = COORD[j].color;
            coord.superCoord = COORD[j].super;
            coord.r = COORD[j].r;
            coord.state = COORD[j].state;
        }
    }
    return coord;
}

/**
 * 返回用户状态
 * @param color
 * @returns {*}
 */
function userState(color) {
    var state;
    for (var i = 0; i < planeOption.userList.length; i++) {
        if (color == planeOption.userList[i].color) {
            state = planeOption.userList[i].state;
        }
    }
    return state;
}

/**
 * 下一位用户
 */
function nextUser() {
    nextStep = false;
    $j("#sdn" + planeOption.currentUser).text('等待');
    switch (planeOption.currentUser) {
        case 'red':
            planeOption.currentUser = 'blue';
            break;
        case 'blue':
            planeOption.currentUser = 'yellow';
            break;
        case 'yellow':
            planeOption.currentUser = 'green';
            break;
        case 'green':
            planeOption.currentUser = 'red';
            break;
    }
    sixTime = 0;
    var state = userState(planeOption.currentUser);
    if (state == 'win' || state == 'close') {
        nextUser();
        return;
    }
    $j("#sdn" + planeOption.currentUser).text('请投骰');
    addDiceEvent();
}

/**
 * 添加投骰子事件
 */
function addDiceEvent() {
    $j("#dice").unbind('click').click(function () {
        $j("#dice").unbind('click').removeClass('pointer').addClass('dice-rolling');
        DICE.shuffle(1, onComplete);

    }).addClass('pointer');
}

$j(function () {
    //提示浏览器关闭事件
    window.onbeforeunload = function (event) {
        var n = event.screenX - window.screenLeft;
        var b = n > document.documentElement.scrollWidth - 20;
        if (b && event.clientY < 0 || event.altKey) {
            return "确定关闭吗";
            //event.returnValue = ""; //这里可以放置你想做的操作代码
        }
    };
    //控制F5刷新键
    window.onkeydown = function (e) {
        if (e.which) {
            if (e.which == 116) {
                if (confirm('确定刷新页面吗？刷新后页面数据将被清除！')) {
                    return true;
                } else {
                    return false;
                }
            }
        } else if (event.keyCode) {
            if (event.keyCode == 116) {
                if (confirm('确定刷新页面吗？刷新后页面数据将被清除！')) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    };
    DICE = $j("#dice").slotMachine({
        active: 0,
        delay: 500
    });
    addDiceEvent();
    $j('#begin').click(function () {
        planeOption.begin();
    });
    planeOption.tabStyle('#redUser li');
    planeOption.tabStyle('#blueUser li');
    planeOption.tabStyle('#yellowUser li');
    planeOption.tabStyle('#greenUser li');

    // Draw the board using CSS
    drawBoard();
});

/**
 * Get color code for the board
 */
function getBoardColor(colorName) {
    switch (colorName) {
        case 'red': return '#FF5252';
        case 'blue': return '#448AFF';
        case 'yellow': return '#FFD740';
        case 'green': return '#69F0AE';
        default: return '#e0e0e0';
    }
}

/**
 * Runway ID ranges and their corresponding player color
 */
var runwayMap = {
    'red': { start: 61, end: 66 },
    'blue': { start: 71, end: 76 },
    'yellow': { start: 81, end: 86 },
    'green': { start: 91, end: 96 }
};

/**
 * Turn-in point arrow directions (cells with r:'yes')
 * Arrow points toward the runway entrance
 */
var turnArrowMap = {
    50: 'down',   // Red: arrow pointing down into runway
    11: 'left',   // Blue: arrow pointing left into runway
    24: 'up',     // Yellow: arrow pointing up into runway
    37: 'right'   // Green: arrow pointing right into runway
};

/**
 * Super jump arrow directions (cells with 'super' property and their targets)
 * Arrow points in the direction of the super jump
 */
var superJumpArrowMap = {
    5: 'down',    // Green super jump start
    17: 'down',   // Green super jump end
    18: 'left',   // Red super jump start
    30: 'left',   // Red super jump end
    31: 'up',     // Blue super jump start
    43: 'up',     // Blue super jump end
    44: 'right',  // Yellow super jump start
    4: 'right'    // Yellow super jump end
};

/**
 * Get runway color for a given coord ID, or null if not a runway cell
 */
function getRunwayColor(id) {
    for (var color in runwayMap) {
        if (id >= runwayMap[color].start && id <= runwayMap[color].end) {
            return color;
        }
    }
    return null;
}

/**
 * Check if a coord ID is a win (terminal) cell
 */
function isWinCell(id) {
    return id === 66 || id === 76 || id === 86 || id === 96;
}

/**
 * Draw the board cells based on coordinates
 */
function drawBoard() {
    // Draw main path and victory paths
    if (typeof COORD !== 'undefined') {
        for (var i = 0; i < COORD.length; i++) {
            var c = COORD[i];
            var runwayColor = getRunwayColor(c.id);
            var cellColor;
            var extraClass = '';
            var innerHTML = '';

            if (runwayColor) {
                // Runway cell: use the player's color
                cellColor = getBoardColor(runwayColor);
                if (isWinCell(c.id)) {
                    // Terminal cell: add white flag
                    extraClass = 'board-cell-flag';
                }
            } else {
                cellColor = getBoardColor(c.color);
            }

            // Check if this is a turn-in point (r:'yes') or super jump point
            var arrowDir = turnArrowMap[c.id] || superJumpArrowMap[c.id];
            if (arrowDir) {
                extraClass = 'board-cell-arrow board-cell-arrow-' + arrowDir;
            }

            createBoardCell(c.top, c.left, cellColor, c.id, extraClass);
        }
    }

    // Draw hangars
    var hangars = [
        { coords: initRedCoord, color: 'red' },
        { coords: initBlueCoord, color: 'blue' },
        { coords: initYellowCoord, color: 'yellow' },
        { coords: initGreenCoord, color: 'green' }
    ];

    for (var h = 0; h < hangars.length; h++) {
        var group = hangars[h];
        if (group.coords) {
            for (var j = 0; j < group.coords.length; j++) {
                var c = group.coords[j];
                createBoardCell(c.top, c.left, getBoardColor(group.color));
            }
        }
    }

    // Draw super jump dashed lines
    drawSuperJumpLines();
}

/**
 * Draw dashed lines for super jump paths
 */
function drawSuperJumpLines() {
    var superJumps = [
        { startId: 5, endId: 17, color: 'green', direction: 'vertical' },
        { startId: 18, endId: 30, color: 'red', direction: 'horizontal' },
        { startId: 31, endId: 43, color: 'blue', direction: 'vertical' },
        { startId: 44, endId: 4, color: 'yellow', direction: 'horizontal' }
    ];

    var lightColors = {
        'red': 'rgba(255, 82, 82, 0.45)',
        'blue': 'rgba(68, 138, 255, 0.45)',
        'yellow': 'rgba(255, 195, 0, 0.45)',
        'green': 'rgba(76, 175, 80, 0.45)'
    };

    for (var i = 0; i < superJumps.length; i++) {
        var sj = superJumps[i];
        var startCoord = null, endCoord = null;

        for (var j = 0; j < COORD.length; j++) {
            if (COORD[j].id === sj.startId) startCoord = COORD[j];
            if (COORD[j].id === sj.endId) endCoord = COORD[j];
        }

        if (!startCoord || !endCoord) continue;

        // Center of each cell: COORD value + 25 (center of 50px slot)
        var startCY = parseInt(startCoord.top) + 25;
        var startCX = parseInt(startCoord.left) + 25;
        var endCY = parseInt(endCoord.top) + 25;
        var endCX = parseInt(endCoord.left) + 25;

        var line = document.createElement('div');
        line.className = 'super-jump-line';

        if (sj.direction === 'vertical') {
            var minTop = Math.min(startCY, endCY);
            var height = Math.abs(endCY - startCY);
            var avgLeft = Math.round((startCX + endCX) / 2);
            $j(line).css({
                'top': minTop + 'px',
                'left': avgLeft + 'px',
                'height': height + 'px',
                'width': '0px',
                'border-left': '4px dashed ' + lightColors[sj.color]
            });
        } else {
            var minLeft = Math.min(startCX, endCX);
            var width = Math.abs(endCX - startCX);
            var avgTop = Math.round((startCY + endCY) / 2);
            $j(line).css({
                'top': avgTop + 'px',
                'left': minLeft + 'px',
                'width': width + 'px',
                'height': '0px',
                'border-top': '4px dashed ' + lightColors[sj.color]
            });
        }

        $j('.main').prepend(line);
    }
}

function createBoardCell(top, left, color, id, extraClass) {
    var cell = document.createElement('div');
    cell.className = 'board-cell' + (extraClass ? ' ' + extraClass : '');
    // Center the 40px cell relative to the 50px anticipated slot
    var topPos = parseInt(top) + 5;
    var leftPos = parseInt(left) + 5;

    $j(cell).css({
        'top': topPos + 'px',
        'left': leftPos + 'px',
        'background-color': color
    });

    // Add click event for cells on the path (those with an id)
    if (id !== undefined) {
        $j(cell).addClass('board-cell-clickable').attr('data-cell-id', id);
        $j(cell).on('click', function (e) {
            e.stopPropagation();
            openCellModal(id);
        });
    }

    $j('.main').prepend(cell);
}

/**
 * Cell info data store - maps cell id to text content
 * Default is "empty" for all cells
 */
var cellInfoData = {};

/**
 * Open the cell info modal
 * @param cellId - the COORD id of the clicked cell
 */
function openCellModal(cellId) {
    var text = cellInfoData[cellId] || 'empty';
    $j('#cellModalContent').text(text);
    $j('#cellModal').addClass('active');
}

/**
 * Close the cell info modal
 */
function closeCellModal() {
    $j('#cellModal').removeClass('active');
}

// Modal event bindings (after DOM ready)
$j(function () {
    // Close modal via ❌ button
    $j('#cellModalClose').on('click', function (e) {
        e.stopPropagation();
        closeCellModal();
    });

    // Close modal by clicking overlay (outside the dialog)
    $j('#cellModal').on('click', function (e) {
        if (e.target === this) {
            closeCellModal();
        }
    });
});
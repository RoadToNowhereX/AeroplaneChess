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
    for (var i = 0; i < 4; i++) {
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
 * Draw the board cells based on coordinates
 */
function drawBoard() {
    // Draw main path and victory paths
    if (typeof COORD !== 'undefined') {
        for (var i = 0; i < COORD.length; i++) {
            var c = COORD[i];
            var color = getBoardColor(c.color);
            createBoardCell(c.top, c.left, color, c.id);
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
}

function createBoardCell(top, left, color, text) {
    var cell = document.createElement('div');
    cell.className = 'board-cell';
    // Center the 40px cell relative to the 50px anticipated slot (top/left are likely top-left of the slot)
    // Adding 5px offset to center it
    var topPos = parseInt(top) + 5;
    var leftPos = parseInt(left) + 5;

    $j(cell).css({
        'top': topPos + 'px',
        'left': leftPos + 'px',
        'background-color': color
    });

    // Optional: Add ID text for debugging or visual
    // if(text) cell.innerHTML = text; 

    $j('.main').prepend(cell); // Prepend so it's behind planes (though z-index handles it mostly)
}
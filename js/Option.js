/**
 * Created by Andrew on 2015/5/14.
 */
/**
 * 设置
 * @constructor
 */
var PlaneOption = function () {
    /**
     *
     * @param color /red/blue/yellow/green
     * @param state /normal/close/win
     * @constructor
     */
    var PLANEUSER = function (color, state) {
        this.color = color;
        this.state = state;
    };
    this.userList = [new PLANEUSER('red', 'normal'), new PLANEUSER('blue', 'close'), new PLANEUSER('yellow', 'close'), new PLANEUSER('green', 'close')];
    this.currentUser = 'red';  //当前用户
    this.takeoffNums = [6];  //起飞点数，默认为6
    /**
     * 设置起飞点数
     */
    this.setTakeoffNums = function () {
        var nums = [];
        $j('#qifei input[type="checkbox"]:checked').each(function () {
            nums.push(parseInt($j(this).val()));
        });
        if (nums.length === 0) {
            alert('请至少选择一个起飞点数！');
            return false;
        }
        this.takeoffNums = nums;
        return true;
    };
    /**
     * 设置默认首个启动用户
     */
    function setFirstUser() {
        for (var i = 0; i < this.userList.length; i++) {
            if (this.userList.state == 'normal') {
                this.currentUser = this.userList.color;
                return;
            }
        }
    }

    function setUser(obj, user) {
        $j(obj).each(function () {
            if ($j(this).hasClass('bth')) {
                switch ($j(this).text()) {
                    case '玩家':
                        user.state = 'normal';
                        break;

                    case '无':
                        user.state = 'close';
                        break;
                }
            }
        });
    }

    this.setUserList = function () {
        setUser('#redUser li', this.userList[0]);
        setUser('#blueUser li', this.userList[1]);
        setUser('#yellowUser li', this.userList[2]);
        setUser('#greenUser li', this.userList[3]);
    };

    /**
     * 开始
     */
    this.begin = function () {
        if (!this.setTakeoffNums()) {
            return;  // 如果没有选择起飞点数，不开始游戏
        }
        this.setUserList();
        createPlane(planeOption.userList);
        $j("#sdn" + planeOption.currentUser).text('请投骰');
        $j('.option').hide();
    };

    this.tabStyle = function (obj) {
        $j(obj).each(function () {
            $j(this).click(function () {
                $j(this).addClass('bth');
                $j(this).siblings().removeClass('bth');
            });
        });
    };
};
var planeOption = new PlaneOption();
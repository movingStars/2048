/**
 * Created by ASUS on 2016/9/6.
 */
function setCookie(cookieName,value,date){
    document.cookie = cookieName+"="+value+";expires="+date.toGMTString();
}
function getCookie(cookieName){
    //将document.cookie保存在变量cookie中
    var cookie = document.cookie;
    //在cookie中查找cookieName的位置，保存在i中
    var i = cookie.indexOf(cookieName);
    //如果i==-1,
    if(i == -1){
        //返回null;
        return null;
    }else{//否则
        //i+cookieName的长度+1,保存在变量starti中
        var starti = i+cookieName.length+1;
        //从starti开始查找下一个;的位置endi
        var endi = cookie.indexOf(";",starti);
        //如果endi为-1
        if(endi == -1){
            //截取cookie中starti到结尾的剩余内容，返回
            return cookie.slice(starti);
        }else{//否则
            //截取cookie中starti到endi的内容，返回
            return cookie.slice(starti,endi);
        }
    }
}
var game = {
    RN:4,//总行数
    CN:4,//总列数
    data:null,//保存游戏格子数据的二维数组
    score:0,//保存游戏得分
    state:1,//保存游戏状态
    GAMEOVER:0,//表示游戏结束状态
    RUNNING:1,//表示游戏运行中
    //给状态起名，以便日后维护

    top:0,//保存游戏最高分
    /*
     * 强调：1.方法中只要使用对象的属性都要加this
     *       2.每个属性和方法之间必须使用，分割*/
    start:function(){
        //游戏启动

        //获得cookie中的top变量值，保存在top属性中(如果top变量的值无效，就用0代替)
        this.top = getCookie("top")||0;
        this.state = this.RUNNING;//重置游戏状态为RUNNING
        this.score=0;//重置分数为0
        //创建空数组，保存在data属性中
        this.data = [];
        //r从0开始到<RN结束
        for(var r=0; r<this.RN; r++) {
            //创建一个空数组保存在data中r行
            this.data[r] = [];
            //c从0开始，到<CN结束
            for (var c = 0; c < this.CN; this.data[r][c] = 0, c++);
            //设置data中r行c列的值为0
        }
        //在二维数组中生成两个随机整数
        this.randomNum();
        this.randomNum();
        //更新页面
        this.updateView();
        //为页面绑定键盘按下事件
        document.onkeydown = function(e){//典型的回调
            //事件处理中，this默认指事件绑定到的对象，即document
            switch(e.keyCode){
                case 37:this.moveLeft();break;
                case 38:this.moveUp();break;
                case 39:this.moveRight();break;
                case 40:this.moveDown();break;
            }
        }.bind(this);//start方法的this
    },

    isGameOver:function() {
        for(var r=0; r<this.RN; r++){
            for(var c=0; c<this.CN; c++){
                if(this.data[r][c]==0){
                    return false;
                }
                if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){
                    return false;
                }
                if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){
                    return false;
                }
            }
        }
        return true;
    },

    move:function(callback){
        //将data转为String，保存在before中
        var before = String(this.data);
        callback();
        //将data转为String，保存在after中
        var after = String(this.data);
        //如果before不等于after
        if(before!=after) {
            //随机生成一个数
            this.randomNum();
            //如果游戏结束，
            if(this.isGameOver()){
                //修改游戏状态为GAMEOVER
                this.state = this.GAMEOVER;
                //如果score>top
                if(this.score>this.top) {
                    //获得当前时间now
                    var now = new Date();
                    //将now+1年
                    now.setFullYear(now.getFullYear()+1);
                    //才将score写入cookie中的top变量，设置过期日期为now
                    setCookie("top",this.score,now);
                }
            }
            //更新页面
            this.updateView();
        }
    },

    //下移所有列
    moveDown:function(){
        this.move(function(){
            for(var c=0; c<this.CN; c++){
                this.moveDownInCol(c);
            }
        }.bind(/*moveDown中的*/this));
    },
    //下移一列
    moveDownInCol:function(c){
        for(var r=this.RN-1; r>0; r--){
            var prevr = this.getPrevInCol(r,c);
            if(prevr==-1){
                break;
            }else{
                if(this.data[r][c]==0){
                    this.data[r][c] = this.data[prevr][c];
                    this.data[prevr][c] = 0;
                    r++;
                }else if(this.data[r][c] == this.data[prevr][c]){
                    this.data[r][c] *= 2;
                    //将r行c列的新值累加到score属性上
                    this.score+=this.data[r][c];
                    this.data[prevr][c] = 0;
                }
            }
        }
    },
    //获得r行c列上侧下一个不为0的位置
    getPrevInCol:function(r,c){
        for(r--; r>=0; r--){
            if(this.data[r][c]!=0){
                return r;
            }
        }
        return -1;
    },

    //上移所有列
    moveUp:function(){
        this.move(function(){
            for(var c=0; c<this.RN; c++){
                this.moveUpInCol(c);
            }
        }.bind(this));
    },
    //上移一列
    moveUpInCol:function(c){
        for(var r=0; r<this.RN-1; r++){
            var nextr = this.getNextInCol(r,c);
            if(nextr==-1){
                break;
            }else{
                if(this.data[r][c]==0){
                    this.data[r][c] = this.data[nextr][c];
                    this.data[nextr][c] = 0;
                    r--;
                }else if(this.data[r][c] == this.data[nextr][c]){
                    this.data[r][c] *= 2;
                    //将r行c列的新值累加到score属性上
                    this.score+=this.data[r][c];
                    this.data[nextr][c] = 0;
                }
            }
        }
    },
    //获得r行c列下侧下一个不为0的位置
    getNextInCol:function(r,c){
        for(r++; r<this.RN; r++){
            if(this.data[r][c]!=0){
                return r;
            }
        }
        return -1;
    },

    //右移所有行
    moveRight:function(){
        this.move(function(){
            for(var r=0; r<this.RN; r++){
                this.moveRightInRow(r);
            }
        }.bind(this));
    },
    //右移一行
    moveRightInRow:function(r){
        for(var c=this.CN-1; c>0; c--){
            var prevc = this.getPrevInRow(r,c);
            if(prevc == -1){
                break;
            }else{
                if(this.data[r][c]==0){
                    this.data[r][c] = this.data[r][prevc];
                    this.data[r][prevc] = 0;
                    c++;
                }else if(this.data[r][c] == this.data[r][prevc]){
                    this.data[r][c]*=2;
                    //将r行c列的新值累加到score属性上
                    this.score+=this.data[r][c];
                    this.data[r][prevc] = 0;
                }
            }
        }
    },
    //获得r行c列左侧下一个不为0的位置
    getPrevInRow:function(r,c){
        for(c--; c>=0; c--){
            if(this.data[r][c]!=0){
                return c;
            }
        }
        return -1;
    },

    //左移所有行
    moveLeft:function(){
        this.move(function(){
            //遍历data中每一行
            for(var r=0; r<this.RN;r++){
                this.moveLeftInRow(r);//调用moveLeftInRow,传入r
            }
        }.bind(this));
    },
    moveLeftInRow:function(r){
        //c从0开始，到<CN-1结束
        for(var c=0; c<this.CN-1; c++) {
            //调用getNextInRow(),传入参数r,c，将返回值保存在变量nextc中
            var nextc = this.getNextInRow(r, c);
            //如果nextc是-1，退出循环
            if (nextc == -1) {
                break;
            } else {
                if (this.data[r][c] == 0) {//否则如果c位置的值为0
                    //就将c位置的值替换为nextc位置的值
                    this.data[r][c] = this.data[r][nextc];
                    //将nextc位置的值置为0
                    this.data[r][nextc] = 0;
                    //将c留在原地
                    c--;
                }else if (this.data[r][c] == this.data[r][nextc]) {
                    //如果r行c位置的值等于r行nextc位置的值
                    //将r行c位置的值*2
                    this.data[r][c]*=2;
                    //将r行c列的新值累加到score属性上
                    this.score+=this.data[r][c];
                    //将nextc位置的值置为0
                    this.data[r][nextc] = 0;
                }
            }
        }
    },
    //获得r行c列右侧下一个不为0的位置
    getNextInRow:function(r,c){
        //c<CN结束,c++
        for(c++; c<this.CN; c++) {
            //如果r行c位置不是0
            if(this.data[r][c]!=0)
            //返回c
                return c;
        }//遍历结束
        //返回-1
        return -1;
    },


    //在一个随机位置生成一个2或4
    randomNum:function(){
        //反复：
        while(true) {
            //在0~RN-1之间生成一个随机整数r
            r = Math.floor(Math.random() * (this.RN - 1 + 1));
            //在0~CN-1之间生成一个随机整数c
            c = Math.floor(Math.random() * (this.CN - 1 + 1));
            //如果data中r行c列的值是0
            if(this.data[r][c] == 0) {
                //设置data 中r行c列的值为：
                // 随机生成一个0~1的小数，
                // 如果<0.5,就赋值为2，否则赋值为4
                this.data[r][c] = Math.random() < 0.5 ? 2 : 4;
                break;
                //退出循环
            }
        }
    },
    //将数组中每个元素更新到页面的div中
    updateView:function(){
        //遍历data中每个元素
        for(var r=0; r<this.RN; r++) {
            for(var c=0; c<this.CN; c++) {
                //找到页面上id为"c"+r+c的div
                var div = document.getElementById("c"+r+c);
                //如果当前元素不是0，
                if(this.data[r][c]!=0) {
                    //设置div的内容为当前元素值
                    div.innerHTML = this.data[r][c];
                    //设置div的className为“cell n”+当前元素值
                    div.className="cell n"+this.data[r][c];
                }else {//否则
                    //设置div的内容为""
                    div.innerHTML = "";
                    //设置div的className为"cell"
                    div.className = "cell";
                }
            }
        }
        //找到id为score的元素，设置其内容为score属性
        document.getElementById("score").innerHTML = this.score;
        //判断如果游戏状态为结束，
        if(this.state == this.GAMEOVER) {
            //找到id为gameOver的元素，设置其显示
            document.getElementById("gameOver").style.display = "block";
            //找到id为fScore的元素设置其内容为score
            document.getElementById("fScore").innerHTML = this.score;
        }else {//否则
            //找到id为gameOver的元素，设置其隐藏
            document.getElementById("gameOver").style.display = "none";
        }
        //设置id为topScore的内容为top
        document.getElementById("topScore").innerHTML = this.top;
    }
}
game.start();
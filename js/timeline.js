//===============!时间轴(月度)=================
var nowDate = new Date();
var date = null;
var dateStrArr = [];
var dateArr = [];
var axisArr = [];
var ll = 0;
for (var i = 11; i >= ll; i--) {
    if (nowDate.getDate() <= 20) {
        date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth()-i-2);
    } else {
        date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth()-i-1);
    }

    if (date.getMonth() == 0) {
        date.setDate(1);
        ll--;
        continue;
    }
    dateStrArr.push(date.getFullYear() + '/' + (date.getMonth() + 1));
    dateArr.push(date);
    axisArr.push({
        name: date.getFullYear() + '/' + (date.getMonth() + 1),
        arr: [{
            name: date.getFullYear(),
            type: 'time_year',
            extField: date.getFullYear()
        }, {
            name: date.getMonth() + 1,
            type: 'time_month',
            extField: date.getMonth() + 1
        }]
    })
}
//===============!时间轴(季度)=================
var jiduTime = (function () {
    var result = {};
    var sDate = new Date();
    var sQuarter = parseInt((sDate.getMonth() + 1) / 3);
    sDate.setDate(1);
    sDate.setMonth(sQuarter * 3 - 1);

    var date = null;
    var dateArr = []; //时间数组
    var dateStrArr = []; //时间字符数组
    var cAxisArr = []; //普通图表横轴
    for (var i = 7; i >= 0; i--) {
        date = new Date(sDate.getTime());
        date.setDate(1);
        date.setMonth(sDate.getMonth() - (i+1)*3)
        dateArr.push(date);
        dateStrArr.push(date.getFullYear() + '-' + (date.getMonth() + 1));
        cAxisArr.push({
            name: date.getFullYear() + '-' + (date.getMonth() + 1),
            arr: [{
                name: date.getFullYear(),
                type: 'time_year',
                extField: date.getFullYear()
            }, {
                name: date.getMonth() + 1,
                type: 'time_month',
                extField: date.getMonth() + 1
            }]
        })
    };
    result.dateArr = dateArr;
    result.dateStrArr = dateStrArr;
    result.cAxisArr = cAxisArr;
    return result;

})();

function initTimeline(showData) {
    var dom = document.getElementById("HeaderDateline");
    var myChart = echarts.getInstanceByDom(dom);
    if (myChart) {
        myChart.dispose();
    }
    myChart = echarts.init(dom);
    if (showData) {
        myChart.on('timelinechanged', showData);
    }
    var option = {
        baseOption: {
            timeline: {
                axisType: 'category',
                autoPlay: false,
                currentIndex: dateArr.length - 1,
                playInterval: 1000,
                data: dateStrArr,
                rewind: true
            },
            calculable: true,
            grid: {
                top: 80,
                bottom: 100,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                        label: {
                            show: true,
                            formatter: function (params) {
                                return params.value.replace('\n', '');
                            }
                        }
                    }
                }
            }
        }


    };
    myChart.setOption(option);
}

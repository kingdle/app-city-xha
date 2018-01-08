function SyStore(config) {
    this.param = config && config.param ? config.param : {};
    this.success = config && config.success ? config.success : function() {};
    this.autoLoad = config && config.autoLoad ? config.autoLoad : false;
    this.datasetId = config && config.datasetId ? config.datasetId : 3;
    if(this.autoLoad) {
        this.init();
    }

}
SyStore.prototype.init = function() {
    var _this = this;
    $.ajax({
        type: "post",
        jsonp: "callback",
        jsonpCallback: "jsonpCallback",
        url: "http://218.58.53.234:8183/sy-hd/dataset/getDatasetMetasAsType?datasetId=" + _this.datasetId,
        success: function(paramData) {
            _this.getDataByMeta(paramData);

        }
    });

}
SyStore.prototype.getDataByMeta = function(paramData) {
    var _this = this;
    var pd = {};
    _this.meta = paramData;
    for(var item in paramData) {
        if(paramData[item] instanceof Array) {
            $.each(paramData[item], function(i, itemV) {
                if(i == 0) {
                    pd[item + '.code'] = itemV.extField
                } else
                    pd[item + '.code'] += "," + itemV.extField;
            });
        }

    }
    $.ajax({
        type: "post",
        url: "http://218.58.53.234:8183/sy-hd/data",
        data: pd,
        jsonp: "callback",
        jsonpCallback: "jsonpCallback",
        success: function(rawDatas) {
            _this.rawData = rawDatas;
            _this.tmpData = [];
            var tmpData = null;
            var data = null;
            for(var index in rawDatas.list) {
                tmpData = {};
                data = rawDatas.list[index];
                for(var item in data) {
                    tmpData[item] = data[item] != null && typeof(data[item]['code']) != 'undefined' ? data[item]['code'] : data[item];
                }
                _this.tmpData.push(tmpData);
            }
            _this.collection = new SyCollection(_this.tmpData);
            if(_this.success) {
                _this.done = true;
                _this.success(_this);
            };

        }
    });
}
SyStore.prototype.findMetaByItemName = function(item) {
    var _this = this;
    var result = {};
    var pStr = '^\\S*' + item.name + '\\S*$';
    var reg = new RegExp(pStr, 'g');
    if(_this.meta) {
        $.each(_this.meta[item.type], function(j, meta) {

            if(reg.test(meta.name)) {
                result = meta;
                return false;
            }
        })
    }
    return result;
}
SyStore.prototype.findMetaByName = function(name) {
    var _this = this;
    var result = {};
    if(_this.meta) {
        var isFind = false;
        $.each(_this.meta, function(i, item) {
            $.each(item, function(j, meta) {
                if(meta.name == name) {
                    result = meta;
                    isFind = true;
                    return false;
                }
            })
            if(isFind)
                return false;
        });
    }
    return result;
}

function SyCollection(datas) {
    var _this = this;
    if(datas) {
        this._datas = datas;
        $.each(datas, function(index, data) {
            for(var item in data) {
                if(item == 'value' || item == "_id") {
                    continue;
                } else if(item == 'time_year') {
                    if(!_this["time"]) {
                        _this["time"] = {};
                        _this["time"][data.time_year + "-" + data.time_month] = [data];
                    } else {
                        if(_this["time"][data.time_year + "-" + data.time_month]) {
                            _this["time"][data.time_year + "-" + data.time_month].push(data)
                        } else {
                            _this["time"][data.time_year + "-" + data.time_month] = [data]
                        }
                    };
                }

                //				}
                if(!_this[item]) {
                    _this[item] = {};
                    _this[item][data[item]] = [data]
                } else {
                    if(_this[item][data[item]]) {
                        _this[item][data[item]].push(data);
                    } else {
                        _this[item][data[item]] = [data]
                    }
                }
            }
        });
    } else {
        this._datas = [];
    }

}

SyCollection.prototype.filter = function(condition) {
    var tmpResult = this;
    var tmpList = [];
    if(condition) {
        for(var item in condition) {
            if(condition[item] instanceof Array) {
                for(var i in condition[item]) {
                    if(tmpResult[item] && tmpResult[item][condition[item][i]]) {
                        tmpList = tmpList.concat(tmpResult[item][condition[item][i]]);
                    }

                }
                tmpResult = new SyCollection(tmpList);
                tmpList = [];

            } else {
                if(tmpResult[item] && tmpResult[item][condition[item]]) {
                    tmpResult = new SyCollection(tmpResult[item][condition[item]]);

                } else
                    tmpResult = new SyCollection(tmpList);
            }
        }
        return tmpResult;
    } else {
        return this;
    }

}

SyCollection.prototype.find = function(condition) {
    var tmpResult = this;
    var tmpList = [];
    if(condition) {
        for(var item in condition) {
            if(condition[item] instanceof Array) {
                for(var i in condition[item]) {
                    if(tmpResult[item] && tmpResult[item][condition[item][i]]) {
                        tmpList = tmpList.concat(tmpResult[item][condition[item][i]]);
                    }

                }
                tmpResult = new SyCollection(tmpList);
                tmpList = [];

            } else {
                if(tmpResult[item] && tmpResult[item][condition[item]]) {
                    console.log(item)
                    tmpResult = new SyCollection(tmpResult[item][condition[item]]);

                } else
                    tmpResult = new SyCollection(tmpList);
            }
        }
        return tmpResult._datas;
    } else {
        return this._datas;
    }

}
//序列1条件series[2014,2015]     维度条件dim[163,164]    filter   样式array   axis横轴[jimo,qingdao]{name type code extField}
function SyChartSeriesKit(option) {
    this.setOption(option);
    if(this.store) {
        this.collection = this.store.collection;
        if(this.filter) {
            var tmpFilter = {};
            $.each(this.filter, function(index, item) {
                if(tmpFilter[item.type]) {
                    tmpFilter[item.type].push(item.extField);
                } else {
                    tmpFilter[item.type] = [item.extField]
                }
            });
            this.collection = this.collection.filter(tmpFilter);
        }
    }
}
SyChartSeriesKit.prototype._genFilter = function(arr) {
    var tmpFilter = {};
    $.each(arr, function(index, item) {
        if(tmpFilter[item.type]) {
            tmpFilter[item.type].push(item.extField);
        } else {
            tmpFilter[item.type] = [item.extField]
        }
    });
    return tmpFilter;
}
SyChartSeriesKit.prototype.genSeriesData = function(option) {
    var _this = this;
    if(!option)
        option = {};

    var tmpSeries = option.series ? option.series : this.series;
    var tmpAxis = option.axis ? option.axis : this.axis;
    var tmpCollection = this.collection;
    var dim = option.dim ? option.dim : this.dim;
    var dimSize = dim ? dim.length : 0;
    var style = option.style ? option.style : this.style; //arr obj
    if(tmpSeries) {
        var tmpFilter = _this._genFilter(tmpSeries);
        tmpCollection = tmpCollection.filter(tmpFilter);

        if(tmpAxis) {
            var tmpResult = [];
            var tmpItem = null;
            var tmpAxisItem = null;
            var tmpDimItem = null;
            var tmpDimV = null;
            $.each(tmpAxis, function(index, item) {
                tmpFilter = _this._genFilter(item.arr);
                tmpAxisItem = tmpCollection.filter(tmpFilter);
                if(dimSize < 1) {
                    if(style != 'obj')
                        tmpResult.push(tmpAxisItem._datas[0] && tmpAxisItem._datas[0].value != null && typeof(tmpAxisItem._datas[0].value) != 'undefined' ? tmpAxisItem._datas[0].value : '-');
                    else
                        tmpResult.push(tmpAxisItem._datas[0] && tmpAxisItem._datas[0].value != null && typeof(tmpAxisItem._datas[0].value) != 'undefined' ? {
                                name: item.name,
                                value: tmpAxisItem._datas[0].value
                            } : '-');
                } else {
                    tmpDimV = [];
                    $.each(dim, function(jndex, tmpDim) {

                        tmpFilter = _this._genFilter(tmpDim);
                        tmpDimItem = tmpAxisItem.filter(tmpFilter);
                        if(style != 'obj') {
                            if(dimSize > 1)
                                tmpDimV.push(tmpDimItem._datas[0] && tmpDimItem._datas[0].value != null && typeof(tmpDimItem._datas[0].value) != 'undefined' ? tmpDimItem._datas[0].value.trim() : '-');
                            else
                                tmpDimV = tmpDimItem._datas[0] && tmpDimItem._datas[0].value != null && typeof(tmpDimItem._datas[0].value) != 'undefined' ? tmpDimItem._datas[0].value.trim() : '-';
                        } else {
                            if(dimSize > 1)
                                tmpDimV.push(tmpDimItem._datas[0] && tmpDimItem._datas[0].value != null && typeof(tmpDimItem._datas[0].value) != 'undefined' ? {
                                        name: item.name,
                                        value: tmpDimItem._datas[0].value.trim()
                                    } : '-');
                            else
                                tmpDimV = tmpDimItem._datas[0] && tmpDimItem._datas[0].value != null && typeof(tmpDimItem._datas[0].value) != 'undefined' ? {
                                        name: item.name,
                                        value: tmpDimItem._datas[0].value.trim()
                                    } : '-';
                        }
                    });
                    tmpResult.push(tmpDimV);

                }

            });
            return tmpResult;

        }
    }

}

SyChartSeriesKit.prototype.setOption = function(option) {

    if(option) {
        for(var item in option) {
            this[item] = option[item];
        }
    }
}

function SyValueKit(baseFilterV, store) {
    this.baseFilterV = baseFilterV;
    this.store = store;
    this.baseFilter = this.store.collection.filter(this.baseFilterV);
}

SyValueKit.prototype.findValueByItemName = function(filter, isV) {
    var meta = this.store.findMetaByItemName({
        type: 'item',
        name: filter
    });
    this.baseFilter = this.store.collection.filter(this.baseFilterV);
    if(!isV) {
        return this.baseFilter.filter({
            item: meta.extField
        });
    } else {
        var res = this.baseFilter.filter({
            item: meta.extField
        });
        return res._datas[0] ? res._datas[0].value : '-'

    }

}
SyValueKit.prototype.findValueByAreaName = function(filter, isV) {
    var meta = this.store.findMetaByItemName({
        type: 'area',
        name: filter
    });
    this.baseFilter = this.store.collection.filter(this.baseFilterV);
    if(!isV) {
        return this.baseFilter.filter({
            area: meta.extField
        });
    } else {
        var res = this.baseFilter.filter({
            area: meta.extField
        });
        return res._datas[0] ? res._datas[0].value : '-'

    }

}
SyValueKit.prototype.findValueByObj = function(filter, isV) {
    //	var meta = this.store.findMetaByItemName({
    //		type: 'area',
    //		name: filter
    //	});
    this.baseFilter = this.store.collection.filter(this.baseFilterV);
    if(!isV) {
        return this.baseFilter.filter(filter);
    } else {
        var res = this.baseFilter.filter(filter);
        return res._datas[0] ? res._datas[0].value : '-'

    }

}
SyValueKit.prototype.meta = function(type, value) {
    return this.store.findMetaByItemName({
        type: type,
        name: value
    });
}

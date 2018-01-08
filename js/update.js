     var wgtVer = null;
    function plusReady() { // 获取本地应用资源版本号
        plus.runtime.getProperty(plus.runtime.appid, function (inf) {
            wgtVer = inf.version;
        });
    }
    if (window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
 
 var checkUrl = "http://hd.maxdata.cc:8185/app-update";

        plus.nativeUI.showWaiting("检测更新...");
        var xhr = new XMLHttpRequest();
        console.log(xhr)
        xhr.onreadystatechange = function () {
            switch (xhr.readyState) {
                case 4:
                    plus.nativeUI.closeWaiting();
                    if (xhr.status == 200) {
                        console.log("检测更新成功：" + xhr.responseText);
                        var newVer = xhr.responseText;
                        if (wgtVer && newVer && (wgtVer != newVer)) {
                            downWgt();	// 下载升级包
                        } else {
                        }
                    } else {
                        console.log("检测更新失败！");
                        plus.nativeUI.alert("检测更新失败！");
                    }
                    break;
                default:
                    break;
            }
        }
        xhr.open('GET', checkUrl);
        xhr.send();
// 下载wgt文件
        var wgtUrl = "http://hd.maxdata.cc:8185/dist/app_update/H5FC02897.wgt";

        function downWgt() {
            plus.nativeUI.showWaiting("下载更新文件中...");
            plus.downloader.createDownload(wgtUrl, {filename: "_doc/update/"}, function (d, status) {
                if (status == 200) {
                    console.log("下载wgt成功：" + d.filename);
                    installWgt(d.filename);	// 安装wgt包
                } else {
                    console.log("下载wgt失败！");
                    plus.nativeUI.alert("下载wgt失败！");
                }
                plus.nativeUI.closeWaiting();
            }).start();
        }

// 更新应用资源
        function installWgt(path) {
            plus.nativeUI.showWaiting("安装wgt文件...");
            plus.runtime.install(path, {}, function () {
                plus.nativeUI.closeWaiting();
                console.log("安装wgt文件成功！");
                plus.nativeUI.alert("应用资源更新完成！", function () {
                    plus.runtime.restart();
                });
            }, function (e) {
                plus.nativeUI.closeWaiting();
                console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
                plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
            });
        }
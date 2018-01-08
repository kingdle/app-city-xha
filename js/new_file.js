  var _self = this;
                        if (_self.picker) {
                            _self.picker.show(function (rs) {
                                result.innerText = rs.text;
                                _self.picker.dispose();
                                _self.picker = null;
                            });
                        } else {
                            var optionsJson = this.getAttribute('data-options') || '{}';

                            var options = JSON.parse(optionsJson);

                            var id = this.getAttribute('id');
                            _self.picker = new $.DtPicker(options);
                            _self.picker.show(function (rs) {

                                $result.innerText = rs.text;

                                var year = rs.y.value;
                                var month = parseInt(rs.m.value);

                                //设置kit的时间
                                kitV.baseFilterV.time_year = year;
                                kitV.baseFilterV.time_month = month;
                                kitS.baseFilterV.time_year = year;
                                kitS.baseFilterV.time_month = month;
                                //根据指标名称获取数值放到页面上
                                var cardh = document.getElementsByClassName("card-m").length;
                                for (var i = 0; i < cardh; i++) {
                                    var $title = $('.card-m>h5')[i].innerText;
                                    var $speed = $('.speed')[i];
                                    var $total = $('.total')[i];
                                    $speed.innerText = kitS.findValueByItemName($title, true);
                                    $total.innerText = kitV.findValueByItemName($title, true);
                                }
                                _self.picker.dispose();
                                _self.picker = null;
                            });
                        }
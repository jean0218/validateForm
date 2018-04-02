/*---------------------------------------------------------
@ 创建时间：20170526
@ 创 建 者：lunjiao.peng
@ 版本：V0.05
@ 功能描述：校验表单，校验表单中的输入框、单选框、下拉框
@ HTML代码示例 
        <input type="number" data-rule="text" max="10"  min="1"/>
        <input type="text" data-rule="text"/>
        <input type="checkbox" value="" name="" data-rule="notNull">
        <select data-rule="notNull">
            <option value="option12">text</option>
        </select>
@ html示例参数说明
        data-rule:可省，为空和省略则表示不校验。
                校验规则名,具体规则参见validateRules中的rule,提示信息参见message。

        data-rule="notNull"
                单选框或复选框组中，提交时至少选择一个

        readOnly：不校验输入框
        type = hidden : 不校验输入框
        max :设置输入框value的最大值,建议type=number时使用
        min :设置输入框value的最小值,建议type=number时使用
        maxlength:设置输入框能输入的最大字符串长度

@ 调用示例    
        validateForm.init('jsLoginForm');初始化
        validateForm.submit('jsLoginForm'); 提交时校验,返回true或false
        validateForm.insertMessage(obj,message);在当前对象后插入信息，如果message为空则清除错误信息提示,有BUG
        validateForm.delMessage(obj);删除传入对象的errorMessage
        validateForm.delFormMessage('jsLoginForm');
        validateForm.delAllErrorMessage('jsLoginForm');删除所有错误信息,老API，初次使用建议使用delFormMessage
@ param
        formId:表单ID，必填
---------------------------------------------------------*/
var validateForm = function() {
    return {
        init: init,
        submit: submit,
        insertMessage: errorMessage,
        delMessage: delErrorMessage,
        delFormMessage: delFormErrorMessage,
        delAllErrorMessage: delFormErrorMessage //老API，初次使用，建议使用delFormMessage
    }

    function config(formId) {
        if (!formId) {
            formError('noId');
            return false;
        }
        var initConfig = {
            formId: formId,
            debug: false //调试模式是否打开
        }
        return initConfig;
    }

    function init(formId) {
        var initConfig = config(formId);
        var formElement = getValidateForm(initConfig),
            elementValue;

        for (var i = 0, inputLength = formElement.singleInputList.length; i < inputLength; i++) {
            elementValue = formElement.singleInputList[i];
            if (elementValue.rule) {
                inputHandleBlur({
                    elementValue: elementValue,
                    debug: initConfig.debug
                });
            }
        }

        for (var i = 0, textareaLen = formElement.textareaList.length; i < textareaLen; i++) {
            elementValue = formElement.textareaList[i];
            if (elementValue.rule) {
                inputHandleBlur({
                    elementValue: elementValue,
                    debug: initConfig.debug
                });
            }

        }
        return false;
    }

    function submit(formId) {
        var initConfig = config(formId);
        var formElement = getValidateForm(initConfig);

        var checkInput,
            checkDateTime,
            checkSelect,
            Checkbox,
            textareaList;

        checkInput = inputListValidate({
            list: formElement.singleInputList,
            debug: initConfig.debug
        });

        checkDateTime = onlyRuleValidate({
            list: formElement.dateTimeList,
            debug: initConfig.debug
        });

        checkSelect = selectListValidate({
            list: formElement.selectList,
            debug: initConfig.debug
        });

        Checkbox = checkboxListValidate({
            list: formElement.checkboxList,
            debug: initConfig.debug
        });

        textareaList = onlyRuleValidate({
            list: formElement.textareaList,
            debug: initConfig.debug
        })
        return checkInput && checkDateTime && checkSelect && Checkbox && textareaList;
    }

    function delFormErrorMessage(formId) {
        var initConfig = config(formId);
        var formElement = getValidateForm(initConfig);

        delAllErrorMessage(formElement.selectList)
        delAllErrorMessage(formElement.checkboxList, 'checkbox');
        delAllErrorMessage(formElement.singleInputList);
        delAllErrorMessage(formElement.dateTimeList);
        delAllErrorMessage(formElement.textareaList);
        return;
    }

    function getValidateForm(initConfig){
        var INPUT_TYPE_CHECKBOX = 'checkbox',
            INPUT_TYPE_RADIO = 'radio',
            INPUT_TYPE_HIDDEN = 'hidden',
            INPUT_TYPE_BUTTON = 'button',
            INPUT_TYPE_DATETIME = 'datetime',
            INPUT_TYPE_DATE = 'date',
            INPUT_TYPE_DATETIMESEC = 'datetime-second',
            SELECT_TYPE = 'select';

        var formElement = document.getElementById(initConfig.formId),
            inputList = formElement.getElementsByTagName('input');

        var inputRule,
            readonly = "",
            inputType,
            dateInputType,

            checkboxItem = [],
            checkboxList = [],
            singleInputList = [],
            dateTimeList = [],
            
            thisElement;

        //过滤掉无需校验的对象
        for (var j = 0, inputLength = inputList.length; j < inputLength; j++) {
            thisElement = inputList[j];            
            inputRule = thisElement.getAttribute('data-rule');
            inputType = thisElement.type;
            if(inputRule){
                switch (inputType) {
                    //单选框或多选框
                    case INPUT_TYPE_CHECKBOX:
                    case INPUT_TYPE_RADIO:
                        if (inputList[j + 1]) {
                            if (thisElement.name == inputList[j + 1].name) {
                                checkboxItem.push(thisElement);
                            } else {
                                checkboxItem.push(thisElement);
                                checkboxList.push({
                                    type: inputType,
                                    name: thisElement.name,
                                    item: checkboxItem
                                });
                                checkboxItem = [];
                            }
                        } else { //最后一个
                            checkboxItem.push(thisElement);
                            checkboxList.push({
                                type: inputType,
                                name: thisElement.name,
                                item: checkboxItem
                            });
                            checkboxItem = [];
                        }
                        break;

                    case INPUT_TYPE_HIDDEN:
                        break;
                    case INPUT_TYPE_BUTTON:
                        break;
                    
                    //日期时间类型
                    case INPUT_TYPE_DATETIME:
                    case INPUT_TYPE_DATE:

                        dateTimeList.push({
                            element: thisElement,
                            rule: inputRule,
                            value: trim(thisElement.value)
                        })
                        break;

                    //单个input输入框
                    default:
                        readonly = thisElement.readOnly;
                        if (!readonly) {
                            singleInputList.push({
                                element: thisElement,
                                rule: inputRule,
                                value: trim(thisElement.value),
                                maxlength: thisElement.getAttribute('maxlength'),
                                max: thisElement.getAttribute('max'),
                                min: thisElement.getAttribute('min')
                            })
                            break;
                        }
                        //向下兼容，当设置data-type为自定时间组件
                        dateInputType = thisElement.getAttribute('data-type');                        
                        if (dateInputType == INPUT_TYPE_DATETIME || dateInputType == INPUT_TYPE_DATE || dateInputType == INPUT_TYPE_DATETIMESEC) {
                            dateTimeList.push({
                                element: thisElement,
                                rule: inputRule,
                                value: trim(thisElement.value)
                            })
                        }
                }
            }
            
        }

        //获取select标签列表
        var SELECT_RULE_LEASTONE = 'notNull';
        var selectList = formElement.getElementsByTagName('select'),
            selectedList = [];
        for (var i = 0, selectLength = selectList.length; i < selectLength; i++) {
            thisElement = selectList[i];
            if (thisElement.getAttribute('data-rule') == SELECT_RULE_LEASTONE) {
                selectedList.push({
                    element:thisElement,
                    rule:thisElement.getAttribute('data-rule')
                });
            }
        }

        //textarea校验
        var formTextareaList = formElement.getElementsByTagName('textarea'),
            textareaList = [],
            textareaRule;
        for(var i = 0, textareaLen = formTextareaList.length; i < textareaLen; i++){
            thisElement = formTextareaList[i];
            textareaRule = thisElement.getAttribute('data-rule');
            if(textareaRule){
                textareaList.push({
                    element:thisElement,
                    rule:textareaRule,
                    value: trim(thisElement.value)
                });
            }
        }

        return {
            checkboxList:checkboxList,
            singleInputList:singleInputList,
            selectList:selectedList,
            dateTimeList:dateTimeList,
            textareaList:textareaList
        };
    }   

    function delAllErrorMessage(list, checkbox) {
        if (list.length == 0) {
            return;
        }

        if (checkbox) {
            for (var i = 0, len = list.length; i < len; i++) {
                delErrorMessage(list[i].item[0].parentNode);
            }
            return;
        }
        for (var i = 0, len = list.length; i < len; i++) {
            delErrorMessage(list[i].element);
        }
        return;
    }

    //校验下拉框必须选择一个
    function selectListValidate(param) {
        var selectList = param.list;
        if (selectList.length == 0) {
            return true;
        }
        var selectedValue,
            itemValidate = true,
            checkResult,
            thisElement;
        for (var i = 0, len = selectList.length; i < len; i++) {
            thisElement = selectList[i].element;
            selectedValue = thisElement.options[thisElement.selectedIndex].value; //获取选定项的值
            if (!selectedValue) {
                if(param.debug){
                    console.log('至少选择一个值:', thisElement)
                }
                errorMessage(thisElement, validateRules.message[selectList[i].rule]);
                itemValidate = false;
            } else {
                delErrorMessage(thisElement);;
                itemValidate = itemValidate && true;
            }
        }
        return itemValidate;
    }

    function inputHandleBlur(param) {
        EventUtil.addHandler(param.elementValue.element, "blur", function(event) {
            event = EventUtil.getEvent(event); //获取事件对象
            var target = EventUtil.getTarget(event); //获取事件对象目标
            if (target.value.length > 0) {
                param.elementValue.value = target.value;
                inputCheckGroup({
                    elementValue: param.elementValue,
                    debug: param.debug
                });
            }
        })
    }

    function inputHandleBlurCheck(param) {
        var elementValue = param.elementValue;
        var checkResult = inputValidate(param);
        errorMessage(elementValue.element, checkResult.message);
        return checkResult.validate;
    }

    function inputMaxlengthCheck(param) {
        var elementValue = param.elementValue,
            maxlength = parseInt(elementValue.maxlength);
        if (!maxlength) {
            return true;
        }
        var len = elementValue.value.length;
        if (len > maxlength) {
            if (param.debug) {
                console.log('字符串长度必须小于' + maxlength + '位:', elementValue.element);
            }
            errorMessage(elementValue.element, '字符串长度必须小于' + maxlength + '位');
            return false;
        }
        delErrorMessage(elementValue.element);
        return true;
    }

    function inputMaxMinCheck(param) {
        var elementValue = param.elementValue;
        if (!elementValue.max && !elementValue.min) {
            return true;
        }
        var value = parseFloat(elementValue.value),
            minValue = parseFloat(elementValue.min),
            maxValue = parseFloat(elementValue.max);
        var checkResult = {
                validate: true,
                message: ''
            },
            itemValidate = true,
            minValueMessage = '',
            maxValueMessage = '',
            isMinValue = false,
            isMaxValue = false;
        if (!value) {            
            if (minValue || minValue == 0) {                
                minValueMessage = '大于' + minValue;
                itemValidate = false;
                isMinValue = true;
            }
            if (maxValue) {
                maxValueMessage = '小于' + maxValue;
                itemValidate = false;
                isMaxValue = true;
            }
            return minMaxMessage(param, minValue, maxValue, itemValidate, isMinValue, isMaxValue, minValueMessage, maxValueMessage, elementValue);            
        }
        if (minValue || minValue == 0) {
            if (value < minValue) {
                minValueMessage = '大于' + minValue;
                itemValidate = false;
            }
        }
        if (maxValue) {
            if (value > maxValue) {
                maxValueMessage = '小于' + maxValue;
                itemValidate = false;
            }
        }
        return minMaxMessage(param, minValue, maxValue, itemValidate, isMinValue, isMaxValue, minValueMessage, maxValueMessage, elementValue);
    }

    function minMaxMessage(param, minValue, maxValue, itemValidate, isMinValue, isMaxValue, minValueMessage, maxValueMessage, elementValue) {
        if (!itemValidate) {
            if (isMinValue && isMaxValue) {
                checkResult = {
                    validate: itemValidate,
                    message: '值必须' + minValue + '-' + maxValue + '之间'
                }
            } else {
                checkResult = {
                    validate: itemValidate,
                    message: '值必须' + minValueMessage + maxValueMessage
                }
            }

            if (param.debug) {
                console.log('值必须' + minValueMessage + maxValueMessage, elementValue.element);
            }
            errorMessage(elementValue.element, checkResult.message);
            return false;
        }
        delErrorMessage(elementValue.element);
        return itemValidate;
    }
    function delErrorMessage(obj) {
        var pObj = obj.parentNode.getElementsByTagName("p");
        if (pObj.length === 0) { //不存在P
            return;
        } else if (pObj[0].innerHTML.length >= 0) { //已存在P标签
            pObj[0].outerHTML = '';
            return;
        }
    }

    function errorMessage(obj, message) {
        var pObj = obj.parentNode.getElementsByTagName("p");
        if (pObj.length === 0) { //不存在P
            if (message.length == 0) {
                return;
            }
            var pElement = document.createElement("p");
            pElement.className = 'warning-message';
            pElement.innerHTML = message;
            obj.parentNode.appendChild(pElement);
            pObj.innerHTML = message;
        } else if (pObj[0].innerHTML.length >= 0) { //已存在P标签
            if (message.length == 0) {
                pObj[0].outerHTML = '';
                return;
            }
            pObj[0].innerHTML = message;
        }
    }
    //单个输入框的校验
    function inputValidate(param) {
        var rule = param.elementValue.rule;
        var textArr = new Array;
        if (rule.indexOf('&') > 0) { //判断校验规则是一个还是多个
            textArr = rule.split('&'); //拆分校验规则                
        } else {
            textArr[0] = rule;
        }
        return inputValidateArr(textArr, param.elementValue.value, param.elementValue.element, param.debug);
    }

    function inputValidateArr(arr, value, inputElement, debug) {
        var textReg, validate = true,
            msg = '',
            validateItem = true;
        for (var i = 0; i < arr.length; i++) {
            textReg = new RegExp(validateRules.rule[arr[i]]);
            validateItem = textReg.test(value);
            msg = validateItem ? '' : validateRules.message[arr[i]];
            if(!validateItem){
                if (debug) {
                    console.log('校验不通过:', inputElement);
                }
                return {
                    validate: validateItem,
                    message: msg
                }
            }
        }
        return {
            validate: true,
            message: ''
        }
    }

    //checKbox和radio的校验
    function checkboxListValidate(param) {
        var list = param.list;
        if (list.length == 0) {
            return true;
        }
        var checkboxIsChecked,
            listIschecked = true,
            checkResult = {
                validate: false,
                message: validateRules.message.notNull
            };
        for (var i = 0; i < list.length; i++) {
            checkboxIsChecked = false;
            for (var j = 0; j < list[i].item.length; j++) {
                checkboxIsChecked = checkboxIsChecked || list[i].item[j].checked;
            }
            if (!checkboxIsChecked) { //至少选择一个
                checkResult = {
                    validate: false,
                    message: validateRules.message.notNull
                }
                errorMessage(list[i].item[0].parentNode, checkResult.message);
            } else {
                checkResult = {
                    validate: true,
                    message: ''
                }
                errorMessage(list[i].item[0].parentNode, checkResult.message);
            }
            listIschecked = listIschecked && checkboxIsChecked;
        }
        return listIschecked;
    }

    function onlyRuleValidate(param) {
        var list = param.list;
        var elementLength = list.length;
        if (elementLength == 0) {
            return true;
        }
        var validate = true,
            itemValidate = true;
        for (var i = 0; i < elementLength; i++) {
            itemValidate = inputHandleBlurCheck({
                elementValue: list[i],
                debug: param.debug
            });
            validate = validate && itemValidate;
        }
        return validate;
    }

    function inputListValidate(param) {
        var list = param.list;
        var elementLength = list.length;
        if (elementLength == 0) {
            return true;
        }
        var validate = true,
            itemValidate = true;
        for (var i = 0; i < elementLength; i++) {
            itemValidate = inputCheckGroup({
                elementValue: list[i],
                debug: param.debug
            });
            validate = validate && itemValidate;
        }
        return validate;
    }

    function inputCheckGroup(param) {
        var itemValidate = true,
            itemMaxMinCheck = true,
            itemMaxlengthCheck = true;
        itemMaxlengthCheck = inputMaxlengthCheck({
            elementValue: param.elementValue,
            debug: param.debug
        });
        if (itemMaxlengthCheck) {
            itemMaxMinCheck = inputMaxMinCheck({
                elementValue: param.elementValue,
                debug: param.debug
            });
            if (itemMaxMinCheck && param.elementValue.rule) {

                itemValidate = inputHandleBlurCheck({
                    elementValue: param.elementValue,
                    debug: param.debug
                });
            }
        }
        return itemMaxlengthCheck && itemMaxMinCheck && itemValidate;
    }

    function formError(str) {
        switch (str) {
            case 'noId':
                throw ('Form标签的id不能为空');
                break;

        }
    }
    //去左右空格;
    function trim(s) {
        if (s == undefined || s == '') {
            return '';
        } else {
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }
    }

}();
//-------------------------------------------------------------------------------------------------------------------
// 跨浏览器的事件、事件对象处理程序
//-------------------------------------------------------------------------------------------------------------------
var EventUtil = { // 
    addHandler: function(element, type, handler) {
        if (element.addEventListener) { //IE9、Firefox,Safari,Chrome和Opera支持DOM2级事件处理程序
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) { //IE,Opera
            element.attachEvent("on" + type, handler);
        } else { //DOM0级
            element["on" + type] = handler;
        }
    },
    removeHandler: function(element, type, handler) {
        if (element.removeEventListenter) {
            element.removeEventListenter(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + type, handler);
        } else {
            element["on" + type] = null;
        }
    },
    getEvent: function(event) {
        return event ? event : window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    preventDefault: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    stopPropagation: function(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }
};

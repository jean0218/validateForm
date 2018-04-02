# validateForm
    javaScript实现的表单校验，可自由配置任意校验规则

# 功能描述
    校验表单，校验表单中的输入框、单选框、下拉框

# HTML代码示例 
    <input type="number" data-rule="text" max="10"  min="1"/>        
    <input type="text" data-rule="text"/>        
    <input type="checkbox" value="" name="" data-rule="notNull">        
    <select data-rule="notNull">        
      <option value="option12">text</option>            
    </select>       
        
# html示例参数说明
    data-rule:可省，为空和省略则表示不校验。
          校验规则名,具体规则参见validateRules中的rule,提示信息参见message。

    data-rule="notNull"
          单选框或复选框组中，提交时至少选择一个

    readOnly：不校验输入框
    type = hidden : 不校验输入框
    max :设置输入框value的最大值,建议type=number时使用
    min :设置输入框value的最小值,建议type=number时使用
    maxlength:设置输入框能输入的最大字符串长度


# 调用示例    
    validateForm.init('jsLoginForm');初始化
    validateForm.submit('jsLoginForm'); 提交时校验,返回true或false
    validateForm.insertMessage(obj,message);在当前对象后插入信息，如果message为空则清除错误信息提示
    validateForm.delMessage(obj);删除传入对象的errorMessage
    validateForm.delFormMessage('jsLoginForm');
    validateForm.delAllErrorMessage('jsLoginForm');删除所有错误信息,老API，初次使用建议使用delFormMessage
        
# param
    formId:表单ID，必填

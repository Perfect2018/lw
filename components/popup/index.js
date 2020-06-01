// components/popup/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: { // 属性名
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '提示' // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: ''
    },
    // 按钮类型
    type: {
      type: String,
      value: ''
    },
    // 弹窗取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hidePopup: function() {
      this.setData({
        flag: true
      });
    },
    //展示弹框
    showPopup() {
      this.setData({
        flag: false
      });
    },
    _cancel() {
      this.hidePopup();
      //触发取消回调
      this.triggerEvent("cancel")
    },
    _confirm() {
      //触发成功回调
      this.triggerEvent("confirm");
    },
    _getUserInfo(e) {
      //触发成功回调
      this.triggerEvent("userinfo", e.detail);
    }
  }
})
// pages/searchList/searchList.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
let staticData = {
  pageNum: 1,
  end: false
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 之前的关键词
    oldKw: "",
    // 关键词
    kw: "",
    // 提示语
    searchHolder: "请输入关键词",
    // 数据
    taskList: []
  },
  // 设置数据
  _setParams(e) {
    let key = e.currentTarget.dataset.key;
    let value = e.detail.value;
    this.setData({
      [key]: value
    });
  },
  // 搜索
  _search() {
    let kw = this.data.kw;
    let oldKw = this.data.oldKw;
    console.log(kw)
    if (kw) {
      if (kw === oldKw) {
        return
      }
      api._post("/message/searchMessage", {
        kw: kw,
        pageNum: 1
      }).then(res => {
        if (res.success) {
          console.log(res)
          staticData.pageNum = 2;
          this.setData({
            taskList: res.data.list,
            oldKw: kw
          });
        }
      })
    } else {
      util._toast("请输入关键词");
    }
  },
  // 加载更多
  _getMore() {
    let kw = this.data.kw;
    if (kw) {
      if (!staticData.end) {
        let pageNum = staticData.pageNum;
        api._post("/message/searchMessage", {
          kw: kw,
          pageNum: pageNum
        }).then(res => {
          if (res.success) {
            let taskList = this.data.taskList;
            this.setData({
              taskList: taskList.concat(res.data.list)
            });
            if (res.data.list.length >= 20) {
              staticData.pageNum += 1;
            } else {
              staticData.end = true;
            }
          } else {
            util._toast("暂无数据");
          }
        })
      } else {
        util._toast("暂无数据");
      }
    } else {
      util._toast("请输入关键词");
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._getMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
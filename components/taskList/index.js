// pages/components/orderList/index.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    taskList: {
      type: Array
    },
    taskType: {
      type: String
    }, 
    userId:{
      type:Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cIndex:'',
    isActive:false
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 删除数组中某个元素
// Array.prototype.indexOf = function (val) {
//   for(var i = 0; i < this.length; i++){
//    if(this[i] == val){return i;}
//   }
//   return -1;
//  }
//  Array.prototype.remove = function (val) {
//   var index = this.indexOf(val);
//   if(index > -1){this.splice(index,1);}
//  }
    _toView(e) {
      // console.log(e)
      let navigatePath = e.currentTarget.dataset.navigate;
      let id = e.currentTarget.dataset.id;
      let type = e.currentTarget.dataset.type
      // console.log(type)
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}&type=${type}`
      });
    },
    // 删除消息
    delete(e){
      let that = this
      let id = e.currentTarget.dataset.id
      // let cust_id = app.globalData.custInfo.id
      // let custId = that.data.taskList.custId
      let index = e.currentTarget.dataset.index
     if(that.data.taskType === 'mine'){
      that.setData({
        cIndex:index,
        isActive:true
      })
      wx.showModal({
        title: '删除提示',
        content: '确定删除吗？',
        cancelText:'取消',
        confirmText:'删除',
        confirmColor:'#1e90ff',
        success(res){
          if(res.confirm){
            api._post('/message/deleteMyMessage',{
              messageId:id
            }).then(res=>{
              if(res.success){
                let taskList = that.data.taskList
                util.arrRemoveObj(taskList,taskList[index])

                // let taskList = that.data.taskList.splice(index,1)
                
                
                that.setData({
                  taskList:taskList,
                  isActive:!that.data.isActive
                })
                util._toast('删除成功')
              }
            })
          }else if(res.cancel){
            // that._up()
            that.setData({
              cIndex:index,
              isActive:!that.data.isActive
            })
            // console.log(that.data.isActive)
          }
        }
      })
     }
    },

    // _up(){
    //   this.setData({
    //     isActive:!this.data.isActive
    //   })
    //   // console.log(this.data.isActive)
    // },
    // _down(){
    //   this.setData({
    //     isActive:true
    //   })
    //   // console.log(this.data.isActive)
    // }
  },
})
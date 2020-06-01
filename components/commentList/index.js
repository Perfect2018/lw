// components/commentList/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 留言列表
    commentList: {
      type: Array,
      default: []
    },
    // 当前custId
    cusrId: {
      type: String,
      default: ""
    }
  },
  observers: {
    'commentList' (commentList) {
      // console.log(commentList)
      this.setData({
        commentsList: commentList
      });
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    commentsList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 回复
    _reply(e) {
      let id = e.currentTarget.dataset.id;
      let custId = e.currentTarget.dataset.custid;
      let index = e.currentTarget.dataset.index;
      //触发回复回调
      this.triggerEvent("reply", {
        id,
        index,
        custId
      })
    },
  }
})
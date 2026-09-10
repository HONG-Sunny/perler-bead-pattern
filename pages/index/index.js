const convert = require('../../utils/convert.js')

const app = getApp()

Page({
  data: {
    imgPath: '',        // 选中的图片本地路径
    imgW: 0,
    imgH: 0,
    gridW: 48,          // 横向豆子数
    gridH: 0,           // 纵向豆子数（按原图比例算）
    beadTotal: 0,       // 预估总豆数
    converting: false
  },

  /** 选图：相册或拍照，jpg / png 都走这里 */
  chooseImage() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const file = res.tempFiles[0]
        wx.getImageInfo({
          src: file.tempFilePath,
          success(info) {
            that.setData({
              imgPath: file.tempFilePath,
              imgW: info.width,
              imgH: info.height
            }, that.updateGridSize)
          },
          fail() {
            wx.showToast({ title: '这张图读不了，换一张', icon: 'none' })
          }
        })
      }
    })
  },

  onGridChange(e) {
    this.setData({ gridW: e.detail.value }, this.updateGridSize)
  },

  /** 纵向豆数按原图宽高比推算 */
  updateGridSize() {
    const { imgW, imgH, gridW } = this.data
    if (!imgW || !imgH) return
    const gridH = Math.max(1, Math.round(gridW * imgH / imgW))
    this.setData({ gridH, beadTotal: gridW * gridH })
  },

  generate() {
    const that = this
    const { imgPath, gridW } = this.data
    if (!imgPath) {
      wx.showToast({ title: '先选一张图片', icon: 'none' })
      return
    }
    this.setData({ converting: true })
    wx.showLoading({ title: '正在配色…', mask: true })

    convert.convert(imgPath, gridW).then(function (pattern) {
      app.globalData.pattern = pattern
      app.globalData.sourceImage = imgPath
      wx.hideLoading()
      that.setData({ converting: false })
      wx.navigateTo({ url: '/pages/result/result' })
    }).catch(function (err) {
      wx.hideLoading()
      that.setData({ converting: false })
      wx.showModal({
        title: '转换失败',
        content: (err && err.message) || '未知错误',
        showCancel: false
      })
    })
  }
})

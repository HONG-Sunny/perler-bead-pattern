const palette = require('../../utils/palette.js')

const app = getApp()

// 每 10 格画一条粗线，实际拼的时候好数
const MAJOR_STEP = 10

Page({
  data: {
    gw: 0,
    gh: 0,
    total: 0,
    colorKinds: 0,
    stats: [],
    cw: 0,          // canvas 宽（px）
    ch: 0,          // canvas 高（px）
    cell: 8,        // 每颗豆的边长（px）
    viewH: 400      // 图纸可视区高度（px）
  },

  onLoad() {
    const pattern = app.globalData.pattern
    if (!pattern) {
      wx.showModal({
        title: '没有图纸数据',
        content: '请回上一页重新生成',
        showCancel: false,
        success: () => wx.navigateBack()
      })
      return
    }
    this.pattern = pattern

    const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const usable = sys.windowWidth - 48   // 左右各留 24px
    // 一颗豆至少 8px，画得下就铺满屏宽
    const cell = Math.max(8, Math.floor(usable / pattern.gw))

    this.setData({
      gw: pattern.gw,
      gh: pattern.gh,
      total: pattern.total,
      colorKinds: pattern.stats.length,
      stats: pattern.stats,
      cell,
      cw: pattern.gw * cell,
      ch: pattern.gh * cell,
      viewH: Math.min(Math.round(sys.windowHeight * 0.56), pattern.gh * cell + 4)
    }, this.draw)
  },

  draw() {
    const that = this
    wx.createSelectorQuery()
      .in(this)
      .select('#pattern')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio

        const { cw, ch, cell } = that.data
        canvas.width = cw * dpr
        canvas.height = ch * dpr
        ctx.scale(dpr, dpr)

        that.render(ctx, cell)
      })
  },

  render(ctx, cell) {
    const { grid, gw, gh } = this.pattern
    const colors = palette.COLORS

    ctx.clearRect(0, 0, gw * cell, gh * cell)

    // 底色：留空的格子显示浅灰，一眼能看出哪里不放豆
    ctx.fillStyle = '#f2f3f5'
    ctx.fillRect(0, 0, gw * cell, gh * cell)

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const idx = grid[y * gw + x]
        if (idx < 0) continue
        ctx.fillStyle = colors[idx].hex
        ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }

    // 细网格
    if (cell >= 6) {
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'rgba(0,0,0,0.10)'
      ctx.beginPath()
      for (let x = 0; x <= gw; x++) {
        ctx.moveTo(x * cell, 0)
        ctx.lineTo(x * cell, gh * cell)
      }
      for (let y = 0; y <= gh; y++) {
        ctx.moveTo(0, y * cell)
        ctx.lineTo(gw * cell, y * cell)
      }
      ctx.stroke()
    }

    // 每 10 格的粗线
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(0,0,0,0.42)'
    ctx.beginPath()
    for (let x = 0; x <= gw; x += MAJOR_STEP) {
      ctx.moveTo(x * cell, 0)
      ctx.lineTo(x * cell, gh * cell)
    }
    for (let y = 0; y <= gh; y += MAJOR_STEP) {
      ctx.moveTo(0, y * cell)
      ctx.lineTo(gw * cell, y * cell)
    }
    ctx.stroke()
  },

  back() {
    wx.navigateBack()
  }
})

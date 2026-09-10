const palette = require('../../utils/palette.js')

const app = getApp()

// 每 10 格画一条粗线，实际拼的时候好数
const MAJOR_STEP = 10

// —— 导出图的排版参数（单位 px）——
const EXPORT = {
  maxCell: 26,        // 每颗豆最大边长
  minCell: 10,        // 太大的图纸就缩小格子，避免画布超出设备上限
  maxWidth: 2400,     // 图纸区域最大宽度
  maxSide: 4000,      // 画布单边上限，超了就缩小格子（低端机 canvas 有尺寸限制）
  pad: 40,            // 四周留白
  axis: 56,           // 上/左坐标栏宽度
  titleH: 110,        // 标题区高度
  legendItemH: 52,    // 配色表每行高
  legendColW: 340     // 配色表每列宽
}

Page({
  data: {
    gw: 0,
    gh: 0,
    total: 0,
    colorKinds: 0,
    stats: [],
    cw: 0,          // 预览 canvas 宽（px）
    ch: 0,          // 预览 canvas 高（px）
    cell: 8,        // 预览时每颗豆的边长（px）
    viewH: 400,     // 图纸可视区高度（px）
    exportW: 0,     // 导出 canvas 尺寸
    exportH: 0,
    saving: false
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
    }, this.drawPreview)
  },

  /* ============ 屏幕预览 ============ */

  drawPreview() {
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

        that.drawGrid(ctx, 0, 0, cell)
      })
  },

  /** 把图纸格子画到 ctx 的 (ox, oy) 处 */
  drawGrid(ctx, ox, oy, cell) {
    const { grid, gw, gh } = this.pattern
    const colors = palette.COLORS
    const w = gw * cell
    const h = gh * cell

    // 留空的格子显示浅灰，一眼能看出哪里不放豆
    ctx.fillStyle = '#f2f3f5'
    ctx.fillRect(ox, oy, w, h)

    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const idx = grid[y * gw + x]
        if (idx < 0) continue
        ctx.fillStyle = colors[idx].hex
        ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell)
      }
    }

    // 细网格
    if (cell >= 6) {
      ctx.lineWidth = cell >= 16 ? 1 : 0.5
      ctx.strokeStyle = 'rgba(0,0,0,0.10)'
      ctx.beginPath()
      for (let x = 0; x <= gw; x++) {
        ctx.moveTo(ox + x * cell, oy)
        ctx.lineTo(ox + x * cell, oy + h)
      }
      for (let y = 0; y <= gh; y++) {
        ctx.moveTo(ox, oy + y * cell)
        ctx.lineTo(ox + w, oy + y * cell)
      }
      ctx.stroke()
    }

    // 每 10 格的粗线
    ctx.lineWidth = cell >= 16 ? 2 : 1
    ctx.strokeStyle = 'rgba(0,0,0,0.42)'
    ctx.beginPath()
    for (let x = 0; x <= gw; x += MAJOR_STEP) {
      ctx.moveTo(ox + x * cell, oy)
      ctx.lineTo(ox + x * cell, oy + h)
    }
    for (let y = 0; y <= gh; y += MAJOR_STEP) {
      ctx.moveTo(ox, oy + y * cell)
      ctx.lineTo(ox + w, oy + y * cell)
    }
    ctx.stroke()
  },

  /* ============ 保存到相册 ============ */

  saveToAlbum() {
    if (this.data.saving) return
    const that = this
    const { gw, gh } = this.pattern

    const layout = this.computeExportLayout(gw, gh, this.data.stats.length)
    const cell = layout.cell
    const cols = layout.cols
    const rows = layout.rows
    const exportW = layout.exportW
    const exportH = layout.exportH

    this.setData({ saving: true, exportW, exportH }, function () {
      wx.showLoading({ title: '生成图片…', mask: true })
      wx.createSelectorQuery()
        .in(that)
        .select('#exportCanvas')
        .fields({ node: true, size: true })
        .exec(function (res) {
          if (!res || !res[0] || !res[0].node) {
            wx.hideLoading()
            that.setData({ saving: false })
            wx.showToast({ title: '导出画布初始化失败', icon: 'none' })
            return
          }
          const canvas = res[0].node
          canvas.width = exportW
          canvas.height = exportH
          const ctx = canvas.getContext('2d')

          that.drawExport(ctx, exportW, exportH, cell, cols, rows)

          wx.canvasToTempFilePath({
            canvas: canvas,
            destWidth: exportW,
            destHeight: exportH,
            fileType: 'png',
            success: function (r) { that.writeToAlbum(r.tempFilePath) },
            fail: function () {
              wx.hideLoading()
              that.setData({ saving: false })
              wx.showToast({ title: '图片生成失败', icon: 'none' })
            }
          })
        })
    })
  },

  /** 算导出图排版；画布超出单边上限就把格子调小重算 */
  computeExportLayout(gw, gh, kinds) {
    let cell = Math.max(
      EXPORT.minCell,
      Math.min(EXPORT.maxCell, Math.floor(EXPORT.maxWidth / gw))
    )
    let result = null
    while (true) {
      const gridW = gw * cell
      const gridH = gh * cell
      const cols = Math.max(1, Math.floor((gridW + EXPORT.axis) / EXPORT.legendColW))
      const rows = Math.ceil(kinds / cols)
      const legendH = 70 + rows * EXPORT.legendItemH
      const exportW = EXPORT.pad * 2 + EXPORT.axis + gridW
      const exportH = EXPORT.pad * 2 + EXPORT.titleH + EXPORT.axis + gridH + legendH
      result = { cell, cols, rows, exportW, exportH }
      if (cell <= EXPORT.minCell) break
      if (exportW <= EXPORT.maxSide && exportH <= EXPORT.maxSide) break
      cell -= 2
      if (cell < EXPORT.minCell) cell = EXPORT.minCell
    }
    return result
  },

  /** 画完整的一张导出图：标题 + 坐标 + 图纸 + 配色表 */
  drawExport(ctx, W, H, cell, cols, rows) {
    const { gw, gh } = this.pattern
    const stats = this.data.stats
    const pad = EXPORT.pad
    const axis = EXPORT.axis
    const gx = pad + axis                 // 图纸左上角
    const gy = pad + EXPORT.titleH + axis

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // 标题
    ctx.fillStyle = '#1a1a1e'
    ctx.font = 'bold 46px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('拼豆图纸', pad, pad + 46)

    ctx.fillStyle = '#8a8c96'
    ctx.font = '28px sans-serif'
    ctx.fillText(
      gw + ' × ' + gh + ' 颗   共 ' + this.data.total + ' 颗   ' + stats.length + ' 种颜色',
      pad, pad + 92
    )

    // 坐标数字：每 10 格标一次
    ctx.fillStyle = '#9a9ca6'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    for (let x = MAJOR_STEP; x <= gw; x += MAJOR_STEP) {
      ctx.fillText(String(x), gx + x * cell - cell / 2, gy - 12)
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let y = MAJOR_STEP; y <= gh; y += MAJOR_STEP) {
      ctx.fillText(String(y), gx - 14, gy + y * cell - cell / 2)
    }

    // 图纸
    this.drawGrid(ctx, gx, gy, cell)
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = 2
    ctx.strokeRect(gx, gy, gw * cell, gh * cell)

    // 配色表
    const ly = gy + gh * cell + 64
    ctx.fillStyle = '#1a1a1e'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('配色表', pad, ly)

    const colW = Math.floor((W - pad * 2) / cols)
    for (let i = 0; i < stats.length; i++) {
      const s = stats[i]
      const col = Math.floor(i / rows)
      const row = i % rows
      const x = pad + col * colW
      const y = ly + 34 + row * EXPORT.legendItemH

      ctx.fillStyle = s.hex
      ctx.fillRect(x, y, 34, 34)
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, 33, 33)

      ctx.fillStyle = '#1a1a1e'
      ctx.font = 'bold 26px sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.code, x + 48, y + 17)

      ctx.fillStyle = '#6a6c76'
      ctx.font = '24px sans-serif'
      ctx.fillText(s.name, x + 120, y + 17)

      ctx.fillStyle = '#1a1a1e'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(s.count + ' 颗', x + colW - 30, y + 17)
      ctx.textAlign = 'left'
    }
  },

  /** 写相册，顺带处理用户拒绝授权的情况 */
  writeToAlbum(tempFilePath) {
    const that = this
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: function () {
        wx.hideLoading()
        that.setData({ saving: false })
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: function (err) {
        wx.hideLoading()
        that.setData({ saving: false })
        const msg = (err && err.errMsg) || ''
        if (msg.indexOf('auth deny') >= 0 || msg.indexOf('authorize') >= 0) {
          wx.showModal({
            title: '需要相册权限',
            content: '保存图纸需要「添加到相册」权限，去设置里打开吧',
            confirmText: '去设置',
            success: function (r) {
              if (r.confirm) wx.openSetting()
            }
          })
        } else if (msg.indexOf('cancel') < 0) {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  back() {
    wx.navigateBack()
  }
})

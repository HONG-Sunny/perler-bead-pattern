/**
 * 图片 -> 拼豆图纸 的核心逻辑
 *
 * 两步：
 *   1) pixelate：把原图缩到 gridW × gridH，缩放过程本身就是区域平均，每个像素 = 一颗豆
 *   2) buildPattern：每个像素在色板里找感知上最接近的色号（CIE Lab ΔE），并统计用量
 */

const palette = require('./palette.js')

/** 图片按目标宽度像素化，返回 RGBA 数据 */
function pixelate(src, gridW) {
  return new Promise(function (resolve, reject) {
    wx.getImageInfo({
      src: src,
      success: function (info) {
        var gw = Math.max(1, Math.round(gridW))
        var gh = Math.max(1, Math.round(gw * info.height / info.width))

        var canvas
        try {
          canvas = wx.createOffscreenCanvas({ type: '2d', width: gw, height: gh })
        } catch (e) {
          reject(new Error('当前基础库不支持离屏 Canvas，请把调试基础库切到 2.16.1 以上'))
          return
        }

        var ctx = canvas.getContext('2d')
        var img = canvas.createImage()

        img.onload = function () {
          try {
            ctx.clearRect(0, 0, gw, gh)
            // 缩放时的插值 = 区域平均，正好是像素化想要的效果
            ctx.drawImage(img, 0, 0, gw, gh)
            var imageData = ctx.getImageData(0, 0, gw, gh)
            resolve({ gw: gw, gh: gh, data: imageData.data })
          } catch (e) {
            reject(e)
          }
        }
        img.onerror = function () {
          reject(new Error('图片解码失败，换一张试试'))
        }
        img.src = info.path
      },
      fail: function () {
        reject(new Error('读取图片信息失败'))
      }
    })
  })
}

/** Lab 空间欧氏距离（ΔE76），够用且快 */
function deltaE(lab1, lab2) {
  var dL = lab1[0] - lab2[0]
  var da = lab1[1] - lab2[1]
  var db = lab1[2] - lab2[2]
  return dL * dL + da * da + db * db
}

/**
 * RGBA 数据 -> 图纸
 * @param {Uint8ClampedArray} data  长度 gw*gh*4
 * @param {number} gw
 * @param {number} gh
 * @param {object} opts
 *   - colors        指定可用色（默认全色板），元素同 palette.COLORS
 *   - alphaCutoff   alpha 低于此值算「不放豆」，默认 128
 * @returns {{ grid:Int16Array, gw:number, gh:number, stats:Array, total:number }}
 *   grid 里存色板下标，-1 表示留空
 */
function buildPattern(data, gw, gh, opts) {
  opts = opts || {}
  var colors = opts.colors || palette.COLORS
  var alphaCutoff = opts.alphaCutoff == null ? 128 : opts.alphaCutoff

  var n = gw * gh
  var grid = new Int16Array(n)
  var counts = new Array(colors.length).fill(0)
  var cache = {}          // 同色像素直接查表，大图能省不少时间
  var total = 0

  for (var i = 0; i < n; i++) {
    var o = i * 4
    var a = data[o + 3]
    if (a < alphaCutoff) {
      grid[i] = -1
      continue
    }
    var r = data[o], g = data[o + 1], b = data[o + 2]
    // 半透明像素按白底合成，避免边缘发黑
    if (a < 255) {
      var k = a / 255
      r = Math.round(r * k + 255 * (1 - k))
      g = Math.round(g * k + 255 * (1 - k))
      b = Math.round(b * k + 255 * (1 - k))
    }

    var key = (r << 16) | (g << 8) | b
    var idx = cache[key]
    if (idx === undefined) {
      var lab = palette.rgbToLab(r, g, b)
      var best = 0
      var bestD = Infinity
      for (var c = 0; c < colors.length; c++) {
        var d = deltaE(lab, colors[c].lab)
        if (d < bestD) { bestD = d; best = c }
      }
      idx = best
      cache[key] = idx
    }
    grid[i] = idx
    counts[idx]++
    total++
  }

  var stats = []
  for (var j = 0; j < colors.length; j++) {
    if (counts[j] > 0) {
      stats.push({
        index: j,
        code: colors[j].code,
        name: colors[j].name,
        hex: colors[j].hex,
        count: counts[j]
      })
    }
  }
  stats.sort(function (x, y) { return y.count - x.count })

  return { grid: grid, gw: gw, gh: gh, stats: stats, total: total }
}

/** 一步到位：图片路径 -> 图纸 */
function convert(src, gridW, opts) {
  return pixelate(src, gridW).then(function (res) {
    return buildPattern(res.data, res.gw, res.gh, opts)
  })
}

module.exports = {
  pixelate: pixelate,
  buildPattern: buildPattern,
  convert: convert,
  deltaE: deltaE
}

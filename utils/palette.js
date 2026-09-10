/**
 * 拼豆色板（MARD 漫漫常用色号体系）
 *
 * ⚠️ 说明：下面的 rgb 是按常见色卡目测整理的**近似值**，不是厂商官方色值。
 * 拿到实物色卡后，建议逐个校准：改这里的 rgb 即可，其它代码不用动。
 * 也可以直接增删色号——比如只留你手上真正有的颜色，图纸就不会出现买不到的色。
 *
 * 格式：{ code 色号, name 中文名, rgb [r,g,b] }
 */

const PALETTE = [
  // A 系 —— 白灰黑 / 肤色 / 棕色
  { code: 'A1',  name: '白',     rgb: [255, 255, 255] },
  { code: 'A2',  name: '米白',   rgb: [245, 240, 230] },
  { code: 'A3',  name: '浅灰',   rgb: [208, 210, 212] },
  { code: 'A4',  name: '银灰',   rgb: [186, 190, 194] },
  { code: 'A5',  name: '中灰',   rgb: [150, 152, 155] },
  { code: 'A6',  name: '深灰',   rgb: [ 90,  92,  95] },
  { code: 'A7',  name: '黑',     rgb: [ 30,  30,  32] },
  { code: 'A8',  name: '浅肤',   rgb: [255, 222, 196] },
  { code: 'A9',  name: '肤色',   rgb: [248, 200, 168] },
  { code: 'A10', name: '深肤',   rgb: [214, 158, 120] },
  { code: 'A11', name: '米色',   rgb: [232, 214, 184] },
  { code: 'A12', name: '卡其',   rgb: [198, 178, 140] },
  { code: 'A13', name: '浅棕',   rgb: [176, 124,  86] },
  { code: 'A14', name: '棕',     rgb: [128,  84,  52] },
  { code: 'A15', name: '咖啡',   rgb: [ 96,  68,  52] },
  { code: 'A16', name: '深棕',   rgb: [ 84,  54,  34] },

  // B 系 —— 红 / 橙 / 黄 / 粉
  { code: 'B1',  name: '大红',   rgb: [227,  38,  44] },
  { code: 'B2',  name: '正红',   rgb: [204,  26,  38] },
  { code: 'B3',  name: '深红',   rgb: [158,  26,  38] },
  { code: 'B4',  name: '酒红',   rgb: [122,  32,  48] },
  { code: 'B5',  name: '橙红',   rgb: [240,  90,  52] },
  { code: 'B6',  name: '橙',     rgb: [245, 140,  44] },
  { code: 'B7',  name: '浅橙',   rgb: [250, 178,  96] },
  { code: 'B8',  name: '杏色',   rgb: [252, 206, 150] },
  { code: 'B9',  name: '金黄',   rgb: [245, 182,  32] },
  { code: 'B10', name: '黄',     rgb: [255, 215,  60] },
  { code: 'B11', name: '柠檬黄', rgb: [250, 238, 110] },
  { code: 'B12', name: '浅黄',   rgb: [253, 240, 180] },
  { code: 'B13', name: '玫红',   rgb: [226,  72, 124] },
  { code: 'B14', name: '桃红',   rgb: [240, 110, 140] },
  { code: 'B15', name: '粉红',   rgb: [246, 150, 170] },
  { code: 'B16', name: '浅粉',   rgb: [250, 196, 208] },

  // C 系 —— 绿 / 青
  { code: 'C1',  name: '墨绿',   rgb: [ 18,  72,  52] },
  { code: 'C2',  name: '深绿',   rgb: [ 24,  96,  60] },
  { code: 'C3',  name: '绿',     rgb: [ 42, 152,  84] },
  { code: 'C4',  name: '草绿',   rgb: [ 92, 180,  74] },
  { code: 'C5',  name: '浅绿',   rgb: [148, 206, 120] },
  { code: 'C6',  name: '嫩绿',   rgb: [196, 226, 150] },
  { code: 'C7',  name: '黄绿',   rgb: [172, 196,  52] },
  { code: 'C8',  name: '橄榄',   rgb: [122, 130,  54] },
  { code: 'C9',  name: '青绿',   rgb: [ 32, 158, 142] },
  { code: 'C10', name: '湖绿',   rgb: [ 84, 192, 178] },
  { code: 'C11', name: '薄荷',   rgb: [168, 222, 208] },
  { code: 'C12', name: '松石',   rgb: [ 44, 178, 190] },

  // D 系 —— 蓝 / 紫
  { code: 'D1',  name: '藏青',   rgb: [ 20,  38,  84] },
  { code: 'D2',  name: '深蓝',   rgb: [ 24,  52, 120] },
  { code: 'D3',  name: '宝蓝',   rgb: [ 40,  72, 160] },
  { code: 'D4',  name: '蓝',     rgb: [ 34,  96, 182] },
  { code: 'D5',  name: '青蓝',   rgb: [ 40, 130, 190] },
  { code: 'D6',  name: '天蓝',   rgb: [ 72, 152, 220] },
  { code: 'D7',  name: '浅蓝',   rgb: [140, 196, 238] },
  { code: 'D8',  name: '冰蓝',   rgb: [196, 224, 244] },
  { code: 'D9',  name: '深紫',   rgb: [ 76,  38, 116] },
  { code: 'D10', name: '紫',     rgb: [108,  60, 158] },
  { code: 'D11', name: '浅紫',   rgb: [168, 138, 206] },
  { code: 'D12', name: '淡紫',   rgb: [208, 190, 230] },
  { code: 'D13', name: '紫红',   rgb: [158,  52, 132] },
  { code: 'D14', name: '藕荷',   rgb: [222, 204, 222] }
]

/** [r,g,b] -> '#rrggbb' */
function toHex(rgb) {
  return '#' + rgb.map(function (v) {
    var s = Math.max(0, Math.min(255, Math.round(v))).toString(16)
    return s.length === 1 ? '0' + s : s
  }).join('')
}

/** sRGB -> CIE Lab（D65），用于做感知上更准的颜色匹配 */
function rgbToLab(r, g, b) {
  var rr = r / 255, gg = g / 255, bb = b / 255
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92

  var x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047
  var y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.00000
  var z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883

  function f(t) {
    return t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + 16 / 116
  }
  var fx = f(x), fy = f(y), fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

// 预计算，匹配时直接用
var COLORS = PALETTE.map(function (c) {
  return {
    code: c.code,
    name: c.name,
    rgb: c.rgb,
    hex: toHex(c.rgb),
    lab: rgbToLab(c.rgb[0], c.rgb[1], c.rgb[2])
  }
})

module.exports = { PALETTE: PALETTE, COLORS: COLORS, rgbToLab: rgbToLab, toHex: toHex }

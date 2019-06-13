function splitHole(hole, rect) {
  var result = []
  var hx = hole[0], hy = hole[1], hw = hole[2], hh = hole[3];
  var rx = rect[0], ry = rect[1], rw = rect[2], rh = rect[3];
  if (rx >= hx + hw || rx + rw <= hx || ry >= hy + hh || ry + rh <= hy) return 0
  if (rx < hx + hw && rx + rw > hx) {
    if (ry > hy && ry < hy + hh) result.push([hx, hy, hw, ry - hy])
    if (ry + rh < hy + hh) result.push([hx, ry + rh, hw, hy + hh - ry - rh])
  }
  if (ry < hy + hh && ry + rh > hy) {
    if (rx > hx && rx < hx + hw) result.push([hx, hy, rx - hx, hh])
    if (rx + rw < hx + hw) result.push([rx + rw, hy, hx + hw - rx - rw, hh])
  }
  return result
}

function removeRedunduntHoles(holes) {
  var result = {}
  for (var i = 0; i < holes.length; i++) result[i] = holes[i]
  for (var i = 0; i < holes.length; i++) {
    for (var j = i + 1; j < holes.length; j++) {
      var ax = holes[i][0], ay = holes[i][1], aw = holes[i][2], ah = holes[i][3];
      var bx = holes[j][0], by = holes[j][1], bw = holes[j][2], bh = holes[j][3];
      if (ax >= bx && ay >= by && ax + aw <= bx + bw && ay + ah <= by + bh)
        delete result[i]
      else if (bx >= ax && by >= ay && bx + bw <= ax + aw && by + bh <= ay + ah)
        delete result[j]
    }
  }
  var resultList = []
  for (var i in result) resultList.push(result[i])
  return resultList
}

function getScoredRect(holes, width, height) {
  var score = Number.MAX_VALUE
  var rect = null
  for (var i = 0; i < holes.length; i++) {
    var hx = holes[i][0], hy = holes[i][1], hw = holes[i][2], hh = holes[i][3];
    var newScore = Math.min(hw - width, hh - height)
    var newScoreFlipped = Math.min(hw - height, hh - width)
    if (hw >= width && hh >= height && newScore < score) {
      rect = [hx, hy, width, height]
      score = newScore
    }
    if (hw >= height && hh >= width && newScoreFlipped < score) {
      rect = [hx, hy, height, width, true]
      score = newScoreFlipped
    }
  }
  return rect ? [score, rect] : null
}

function maxrects(rects, width, height) {
  var holes = [[0, 0, width, height]]
  var unused = {}
  var packed = {}
  for (var i = 0; i < rects.length; i++) unused[i] = rects[i]
  while (Object.keys(unused).length) {
    var minScore = Number.MAX_VALUE
    var bestIndex = -1
    var bestRect = null
    for (var i in unused) {
      var rectAndScore = getScoredRect(holes, rects[+i][0], rects[+i][1])
      if (rectAndScore && minScore > rectAndScore[0]) {
        bestIndex = +i
        minScore = rectAndScore[0]
        bestRect = rectAndScore[1]
      }
    }
    if (!bestRect) break
    delete unused[bestIndex]
    packed[bestIndex] = bestRect
    var newHoles = []
    var newSplitted = []
    for (var i = 0; i < holes.length; i++) {
      var splitted = splitHole(holes[i], bestRect)
      if (splitted) newSplitted.push.apply(newSplitted, splitted)
      else newHoles.push(holes[i])
    }
    holes = removeRedunduntHoles(newHoles.concat(newSplitted))
  }

  return {
    free: holes,
    unused: unused,
    packed: packed,
  }
}
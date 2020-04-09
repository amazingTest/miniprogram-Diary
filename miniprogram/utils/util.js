
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function randomChoiceElement(list) {
  let randomIndex = Math.floor(Math.random() * list.length + 1) - 1;
  return list[randomIndex]
}

// 四舍五入保留 v 小数点后 e 位
function round(v, e) {
  let t = 1;
  for (; e > 0; t *= 10, e--);
  for (; e < 0; t /= 10, e++);
  return Math.round(v * t) / t;
}

module.exports = {
  formatTime: formatTime,
  randomChoiceElement: randomChoiceElement,
  round: round
}

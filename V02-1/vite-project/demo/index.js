// 当我们节点数量非常大的时候，浏览器渲染会非常卡顿，因为浏览器是单线程的
// 分层思想，拆分每个任务，每个任务只执行两个任务
// deadline 代表的是该任务下剩余的时间
function workLoop(deadline) {
  console.log('deadline', deadline.timeRemaining())
  
  let shouldRun = false;
  while(!shouldRun) {
    shouldRun = deadline.timeRemaining() < 1
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
/**
 * 任务调度器 & fiber 架构
 **/
function createElement(type,props,...children){
    // 需要对children进行处理,如果内容为文本元素，需要使用createTextNode方法
    return {
        type,
        props:{
            ...props,
            children:children.map(child =>{
                const testNode  = typeof child === 'string' || typeof child === 'number'
                return testNode ? createTextNode(child) : child ;
            })
        }
    }
}
function createTextNode(text){
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue: text,
            children:[],
        }
    }
}

/**
    实现统一提交
    中途有可能没空余时间，用户会看到渲染一半的DOM
    计算结束后统一添加到屏幕里面
**/
let root = null;
// 处理el.props和el.children时， 需要分开处理，使用递归的方式，实现render
function render(el,container){
    nextwork = {
        dom: container,
        props: {
            children: [el],
        }
    }
    root = nextwork;
}

// 当前的任务
let nextwork = null;
function workLoop(deadline){
    let shouldYield  = false;
    while(!shouldYield && nextwork) {
        //执行dom
        nextwork = performUnitOfWork(nextwork);
        console.log("nextWork", nextwork);

        shouldYield = deadline.timeRemaining() < 1;
    }
    //只需要执行一次
    if(!nextwork && root) {
        commitRoot();
    }
    requestIdleCallback(workLoop)
}

function commitRoot(){
    commitWork(root.child);
    root = null;
}

function commitWork(fiber){
    if (!fiber) return;
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent;
    }

    if (fiber.dom) {
        fiberParent.dom.append(fiber.dom)
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
 return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

function updateProps(dom, props){
    Object.keys(props).forEach(key => {
        if (key !== 'children') {
            // 给dom创建props
            dom[key] = props[key];
        }
    });
}

// 这里是判断的是否是函数，
// 如果是函数就是函数组件，函数组件的话，我们是不需要去创建DOM的,并且我们是需要的children类型是数组,所以我们用[]去包裹一下,并且使用我们传入的children
function initChildren(fiber, children) {
//  const children = fiber.props.children;
 let prevChild = null;
 children.forEach((child, index) => {
    const newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null, 
        dom: null,
    }

    if(index  === 0) {
        fiber.child = newFiber;
    } else {
        prevChild.sibling  = newFiber;
    }

    prevChild = newFiber;
 })
}

//函数组件
function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)];
    initChildren(fiber, children);
}

//非函数组件
function updateHostComponent(fiber) {
    if(!fiber.dom) {
        // 创建dom
        const dom = (fiber.dom = createDom(fiber.type));
        // 统一使用roota提交
        // fiber.parent.dom.append(dom);

        // 处理props
        // 设置id和class
        updateProps(dom, fiber.props)
    }

    const children = fiber.props.children;
    initChildren(fiber, children);
}

function performUnitOfWork(fiber){
    const isFunctionComponent = typeof fiber.type === 'function';
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }
//     if(!isFunctionComponent){
//         if(!fiber.dom) {
//             // 创建dom
//             const dom = (fiber.dom = createDom(fiber.type));
//             // 统一使用roota提交
//             // fiber.parent.dom.append(dom);
    
//             // 处理props
//             // 设置id和class
//             updateProps(dom, fiber.props)
//         }
//     }

//     const children = isFunctionComponent ? [fiber.type(fiber.props)]: fiber.props.children;
    
//     // 处理节点之间的关系
//    initChildren(fiber, children);

    // 返回下一个要执行的任务
    if(fiber.child) {
        return fiber.child;
    }
    console.log(fiber)
    // if(fiber.sibling){
    //     return fiber.sibling;
    // }

    // return fiber.parent?.sibling;

    // 循环去找父级
    let nextFiber = fiber;
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }

}

requestIdleCallback(workLoop)


const React = {
    render,
    createElement,
}

export default React;
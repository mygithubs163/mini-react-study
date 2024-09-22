/**
 * 任务调度器 & fiber 架构
 **/
function createElement(type,props,...children){
    // 需要对children进行处理,如果内容为文本元素，需要使用createTextNode方法
    return {
        type,
        props:{
            ...props,
            children: children.map(child =>{
                const testNode  = typeof child === 'string' || typeof child === 'number'
                return testNode ? createTextNode(child) : child ;
            }),
        },
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
 
// 处理el.props和el.children时， 需要分开处理，使用递归的方式，实现render
function render(el, container){
    wipRoot = {
        dom: container,
        props: {
            children: [el],
        }
    }
    nextWorkOfUnit = wipRoot;
}

// 当前的任务
let wipRoot = null; // 正在工作中的根节点
let nextWorkOfUnit = null; // 下一个工作单元
let currentRoot = null; // 旧节点
function workLoop(deadline){
    let shouldYield  = false;
    while(!shouldYield && nextWorkOfUnit) {
        //执行dom
        nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
        // console.log("nextWorkOfUnit", nextWorkOfUnit);

        shouldYield = deadline.timeRemaining() < 1;
    }
    //只需要执行一次
    if(!nextWorkOfUnit && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop)
}

// wipRoot会清空, currentRoot记录当前的最新的
function commitRoot(){
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber){
    if (!fiber) return;

    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent;
    }

    if (fiber.effectTag ==='update') {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.effectTag === 'placement') {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom)
        }
    }
    
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
 return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps){
    // Object.keys(props).forEach(key => {
    //     if (key !== 'children') {
    //         // 是否是on开头的，取出后面的事件名，并且是小写，然后去绑定到dom上
    //         if(key.startsWith('on')) {
    //             const eventType = key.slice(2).toLowerCase(); 
    //             dom.addEventListener(eventType, props[key]);
    //         } else {
    //             // 给dom创建props
    //             dom[key] = props[key];

    //         }
    //         // 给dom创建props
    //         dom[key] = props[key];
    //     }
    // });

    // {id: "1"} {}
    // 1.old 有 new 没有 删除
    Object.keys(prevProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
                dom.removeAttribute(key);
            }
        }
    })
    // 2.new 有 old 没有 添加
    // 3.new 有 old 也有 更新
    Object.keys(nextProps).forEach(key => {
        if (key !== 'children') {
            if (nextProps[key] !== prevProps[key]) {
                if (key.startsWith('on')) {
                    const eventType = key.slice(2).toLowerCase();

                    dom.removeEventListener(eventType, prevProps[key]);

                    dom.addEventListener(eventType, nextProps[key]);
                } else {
                    dom[key] = nextProps[key];
                }
            }
        }
    })
}

// 这里是判断的是否是函数，
// 如果是函数就是函数组件，函数组件的话，我们是不需要去创建DOM的,并且我们是需要的children类型是数组,所以我们用[]去包裹一下,并且使用我们传入的children
function reconcileChildren(fiber, children) {
//  const children = fiber.props.children;
//  console.log('fiber',fiber);
//  存储旧节点
 let oldFiber = fiber.alternate?.child;
 let prevChild = null;
 children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    let newFiber;
    if (isSameType) {
        // update
        newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null,
            dom: oldFiber.dom,
            effectTag: 'update',
            alternate: oldFiber,
        };
    } else {
        // placement
        newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            parent: fiber,
            sibling: null, 
            dom: null,
            effectTag: 'placement',
        };
    }

    if (oldFiber) {
        oldFiber = oldFiber.sibling;
    }

    if(index === 0) {
        fiber.child = newFiber;
    } else {
        prevChild.sibling  = newFiber;
    }

    prevChild = newFiber;
 })
}

//函数组件
function updateFunctionComponent(fiber) {
    // console.log('updateFunctionComponent',fiber)
    const children = [fiber.type(fiber.props)];

    reconcileChildren(fiber, children);
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
        updateProps(dom, fiber.props, {})
    }

    const children = fiber.props.children;
    reconcileChildren(fiber, children);
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
//    reconcileChildren(fiber, children);

    // 返回下一个要执行的任务
    if(fiber.child) {
        return fiber.child;
    }
    // console.log(fiber)
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

// 在绑定事件之前需要先清空一下
function update() {
    wipRoot = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot,
    }
    nextWorkOfUnit = wipRoot;
}


const React = {
    update,
    render,
    createElement,
}

export default React;
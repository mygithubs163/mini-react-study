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
                // console.log('child',child)
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
let deletions = []; // 需要删除的节点集合
let wipFiber = null; // 正在工作中的fiber
function workLoop(deadline){
    let shouldYield  = false;
    while(!shouldYield && nextWorkOfUnit) {
        //执行dom
        nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
        // console.log("nextWorkOfUnit", nextWorkOfUnit);

        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = undefined
        }

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
    deletions.forEach(commitDeletion);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
    deletions = [];
}
function commitDeletion(fiber){
    if (fiber.dom) {
        let fiberParent = fiber.parent;
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent;
        }
        fiberParent.dom.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child);
    }
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
        // edge case child为ture的时候才去新增节点
        if (child) {
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
        
        // 添加到删除的节点里
        if (oldFiber){
            deletions.push(oldFiber);
        }
    }

    // if(oldFiber){
    //     console.log('oldFiber',oldFiber,newFiber);
    // }

    if (oldFiber) {
        oldFiber = oldFiber.sibling;
    }

    if(index === 0) {
        fiber.child = newFiber;
    } else {
        prevChild.sibling  = newFiber;
    }
    // edge case newFiber是否存在就好了，存在的话，再去赋值prevChild
    if (newFiber) {
        prevChild = newFiber;
    }
 })

    //如果还存在就删除掉
    //可能会存在多个孩子节点，所以需要使用while循环，且更新oldFiber的值
    while(oldFiber) {
        deletions.push(oldFiber);
        oldFiber = oldFiber.sibling;
    }
}

//函数组件
function updateFunctionComponent(fiber) {
    // console.log('updateFunctionComponent',fiber)
    wipFiber = fiber;
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
    // wipRoot = {
    //     dom: currentRoot.dom,
    //     props: currentRoot.props,
    //     alternate: currentRoot,
    // }
    // nextWorkOfUnit = wipRoot;
    let currentFiber = wipFiber;
    // 使用闭包可以让我们在返回的函数中保留对外部函数中变量的引用，
    // 以便在函数执行完毕后仍然能够访问和使用这些变量
    return () => {
        wipRoot = {
            ...currentFiber,
            alternate: currentFiber,
        }

        nextWorkOfUnit = wipRoot;
    }
}


const React = {
    update,
    render,
    createElement,
}

export default React;
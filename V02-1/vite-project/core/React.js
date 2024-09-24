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
        // 比较他们的type是否一致，这样就不会再去触发其他的更新
        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = undefined
        }
        // 表示当前帧剩余的时间，也可理解为留给任务的时间还有多少
        shouldYield = deadline.timeRemaining() < 1;
    }
    //只需要执行一次
    if(!nextWorkOfUnit && wipRoot) {
        commitRoot();
    }

    // 在useEffect的deps为空时，当数据发生改变也需要重新渲染视图
    if (nextWorkOfUnit && !wipRoot) {
        wipRoot = currentRoot;
    }

    requestIdleCallback(workLoop)
}


// wipRoot会清空, currentRoot记录当前的最新的
function commitRoot(){
    // 去统一的处理需要删除的节点
    deletions.forEach(commitDeletion);
    commitWork(wipRoot.child);
    commitEffectHook();
    currentRoot = wipRoot;
    wipRoot = null;
    deletions = [];
}

// 先判断是不是初始化还是update，可以通过之前的alternate字段来判断，
// 有值的话就是update，在更新的时候，我们需要判断deps有没有更新，有更新的话，我们才去执行callback
function commitEffectHook(){
    function run(fiber) {
        if (!fiber) return;
        if (!fiber.alternate) {
            //初始化
            fiber.effectHooks?.forEach(hook => {
                hook.cleanUp = hook?.callback();
            });
        } else {
            // update 需要去检测deps有没有更新
            // const oldEffectHook = fiber.alternate.effectHook;

            // const neeedUpdate= oldEffectHook?.deps.some((oldDep, index) => {
            //     return oldDep !== fiber.effectHook?.deps[index];
            // });

            // if (neeedUpdate) {
            //     fiber.effectHook?.callback();
            // }

            fiber.effectHooks?.forEach((newHook, index) => {
                if (newHook.deps.length > 0) {
                    const oldEffectHook = fiber.alternate.effectHooks[index];

                    const neeedUpdate = oldEffectHook?.deps.some((oldDep, i) => {
                        return oldDep !== newHook.deps[i];
                    })

                    neeedUpdate && (newHook.cleanUp = newHook.callback());
                }              
            });
        }
        // fiber.effectHook?.callback();
        run(fiber.child);
        run(fiber.sibling); 
    }
    function runCleanUp(fiber){
        if (!fiber) return;
        fiber.alternate?.effectHooks?.forEach((hook) => {
            if (hook?.deps?.length > 0) {
                hook?.cleanUp && hook?.cleanUp();
            }
        })
        runCleanUp(fiber.child);
        runCleanUp(fiber.sibling);
    }
    runCleanUp(wipRoot);
    run(wipRoot);
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
    // 在commitWork的时候，并没有添加DOM,原因是因为没有找到真实的DOM
    // 去找到该Fiber节点的父节点，并一直向上遍历直到找到一个有真实DOM节点的父节点。
    // 一旦找到了有真实DOM节点的父节点，就会将当前Fiber节点的DOM节点附加到父节点的DOM节点上。
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent;
    }

    if (fiber.effectTag ==='update' && fiber.dom) {
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
                alternate: oldFiber, //用来存储旧节点
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

    // 每次更新后，需要把值清空
    stateHooks = [];
    stateHooksIndex = 0;

    effectHooks = [];

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

    // 当我们运用两个组件的时候,页面只渲染了一个
    // 是因为在查找兄弟的时候，我们没有找到该组件的兄弟节点，所以返回错误
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


// 首先获取当前的Fiber节点currentFiber，然后尝试获取之前的钩子状态oldHook，
// 如果存在的话。接着创建一个stateHook对象，其中的state属性被初始化为之前的状态或者初始值initial。
// 然后将stateHook对象赋值给currentFiber的stateHook属性。
// 接下来定义了setState函数，它接受一个action作为参数，这个action是一个函数，用于根据当前状态计算新的状态。
// 在setState函数内部，就是之前的update函数了。
// 最后，useState函数返回一个数组，其中第一个元素是状态的当前值，第二个元素是setState函数，用于更新状态。

// 通过设置stateHooks变量去存储stateHook,并且设置stateHookIndex索引来获取老的值，这样就不会影响下次更新了
let stateHooks
let stateHooksIndex
function useState(initial) {
    let currentFiber = wipFiber;
    let oldHook = currentFiber.alternate?.stateHook[stateHooksIndex];

    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : [],
    }
    // 调用action
    // 批量执行 action
    // 加入queue来存储action，并循环去执行action，这样就实现了把多次action的操作，转化成一次去执行。
    // 判断action的类型，如果不是函数，那么我们就包装成一个函数，这样我们就实现了直接输入值的情况。
    stateHook.queue.forEach(action => {
        stateHook.state = action(stateHook.state);
    })
    stateHook.queue = [];

    stateHooksIndex++;
    stateHooks.push(stateHook);
    currentFiber.stateHook = stateHooks;

    // console.log('stateHook.state', stateHook.state)

    function setState(action) {
        // 处理值一样的情况
        const eagerSate = typeof action === 'function' ? action(stateHook.state) : action;
        if (eagerSate === stateHook.state) return;


        // stateHook.state = action(stateHook.state);
        stateHook.queue.push(typeof action === 'function' ? action : () => action);

        wipRoot = {
            ...currentFiber,
            alternate: currentFiber,
        }

        nextWorkOfUnit = wipRoot;
        // console.log('setState', stateHook)
    }
    
    return [stateHook.state, setState];
}

// 定义一个effectHooks去存多个useEffect，然后放到effectHooks这个属性上，
// 初始化的时候，应该是在初始化functionComponent上的，所以我们也加一下；
// 然后就是处理内部了，循环effectHooks去执行里面的callback,这个流程跟useState的处理很类似
let effectHooks
// 调用时机应该在 React 完成对 DOM 的渲染之后
function useEffect(callback, deps) {
    // 首先我们存一个cleanUp属性,然后我们去执行hook的callback的时候，需要把结果放在hook的cleanUp属性上，接下来我们就可以去执行了；
    // 我们先创建一个方法，跟run类似，我们叫做runCleanUp吧，注意我们这里只需要当deps的length大于0的时候才去执行
    const effectHook = {
        callback,
        deps,
        cleanUp: undefined,
    }
    effectHooks.push(effectHook);
    wipFiber.effectHooks = effectHooks;
}


const React = {
    update,
    render,
    createElement,
    useState,
    useEffect,
}

export default React;
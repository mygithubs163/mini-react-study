import React from "./core/React.js"

// count为什么要写在外面
// 执行到updateFunctionComponent 执行 fiber.type(fiber.props) 函数组件会执行一次，返回新的props
// 如果写在函数里面，因为函数作用域，会取到函数内的count，结果是页面不会更新。
let count = 10;
let props = { id: '11111111'}
function Counter() {
    // useState()
    // 没有实现, 调用一下update
    function handleClick() {
        console.log("click");
        count++;
        props = {};
        React.update();
    }
    console.log('props', props)
    return (
        <div {...props}>
            <span>count:{count}</span>
            <button onClick={handleClick}>counter</button>
        </div>
    );
}

function CounterContainer() {
    return (
        <div>
            <Counter num={12} />
            {/* <Counter num={24} /> */}
        </div>
    );
}

function App() {
    return (
        <div>
            mini-react
            {/* <Counter /> */}
            <CounterContainer />
        </div>
    );
}

export default App;
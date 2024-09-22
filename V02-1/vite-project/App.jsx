import React from "./core/React.js"

// count为什么要写在外面
// 执行到updateFunctionComponent 执行 fiber.type(fiber.props) 函数组件会执行一次，返回新的props
// 如果写在函数里面，因为函数作用域，会取到函数内的count，结果是页面不会更新。
// let count = 10;
// let props = { id: '11111111'}
// function Counter() {
//     // useState()
//     // 没有实现, 调用一下update
//     function handleClick() {
//         console.log("click");
//         count++;
//         props = {};
//         React.update();
//     }
//     console.log('props', props)
//     return (
//         <div {...props}>
//             <span>count:{count}</span>
//             <button onClick={handleClick}>counter</button>
//         </div>
//     );
// }

// function CounterContainer() {
//     return (
//         <div>
//             <Counter num={12} />
//             {/* <Counter num={24} /> */}
//         </div>
//     );
// }

// function App() {
//     return (
//         <div>
//             mini-react
//             {/* <Counter /> */}
//             <CounterContainer />
//         </div>
//     );
// }

let showBar = false;
function Counter() {
    // const foo = <div>foo</div>;
    // const bar = <p>bar</p>;
    // function Foo() {
    //     return <div>foo</div>;
    // }

    // function Bar() {
    //     return <p>bar</p>;
    // }

    // const foo = (
    //     <div>
    //         foo 
    //         <div>child</div>
    //     </div>
    // );
    const bar = <div>bar</div>
    function handleShowBar() {
        showBar = !showBar;
        React.update();
    }

    return (
        <div>
            counter
            {showBar && bar}
            {/* <div>{showBar && bar}</div> */}
            <button onClick={handleShowBar}>showBar</button>
        </div>
    );
}

let countFoo1 = 1;
function Foo() {
    console.log('Foo return ');
    const update = React.update()
    function handleClick() {
        countFoo1++;
        update();
    }

    return (
        <div>
            <h1>Foo: {countFoo1}</h1>
            <button onClick={handleClick}>click</button>    
        </div>
    );
}

let countBar2 = 1;
function Bar() {
    console.log('Bar return ');
    const update = React.update()
    function handleClick() {
        countBar2++;
        update();
    }

    return (
        <div>
            <h1>Bar: {countBar2}</h1>
            <button onClick={handleClick}>click</button>    
        </div>
    );
}

let countApp3 = 1;
function App() {
    console.log('App return ');
    const update = React.update()
    function handleClick() {
        countApp3++;
        update();
    }
    return (
        <div>
            {/* mini-react */}
            {/* <Counter></Counter> */}
            <h1>App: {countApp3}</h1>
            <button onClick={handleClick}>click</button>
            <Foo></Foo>
            <Bar></Bar>
        </div>
    );
}

export default App;
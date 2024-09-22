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


// let showBar = false;
// function Counter() {
//     // const foo = <div>foo</div>;
//     // const bar = <p>bar</p>;
//     // function Foo() {
//     //     return <div>foo</div>;
//     // }

//     // function Bar() {
//     //     return <p>bar</p>;
//     // }

//     // const foo = (
//     //     <div>
//     //         foo 
//     //         <div>child</div>
//     //     </div>
//     // );
//     const bar = <div>bar</div>
//     function handleShowBar() {
//         showBar = !showBar;
//         React.update();
//     }

//     return (
//         <div>
//             counter
//             {showBar && bar}
//             {/* <div>{showBar && bar}</div> */}
//             <button onClick={handleShowBar}>showBar</button>
//         </div>
//     );
// }



// let countFoo1 = 1;
// function Foo() {
//     console.log('Foo return ');
//     const update = React.update()
//     function handleClick() {
//         countFoo1++;
//         update();
//     }

//     return (
//         <div>
//             <h1>Foo: {countFoo1}</h1>
//             <button onClick={handleClick}>click</button>    
//         </div>
//     );
// }

// let countBar2 = 1;
// function Bar() {
//     console.log('Bar return ');
//     const update = React.update()
//     function handleClick() {
//         countBar2++;
//         update();
//     }

//     return (
//         <div>
//             <h1>Bar: {countBar2}</h1>
//             <button onClick={handleClick}>click</button>    
//         </div>
//     );
// }

// let countApp3 = 1;
// function App() {
//     console.log('App return ');
//     const update = React.update()
//     function handleClick() {
//         countApp3++;
//         update();
//     }
//     return (
//         <div>
//             {/* mini-react */}
//             {/* <Counter></Counter> */}
//             <h1>App: {countApp3}</h1>
//             <button onClick={handleClick}>click</button>
//             <Foo></Foo>
//             <Bar></Bar>
//         </div>
//     );
// }

// useEffect
// 调用时机是在 React 完成对 DOM 的渲染之后，并且在浏览器完成绘制之前
// cleanUp 函数会在组件卸载的时候执行 在调用useEffect之前进行调用 ，当deps 为空的时候不会调用返回的cleanup
// useEffect(() => {
//     console.log('init');
// }, [])

// useEffect(() => {
//     console.log('count init');
// }, [count])


function Foo() {
    const [count, setCount] = React.useState(10);
    const [bar, setBar] = React.useState('bar');
    function handleClick() {
        // setCount(pre => pre + 2);
        // setBar(pre => pre + 'bar');
        setCount(c => c + 1);
        setBar(pre => 'bar')
    }

    React.useEffect(() => {
        console.log('init');
        return () => {
            console.log('clean up 0');
        }
    }, [])

    React.useEffect(() => {
        console.log('update', count);
        return () => {
            console.log('clean up 1');
        }
    }, [count])

    React.useEffect(() => {
        console.log("update", count)
        return () => {
          console.log("cleanUp 2")
        }
      }, [count])


    return (
        <div>
            <h1>Foo: {count}</h1>
            <div>{bar}</div>
            <button onClick={handleClick}>click</button>
        </div>
    );
}

function App() {
    return (
        <div>
            <h1>App</h1>
            <Foo></Foo>
        </div>
    );
}

export default App;
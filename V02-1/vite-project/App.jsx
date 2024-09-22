import React from "./core/React.js"
function Counter(props) {
    return (
        <div>
            <div>count:{props.num}</div>
        </div>
    );
}

function CounterContainer() {
    return (
        <div>
            <Counter num={12} />
            <Counter num={24} />
        </div>
    );
}

function App() {
    return (
        <div>
            <div>mini-react</div>
            {/* <Counter /> */}
            <CounterContainer />
        </div>
    );
}

export default App;
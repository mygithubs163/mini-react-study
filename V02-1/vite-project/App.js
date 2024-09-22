// import React from './core/React.js'

// const App = React.createElement('div',{id:'app'},'hi-mini-react');
// // const App = <div id="app">hi-mini-react</div>
// // console.log(App)
// export default App;


import React from './core/React.js'
import ReactDOM from './core/ReactDom.js'
import App from './src/App.jsx'


ReactDOM.createRoot(document.querySelector('#root')).render(App)

export default App;
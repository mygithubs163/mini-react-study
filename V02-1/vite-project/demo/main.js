// V1
// const dom = document.createElement("div");
// dom.id = 'app';
// document.querySelector("root").appendChild(dom);
// const textNode = document.createTextNode("");
// textNode.nodeValue = 'app';
// dom.appendChild(textNode);


// V2
// const textEl = {
//     type:"TEXT_ELEMENT",
//     props: {
//         nodeValue:'app',
//         children:[]
//     }
// }
// const el = {
//     type:'div',
//     props:{
//         id:'app',
//         children:[textEl]
//     }
// }
// const dom = document.createElement(el.type);
// dom.id = el.props.id;
// document.querySelector('#root').append(dom);
// const textNode = document.createTextNode('');
// textNode.nodeValue = textEl.props.nodeValue;
// dom.appendChild(textNode);

// V3
function createElement(type,props,...children){
    // 需要对children进行处理,如果内容为文本元素，需要使用createTextNode方法
    return {
        type,
        props:{
            ...props,
            children:children.map(child =>
                typeof child === 'object'
                ? child
                : createTextNode(child)
            )
        }
    }
}
function createTextNode(text, ...children){
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue:text,
            children,
        }
    }
}

// const textEl = createTextElement('app');
// const App = createElement('div',{id:'app'},textEl);

// const dom = document.createElement(App.type);
// dom.id = App.props.id;
// document.querySelector('#root').append(dom);

// const textNode = document.createTextNode('');
// textNode.nodeValue = textEl.props.nodeValue;
// dom.appendChild(textNode);


// 处理el.props和el.children时， 需要分开处理，使用递归的方式，实现render
function render(el,container){
    const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(el.type);

    //设置id和class
    Object.keys(el.props).forEach(key=>{
        if(key !== 'children') {
            //给DOM创建props
            dom[key] = el.props[key];
        }
    })

    const children = el.props.children || [];
    children.forEach(child => render(child,dom));
    container.append(dom)
}

const textE1 = createTextNode('app');
// const App = createElement('div',{id:'app'},textE1);
const App = createElement('div',{id:'app'},'hi-', 'mini-react');
// render(App,document.querySelector('#root'));


console.log(App)

const ReactDOM = {
    creatRoot(container) {
        return {
            render(el) {
                render(el,container)
            }
        }
    }
}

ReactDOM.creatRoot(document.querySelector('#root')).render(App);


console.log(ReactDOM)
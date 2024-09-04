// V1
// const dom = document.createElement("div");
// dom.id = 'app';
// document.querySelector("root").appendChild(dom);
// const textNode = document.createTextNode("");
// textNode.nodeValue = 'app';
// dom.appendChild(textNode);


// V2
// const textEl = {
//     type:"Text_ELEMENT",
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
                : createTextElement(child)
            )
        }
    }
}
function createTextElement(text){
    return {
        type:'TEXT_ELEMENT',
        props:{
            nodeValue:text,
            children:[]
        }
    }
}

const textEl = createTextElement('app');
const App = createElement('div',{id:'app'},textEl);

const dom = document.createElement(App.type);
dom.id = App.props.id;
document.querySelector('#root').append(dom);

const textNode = document.createTextNode('');
textNode.nodeValue = textEl.props.nodeValue;
dom.appendChild(textNode);


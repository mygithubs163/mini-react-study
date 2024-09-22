function createElement(type,props,...children){
    // 需要对children进行处理,如果内容为文本元素，需要使用createTextNode方法
    return {
        type,
        props:{
            ...props,
            children:children.map(child =>{
                return typeof child === 'string' ? createTextNode(child) : child ;
            })
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

    const children = el.props.children;
    children.forEach(child => {
        render(child,dom)
    });
    container.append(dom)
}

const React = {
    render,
    createElement,
}

export default React;
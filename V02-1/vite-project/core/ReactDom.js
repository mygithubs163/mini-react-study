import React from "./React.js"

const ReactDOM = {
    creatRoot(container) {
        return {
            render(el) {
                React.render(el, container)
            }
        }
    }
}

export default ReactDOM;
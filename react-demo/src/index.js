import React from 'react';
import ReactDOM from 'dom'

const jsx = (<div><span>hello kreact</span></div>)
let root = document.querySelector('#root')
ReactDOM.createRoot(root).render(jsx)


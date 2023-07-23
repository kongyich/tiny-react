import React from 'react';
import ReactDOM from 'dom'

const jsx = (<div><span>hello kreact</span></div>)
console.log('ooooo')
console.log(ReactDOM)
// console.log(ReactDOM)
let root = document.querySelector('#root')
ReactDOM.createRoot(root).render(jsx)


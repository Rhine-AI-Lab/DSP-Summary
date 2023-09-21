import React from 'react'
import Style from './App.module.scss'
import {Route, Routes} from "react-router-dom";
import Home from "./Home/Home";
import Show from "./Show/Show";

function App() {
  return (
    <div className={Style.App}>
      <Routes>
        <Route path="/" element={<Show/>} />
        <Route path="/home" element={<Show/>} />
      </Routes>
    </div>
  )
}

export default App;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // eslint-disable-next-line
    interface IntrinsicElements {
      [tag: string]: any
    }
  }
}

import React from 'react'
import { Routes, Route } from "react-router-dom";
import App from './App';
import Admin from './Admin';


const All = () => {
  return (
    <div>
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/admin' element={<Admin />} />
        </Routes>
    </div>
  )
}

export default All
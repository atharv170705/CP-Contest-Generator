import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Dashboard from './pages/Dashboard.jsx'
import ContestPage from './pages/ContestPage.jsx'
import Home from './pages/Home.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Setup from './pages/Setup.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Home/>} />
      <Route path='/setup' element={<Setup/>} />
      <Route path='/dashboard' element={<Dashboard/>} />
      <Route path='/contest/:contestId' element={<ContestPage/>} />
    </>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />   
  </StrictMode>,
)

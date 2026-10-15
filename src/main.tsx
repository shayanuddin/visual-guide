import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Stage from './Stage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Stage>
      <App />
    </Stage>
  </React.StrictMode>,
)

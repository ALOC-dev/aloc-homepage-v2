import { Route, Routes } from 'react-router-dom'
import { DOCK_ITEMS } from './dockItems'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'
import Projects from './pages/Projects'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/projects' element={<Projects />} />
      {DOCK_ITEMS.filter((item) => item.id !== 'projects').map((item) => (
        <Route
          key={item.id}
          path={item.to}
          element={<ComingSoon item={item} />}
        />
      ))}
    </Routes>
  )
}

export default App

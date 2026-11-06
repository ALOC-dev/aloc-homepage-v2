import { Route, Routes } from 'react-router-dom'
import { DOCK_ITEMS } from './dockItems'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      {DOCK_ITEMS.map((item) => (
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

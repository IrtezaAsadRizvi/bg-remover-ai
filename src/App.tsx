import Contents from './components/Contents'
import Tool from './components/Tool'
import TopBar from './components/TopBar'

function App() {
  return (
    <div className="min-h-screen relative">
      <TopBar />
      <Tool />
      <Contents />
    </div>
  )
}

export default App

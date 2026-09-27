import Scene from './components/Scene/Scene'
import Hero from './components/Hero Section/Hero'
import About from './components/About Section/About'

function App() {
  return (
    <>
      <Scene />
      <main className="relative z-10 min-h-screen">
        <Hero />
        <About />
      </main>
    </>
  )
}

export default App

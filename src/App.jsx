import Scene from './components/Scene/Scene'
import Hero from './components/Hero Section/Hero'
import About from './components/About Section/About'
import Skills from './components/Skills Section/Skills.jsx'
import Experience from './components/Experience Section/Experience.jsx'

function App() {
  return (
    <>
      <Scene />
      {/* pointer-events-none lets hovers and drags reach the 3D scene behind the page;
          interactive elements (e.g. the social links) opt back in with pointer-events-auto */}
      <main className="pointer-events-none relative z-10 min-h-screen">
        <Hero />
        <About />
        <Skills />
        <Experience />
      </main>
    </>
  )
}

export default App

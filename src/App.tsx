import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useStore } from './lib/store.ts'
import { ensureContent } from './lib/course.ts'
import { initNativeChrome } from './lib/platform.ts'
import { Layout } from './components/Layout.tsx'
import { Onboarding } from './components/Onboarding.tsx'
import { AuthProvider } from './components/AuthProvider.tsx'
import HomePage from './pages/Home.tsx'

const Roadmap = lazy(() => import('./pages/Roadmap.tsx'))
const WeekPage = lazy(() => import('./pages/Week.tsx'))
const ConceptPage = lazy(() => import('./pages/Concept.tsx'))
const Plan = lazy(() => import('./pages/Plan.tsx'))
const Gallery = lazy(() => import('./pages/Gallery.tsx'))
const Review = lazy(() => import('./pages/Review.tsx'))
const Glossary = lazy(() => import('./pages/Glossary.tsx'))
const ImportPage = lazy(() => import('./pages/Import.tsx'))
const SettingsPage = lazy(() => import('./pages/Settings.tsx'))

function useHydrated() {
  const [h, setH] = useState(useStore.persist.hasHydrated())
  useEffect(() => {
    const un = useStore.persist.onFinishHydration(() => setH(true))
    setH(useStore.persist.hasHydrated())
    return un
  }, [])
  return h
}

function Splash() {
  return (
    <div className="min-h-dvh grid place-items-center">
      <img src="icon.svg" alt="" className="w-16 h-16 rounded-2xl float" />
    </div>
  )
}

export default function App() {
  const hydrated = useHydrated()
  const [content, setContent] = useState(false)
  const theme = useStore((s) => s.settings.theme)
  const motion = useStore((s) => s.settings.motion)
  const onboarded = useStore((s) => s.onboarded)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.motion = motion
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07070d' : '#f5f5fb')
  }, [theme, motion])
  useEffect(() => {
    void initNativeChrome()
    void ensureContent().then(() => setContent(true))
  }, [])

  if (!hydrated || !content) return <Splash />
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<Splash />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="week/:id" element={<WeekPage />} />
              <Route path="concept/:id" element={<ConceptPage />} />
              <Route path="plan" element={<Plan />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="review" element={<Review />} />
              <Route path="glossary" element={<Glossary />} />
              <Route path="import" element={<ImportPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </Suspense>
        {!onboarded && <Onboarding />}
      </HashRouter>
    </AuthProvider>
  )
}

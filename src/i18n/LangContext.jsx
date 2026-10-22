import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { content } from './content.js'

const LangContext = createContext(null)

function readInitialLang() {
  try {
    const saved = localStorage.getItem('lang')
    return saved === 'en' ? 'en' : 'id'
  } catch {
    return 'id'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* storage tidak tersedia — abaikan */
    }
  }, [lang])

  const value = useMemo(() => {
    const toggle = () => setLang((l) => (l === 'id' ? 'en' : 'id'))
    return { lang, toggle, t: content[lang] }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang harus dipakai di dalam <LangProvider>')
  return ctx
}

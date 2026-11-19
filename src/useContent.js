import { useEffect, useState } from 'react'
import { backup } from './data.js'
import { loadSection } from './content.js'
import { refreshMs, sources } from './config.js'

export function useContent() {
  const [content, setContent] = useState(() => Object.fromEntries(Object.entries(backup).map(([key, rows]) => [key, { rows, source: sources[key] ? 'backup' : 'demo', stale: Boolean(sources[key]), updatedAt: null }])))
  useEffect(() => {
    let active = true, pending = false, attempted = 0
    const update = async () => {
      if (document.visibilityState !== 'visible' || pending || (attempted && Date.now() - attempted < refreshMs)) return
      attempted = Date.now(); pending = true
      await Promise.all(Object.keys(backup).map(async section => {
        const value = await loadSection(section)
        if (active) setContent(current => ({ ...current, [section]: value.source === 'backup' && current[section].source !== 'backup' && current[section].source !== 'demo' ? { ...current[section], stale: true } : value }))
      }))
      pending = false
    }
    void update()
    const timer = setInterval(update, 60000)
    document.addEventListener('visibilitychange', update)
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', update) }
  }, [])
  return content
}

import { useLang } from '../i18n/LangContext.jsx'

/** Seksi gelap "Tentang" — statement serif besar + tiga kolom. */
export default function About() {
  const { t } = useLang()
  return (
    <div className="dark" id="about">
      <div>
        <small style={{ color: 'var(--lime)' }}>{t.about.label}</small>
        <h3 className="serif" style={{ marginTop: 20 }}>
          {t.about.statement.map((seg, i) => {
            if (seg.em) return <em key={i}>{seg.t}</em>
            if (seg.c) return (
              <span key={i} className={seg.c}>
                {seg.t}
              </span>
            )
            return <span key={i}>{seg.t}</span>
          })}
        </h3>
        <div className="cols">
          {t.about.cols.map((col) => (
            <div key={col.label}>
              <small>{col.label}</small>
              <p>{col.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

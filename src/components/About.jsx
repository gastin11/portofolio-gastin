import { useLang } from '../i18n/LangContext.jsx'

/** Seksi gelap "Tentang" — statement serif besar + tiga kolom. */
export default function About() {
  const { t } = useLang()
  return (
    <div className="bg-dark text-[#f6f1e7]" id="about">
      <div className="mx-auto max-w-[1300px] px-7 py-[90px] max-md:px-5 max-md:py-16">
        <small className="text-lime">{t.about.label}</small>
        <h3 className="serif mt-5 max-w-[1000px] text-[clamp(34px,6vw,84px)] leading-[1.02] [&_em]:text-lime max-md:text-[clamp(26px,7.4vw,44px)]">
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
        <div className="mt-[70px] grid grid-cols-3 gap-10 border-t border-[#333] pt-[30px] max-md:grid-cols-1">
          {t.about.cols.map((col) => (
            <div key={col.label}>
              <small className="mb-2 block text-lime">{col.label}</small>
              <p className="text-[#bdbab2]">{col.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

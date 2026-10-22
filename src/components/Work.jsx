import { useLang } from '../i18n/LangContext.jsx'

/** Grid "Recent works" — 4 kartu warna solid dengan placeholder preview. */
export default function Work() {
  const { t } = useLang()
  return (
    <section id="work">
      <small>{t.work.label}</small>
      <h2 className="disp">
        {t.work.heading}{' '}
        <span className="serif" style={{ textTransform: 'none', color: 'var(--pri)' }}>
          {t.work.headingAccent}
        </span>
      </h2>
      <div className="grid">
        {t.work.projects.map((p) => (
          <a className={`pc ${p.cls}`} href={p.href} key={p.cls}>
            <span className="no">{p.no}</span>
            <small>
              {p.tags.map((tag) => (
                <i key={tag}>{tag}</i>
              ))}
            </small>
            <div className="shot">
              <span className="ph">Preview 16:10</span>
              {/* Ganti placeholder dengan:
                  <img src="images/p1.jpg" alt="..." /> */}
            </div>
            <div className="disp">
              {p.title.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < p.title.length - 1 && <br />}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

import { useLang } from '../i18n/LangContext.jsx'

/** Empat kolom layanan bernomor; hover berlatar kobalt. */
export default function Services() {
  const { t } = useLang()
  return (
    <section id="services">
      <small>{t.services.label}</small>
      <h2 className="disp">{t.services.heading}</h2>
      <div className="svc">
        {t.services.items.map((item) => (
          <div key={item.num}>
            {item.num}
            <b>{item.title}</b>
            {item.desc}
          </div>
        ))}
      </div>
    </section>
  )
}

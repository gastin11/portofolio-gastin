import { useLang } from '../i18n/LangContext.jsx'

/** Blok CTA kontak — panel kobal dengan tombol email lime. */
export default function ContactCTA() {
  const { t } = useLang()
  return (
    <div className="cta-box" id="contact">
      <small>{t.contact.label}</small>
      <h2 className="disp">
        {t.contact.heading} <em>{t.contact.headingAccent}</em>
        <br />
        {t.contact.headingEnd}
      </h2>
      <a className="mail" href={t.contact.mailto}>
        {t.contact.email}
      </a>
    </div>
  )
}

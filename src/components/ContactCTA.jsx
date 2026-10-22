import { useLang } from '../i18n/LangContext.jsx'

/**
 * Blok CTA kontak — panel kobalt dengan tombol email lime.
 * Class `cta-box` dipertahankan sebagai hook untuk tipografi bersarang
 * (`h2`/`em`) yang tetap di index.css.
 */
export default function ContactCTA() {
  const { t } = useLang()
  return (
    <div
      className="cta-box mx-auto mt-2.5 w-[calc(100%-56px)] max-w-[1244px] rounded-box bg-pri px-8 pt-20 pb-[84px] text-center text-white max-md:w-[calc(100%-24px)] max-md:rounded-[36px] max-md:px-5 max-md:pt-14 max-md:pb-[60px]"
      id="contact"
    >
      <small className="mb-[26px] block tracking-[0.08em]">{t.contact.label}</small>
      <h2 className="disp">
        {t.contact.heading} <em>{t.contact.headingAccent}</em>
        <br />
        {t.contact.headingEnd}
      </h2>
      <a
        className="mt-[38px] inline-block rounded-pill bg-lime px-7 py-3.5 font-bold text-[#101010] no-underline"
        href={t.contact.mailto}
      >
        {t.contact.email}
      </a>
    </div>
  )
}

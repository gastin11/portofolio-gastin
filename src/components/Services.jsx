import { useLang } from '../i18n/LangContext.jsx'

/** Empat kolom layanan bernomor; hover berlatar kobalt. */
export default function Services() {
  const { t } = useLang()
  return (
    <section
      id="services"
      className="mx-auto max-w-[1300px] px-7 pt-[90px] pb-[70px] max-md:px-5 max-md:pt-16 max-md:pb-12"
    >
      <small>{t.services.label}</small>
      <h2 className="disp">{t.services.heading}</h2>
      <div
        className="mt-10 grid grid-cols-4 border-t-[1.5px] border-ink
          [&>div]:border-r-[1.5px] [&>div]:border-ink [&>div]:px-[18px] [&>div]:pt-6 [&>div]:pb-[60px]
          [&>div]:transition-all [&>div]:duration-[250ms]
          [&>div:hover]:bg-pri [&>div:hover]:text-white
          [&>div:last-child]:border-0
          max-md:grid-cols-2
          max-md:[&>div]:border-b-[1.5px] max-md:[&>div]:border-ink
          max-md:[&>div]:px-3.5 max-md:[&>div]:pt-5 max-md:[&>div]:pb-10
          max-md:[&>div:nth-child(even)]:border-r-0"
      >
        {t.services.items.map((item) => (
          <div key={item.num}>
            {item.num}
            <b className="font-disp mt-[34px] mb-3 block text-[26px] leading-none font-normal uppercase max-md:mt-6 max-md:mb-2.5 max-md:text-[22px]">
              {item.title}
            </b>
            {item.desc}
          </div>
        ))}
      </div>
    </section>
  )
}

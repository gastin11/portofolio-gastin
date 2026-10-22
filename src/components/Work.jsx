import { useLang } from '../i18n/LangContext.jsx'

/**
 * Grid "Recent works" — 4 kartu warna solid dengan placeholder preview.
 * Perilaku hover kartu (naik + tilt) tetap di index.css (`.pc:hover`);
 * sisanya utility Tailwind di sini.
 */
const CARD = {
  p1: {
    span: 'md:col-span-7',
    tone: 'bg-pri text-white',
    shot: 'border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.14)]',
    tag: 'border-white',
  },
  p2: {
    span: 'md:col-span-5',
    tone: 'bg-lime text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    tag: 'border-[#101010]',
  },
  p3: {
    span: 'md:col-span-5',
    tone: 'bg-lilac text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    tag: 'border-[#101010]',
  },
  p4: {
    span: 'md:col-span-7',
    tone: 'bg-peach text-[#101010]',
    shot: 'border-[rgba(16,16,16,0.35)] bg-[rgba(255,255,255,0.3)]',
    tag: 'border-[#101010]',
  },
}

export default function Work() {
  const { t } = useLang()
  return (
    <section
      id="work"
      className="mx-auto max-w-[1300px] px-7 pt-[90px] pb-[70px] max-md:px-5 max-md:pt-16 max-md:pb-12"
    >
      <small>{t.work.label}</small>
      <h2 className="disp">
        {t.work.heading}{' '}
        <span className="serif text-pri normal-case">{t.work.headingAccent}</span>
      </h2>
      <div className="mt-10 grid grid-cols-12 gap-[18px]">
        {t.work.projects.map((p) => {
          const card = CARD[p.cls]
          return (
            <a
              className={`pc ${p.cls} group relative col-span-12 flex min-h-[430px] flex-col justify-between overflow-hidden rounded-pc p-7 no-underline transition-all duration-300 max-md:min-h-[380px] max-md:rounded-[32px] max-md:p-[22px] ${card.span} ${card.tone}`}
              href={p.href}
              key={p.cls}
            >
              <span className="absolute right-6 top-[18px] text-[12px]">{p.no}</span>
              <small className="flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <i
                    className={`rounded-pill border-[1.5px] px-[10px] py-px text-[11px] not-italic ${card.tag}`}
                    key={tag}
                  >
                    {tag}
                  </i>
                ))}
              </small>
              <div
                className={`shot relative my-[18px] grid min-h-[190px] flex-1 place-items-center overflow-hidden rounded-shot border-[1.5px] border-dashed max-md:min-h-[160px] max-md:rounded-[22px] ${card.shot}`}
              >
                <span className="text-[11px] uppercase tracking-[0.14em] opacity-[0.65]">
                  Preview 16:10
                </span>
                {/* Ganti placeholder dengan:
                    <img src="images/p1.jpg" alt="..." /> */}
              </div>
              <div className="disp text-[clamp(30px,4vw,54px)] max-md:text-[clamp(28px,8vw,40px)]">
                {p.title.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < p.title.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

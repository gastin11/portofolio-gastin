import { useLang } from '../i18n/LangContext.jsx'

/**
 * Seksi gelap "Tentang":
 * - Bagian atas: label [ TENTANG ], diikuti foto lingkaran yang diapit
 *   tanda kutip di kiri & kanan, lalu kalimat ringkas rata kanan-kiri (justify).
 * - Bagian bawah: daftar metrik angka bergaya baris matriks.
 * - Berperan sebagai penutup atas (seperti .reveal-main terhadap ThankYou) dengan
 *   sudut bawah membulat yang menyingkap seksi Project (#work) di bawahnya.
 */
export default function About() {
  const { t } = useLang()

  return (
    <div
      className="relative z-[4] rounded-b-[48px] border-b border-[#26262e] bg-dark text-[#f6f1e7] shadow-[0_24px_60px_rgba(0,0,0,0.22)] max-md:rounded-b-[32px]"
      id="about"
    >
      <div className="mx-auto max-w-[1300px] px-7 py-[90px] max-md:px-5 max-md:pt-10 max-md:pb-14">
        <div className="flex flex-col items-center">
          <small className="mb-5 text-center tracking-[0.08em] text-lime max-md:mb-4">
            {t.about.label}
          </small>

          <div className="flex items-center justify-center gap-6 max-md:gap-4">
            <span
              className="serif select-none text-[clamp(64px,7vw,96px)] leading-none text-lime"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <div
              id="about-photo-slot"
              className="aspect-square w-[104px] shrink-0 rounded-full max-md:w-[78px]"
              aria-hidden="true"
            />
            <span
              className="serif select-none text-[clamp(64px,7vw,96px)] leading-none text-lime"
              aria-hidden="true"
            >
              &rdquo;
            </span>
          </div>

          <h3 className="serif mt-7 w-full text-justify text-[clamp(26px,3.2vw,44px)] leading-[1.24] [&_em]:text-lime max-md:mt-5 max-md:text-[clamp(20px,5.6vw,28px)] max-md:leading-[1.3]">
            {t.about.statement.map((seg, i) => {
              if (seg.em) return <em key={i}>{seg.t}</em>
              if (seg.c === 'g') {
                return (
                  <span key={i} className="text-[#9a9a94]">
                    {seg.t}
                  </span>
                )
              }
              return <span key={i}>{seg.t}</span>
            })}
          </h3>
        </div>

        <div className="mt-16 border-t border-[#26262e] max-md:mt-10">
          {t.about.metrics.map((m) => (
            <div
              key={m.value}
              className="group grid grid-cols-12 items-center border-b border-[#26262e] py-5 transition-colors duration-200 hover:border-[#3e3e4a] max-md:py-4"
            >
              <div className="disp col-span-5 flex items-baseline gap-2.5 text-[clamp(42px,5.8vw,76px)] leading-[0.9] text-[#f6f1e7] transition-colors duration-200 group-hover:text-lime max-md:gap-1.5">
                <span>{m.value}</span>
                {m.unit && (
                  <span className="-translate-y-[0.34em] text-[clamp(16px,2vw,26px)] tracking-[0.04em]">
                    {m.unit}
                  </span>
                )}
              </div>
              <div className="disp col-span-7 text-[clamp(14px,1.5vw,21px)] leading-[1.12] tracking-[0.02em] text-[#f6f1e7]">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

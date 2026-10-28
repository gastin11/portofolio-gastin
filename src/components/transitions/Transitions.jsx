import { useLang } from '../../i18n/LangContext.jsx'
import CardsToDots from './CardsToDots.jsx'
import LineToTable from './LineToTable.jsx'

/** Overlay transisi yang butuh membaca DOM seksi lain; dibangun ulang saat bahasa berganti. */
export default function Transitions() {
  const { t } = useLang()
  return (
    <>
      <CardsToDots deps={t} />
      <LineToTable deps={t} />
    </>
  )
}

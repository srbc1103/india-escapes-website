import Footer, { NeedHelp } from "../../components/website/Footer";
import DealPopup from "../../components/DealPopup";

export default function layout({children}) {
  return (
    <div>
        {children}
        <Footer/>
        <DealPopup/>
        <NeedHelp/>
    </div>
  )
}

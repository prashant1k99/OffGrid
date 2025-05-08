import { Trash2 } from "lucide-react";
import ItemOption from "./ItemOptions";

const TrashPopup = () => {
  return (
    <>
      <ItemOption
        label="Trash"
        icon={Trash2}
        onClick={() => console.log("Do trash")}
      />
    </>
  )
}

export default TrashPopup;

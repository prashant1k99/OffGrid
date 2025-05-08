import { Trash } from "lucide-react";
import ItemOption from "./ItemOptions";

const TrashPopup = () => {
  return (
    <>
      <ItemOption
        label="Trash"
        icon={Trash}
        onClick={() => console.log("Do trash")}
      />
    </>
  )
}

export default TrashPopup;

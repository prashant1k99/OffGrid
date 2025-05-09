import { LoaderIcon, PlusCircleIcon } from "lucide-react";

import TypewriterSvg from "@/components/svg/TypewriterSvg";
import UnderlineSvg from "@/components/svg/UnderlineSvg";
import { Button } from "@/components/ui/button";
import { createDocument } from "@/utils/createDocument";
import { useState } from "react";
import { useNavigate } from "react-router";
import { PopulatedDocument } from "@/utils/readDocuments";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const createDoc = () => {
    setIsLoading(true)

    createDocument().then((docValue: unknown) => {
      const doc = docValue as PopulatedDocument;
      navigate(`/documents/${doc.id}`)
    }).finally(() => {
      setIsLoading(false)
    })
  }


  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      <div className="w-[250px] h-[250px]">
        <TypewriterSvg className="w-full h-full text-black dark:text-white" />
      </div>
      <div>
        <h2 className="font-bold text-xl leading-tight">
          Welcome to OffGrid
        </h2>
        <sub>With full privacy and all features</sub>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Button disabled={isLoading} onClick={createDoc} className="cursor-pointer">
          {isLoading ? (
            <LoaderIcon className="animate-spin" />
          ) : (
            <PlusCircleIcon />
          )}
          Create a Note
        </Button>
        <div className="w-[60px] h-6 ">
          <UnderlineSvg className="w-full h-full text-black dark:text-white" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;

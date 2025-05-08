import { invoke } from '@tauri-apps/api/core';
import { PlusCircleIcon } from "lucide-react";

import TypewriterSvg from "@/components/svg/TypewriterSvg";
import UnderlineSvg from "@/components/svg/UnderlineSvg";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { loadDocs } from '@/state/docs';

const Dashboard = () => {
  const createDocument = () => {
    const promise = invoke("create_document", { payload: JSON.stringify({}) })
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: (data) => {
        console.log(data)
        return "New note created";
      },
      error: 'Failed to create a new note'
    })
    loadDocs()
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
        <Button onClick={createDocument} className="cursor-pointer">
          <PlusCircleIcon />
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

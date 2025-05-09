import { useParams } from "react-router";

const ArchivedDocument = () => {
  const params = useParams();
  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      Archived Document
      <br />
      {params.docId}
    </div>
  )
}

export default ArchivedDocument;

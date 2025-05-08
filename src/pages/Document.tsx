import { useParams } from "react-router";

const Document = () => {
  const params = useParams();
  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
      Hello World
      <br />
      {params.parentPath} | {params.docId}
    </div>
  )
}

export default Document;

import OffGridSvg from "./OffGridSvg"

const Logo = () => {
  return (
    <div className="w-[120px] flex flex-col justify-center items-center pl-2">
      <OffGridSvg />
      <div className="w-8">
        <svg viewBox="0 0 57.99493 13.20259">
          <path d="M2.41494,5H55.57998c3.21726,0,3.22259-5,0-5H2.41494C-.80232,0-.80765,5,2.41494,5h0Z" fill="currentColor" />
          <path d="M9.06057,13.20259H48.93435c3.21726,0,3.22259-5,0-5H9.06057c-3.21726,0-3.22259,5,0,5h0Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

export default Logo

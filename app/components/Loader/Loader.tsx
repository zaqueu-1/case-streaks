import Image from "next/image"

interface LoaderProps {
  className?: string
}

export default function Loader({ className = "" }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className='text-center'>
        <Image
          src='https://app.thenewscc.com.br/logo.png'
          alt='The News Logo'
          width={250}
          height={250}
          className='animate-pulse mx-auto'
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        />
      </div>
    </div>
  )
}

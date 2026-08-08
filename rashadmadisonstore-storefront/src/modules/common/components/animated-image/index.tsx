"use client"

import { ImgHTMLAttributes, useEffect, useRef, useState } from "react"

type AnimatedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  wrapperClassName?: string
  skeletonClassName?: string
}

const AnimatedImage = ({
  wrapperClassName = "",
  skeletonClassName = "",
  className = "",
  onLoad,
  onError,
  alt = "",
  ...props
}: AnimatedImageProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [props.src])

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!isLoaded ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 image-gradient-placeholder ${skeletonClassName}`}
        />
      ) : null}

      <img
        {...props}
        ref={imgRef}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`.trim()}
        onLoad={(event) => {
          setIsLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setIsLoaded(true)
          onError?.(event)
        }}
      />
    </div>
  )
}

export default AnimatedImage

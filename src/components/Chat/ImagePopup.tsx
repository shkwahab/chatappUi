import React from 'react'

interface ImageProps {
    img: string,
    alt: string
}
const ImagePopup: React.FC<ImageProps> = ({ img, alt }) => {
    return (
        <React.Fragment>
            <div className="md:max-w-[400px]  max-w-[250px] max-h-[250px] flex justify-center   md:max-h-[400px]">
                <img src={img} alt={alt} className=' rounded-md' />
            </div>
        </React.Fragment>
    )
}

export default ImagePopup
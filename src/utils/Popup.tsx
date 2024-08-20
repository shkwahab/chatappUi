import React, { useRef, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";

interface PopupProps {
    title?: string
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, children }) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click is outside of the popup content
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Attach event listener when the popup is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up event listener on component unmount or when `isOpen` changes
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed z-[99999] -inset-10 md:-inset-2  flex items-center justify-center bg-black bg-opacity-50">
            <div ref={popupRef} className="bg-white   rounded-lg shadow-lg relative">
                <div className={`p-4 text-white bg-primary flex rounded-t-lg items-center justify-between ${title ? "block" : "hidden"}`}>
                    <div className=' font-medium text-white'>
                        {title}
                    </div>
                    <button
                        onClick={onClose}
                        className=" text-white"
                    >
                        <IoMdClose className='text-2xl' />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Popup;

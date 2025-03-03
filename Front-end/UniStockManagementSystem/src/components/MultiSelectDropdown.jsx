import React, { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaCheck, FaChevronDown } from "react-icons/fa";

const MultiSelectDropdown = ({ options, selectedOptions, setSelectedOptions, setLabelString }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        if (selectedOptions.includes(option.value)) {
            setSelectedOptions(selectedOptions.filter((id) => id !== option.value));
        } else {
            setSelectedOptions([...selectedOptions, option.value]);
        }
    };

    const removeSelected = (value) => {
        setSelectedOptions(selectedOptions.filter((id) => id !== value));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className={`relative text-sm rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center cursor-pointer ${isOpen ? 'border-2 border-black' : 'border border-gray-400'}`}
                onClick={toggleDropdown}
            >
                <div className="flex flex-wrap gap-2 items-center">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((selectedId) => {
                            const selectedOption = options.find((opt) => opt.value === selectedId);
                            return selectedOption ? (
                                <span key={selectedId} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                                    {selectedOption.label}
                                    <IoMdClose
                                        className="ml-2 cursor-pointer"
                                        size={14}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSelected(selectedId);
                                        }}
                                    />
                                </span>
                            ) : null;
                        })
                    ) : (
                        <span className="text-gray-400"> {setLabelString} </span>
                    )}
                </div>
                <FaChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
            </div>

            {isOpen && (
                <div className="absolute text-sm left-0 w-full mt-2 bg-white rounded-lg shadow-lg z-50">
                    <div className="max-h-48 overflow-y-auto">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSelect(option)}
                            >
                                <span className={selectedOptions.includes(option.value) ? "font-bold" : ""}>{option.label}</span>
                                {selectedOptions.includes(option.value) && <FaCheck size={14} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;

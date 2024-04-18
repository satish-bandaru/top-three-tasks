import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFont } from '@fortawesome/free-solid-svg-icons';
import { FontOption } from '../constants';

interface FontCustomizationProps {
    currentFont: FontOption;
    onFontChange: (font: FontOption) => void;
}

const FontCustomization: React.FC<FontCustomizationProps> = ({ currentFont, onFontChange }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedFont, setSelectedFont] = useState<FontOption>(currentFont);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setSelectedFont(currentFont);
    }, [currentFont]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setShowMenu(prevShowMenu => !prevShowMenu);
    };

    const handleFontChange = (font: FontOption) => {
        setSelectedFont(font);
        onFontChange(font);
    };

    return (
        <div className="icon-button-container">
            <button ref={buttonRef} onClick={toggleMenu} className="icon-button">
                <FontAwesomeIcon icon={faFont} className="customization-icon" />
            </button>
            {showMenu && (
                <div className="menu" ref={menuRef}>
                    <div className="menu-title">Fonts</div>
                    {Object.values(FontOption).map((font) => (
                        <label key={font} className="font-option" style={{ fontFamily: font }}>
                            <input
                                type="radio"
                                name="font-selection"
                                value={font}
                                checked={selectedFont === font}
                                onChange={() => handleFontChange(font)}
                            />
                            {font}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FontCustomization;
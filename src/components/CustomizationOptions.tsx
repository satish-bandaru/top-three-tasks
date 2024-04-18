import React, { useState } from 'react';
import FontCustomization from './FontCustomization';
import { FontOption } from '../constants';

interface CustomizationOptionsProps {
    currentFont: FontOption;
    onFontChange: (font: FontOption) => void;
}

const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({ currentFont, onFontChange }) => {
    return (
        <div className="customization-options">
            <FontCustomization currentFont={currentFont} onFontChange={onFontChange} />
        </div>
    );
};

export default CustomizationOptions;
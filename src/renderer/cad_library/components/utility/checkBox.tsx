import React, { FC, useEffect, useState } from 'react';
import './Checkbox.css';

export interface CheckboxProps {
  label: string;
  onChange?: (checked: boolean) => void;
  customCheckedCondition?: boolean;
}

export const Checkbox:FC<CheckboxProps> = ({label, onChange, customCheckedCondition}) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  useEffect(() => {
    if(customCheckedCondition !== undefined){
      setChecked(customCheckedCondition);
    }
  }, [customCheckedCondition]);


  return (
    <label style={{ color: 'black', display: 'flex', alignItems: 'center' }}>
      {label}
      <input type="checkbox" checked={checked} onChange={handleChange} style={{ marginLeft: '8px' }} className="custom-checkbox"/>
    </label>
  );
};

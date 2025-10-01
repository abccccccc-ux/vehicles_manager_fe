import React from 'react';
import { Select } from 'antd';

const SearchFilter = ({ value, onChange, options = [], placeholder = 'Lọc', style }) => (
  <Select
    allowClear
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={style}
    options={options}
  />
);

export default SearchFilter;

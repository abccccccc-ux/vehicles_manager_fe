import React from 'react';
import { Input } from 'antd';

const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...', style }) => (
  <Input.Search
    allowClear
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={style}
    enterButton
  />
);

export default SearchInput;

import React from 'react';
import { SearchIcon } from '../../utils/SvgFile';
import './SearchInput.css';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Search...' }) => {
	return (
		<div className="search-container">
			<SearchIcon className="search-icon" />
			<input
				type="text"
				className="search-input"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
};

export default SearchInput;

import React from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;

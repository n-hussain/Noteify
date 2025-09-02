import React from "react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sortOption: "created" | "updated" | "title";
  onSortChange: (value: "created" | "updated" | "title") => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  sortOption,
  onSortChange,
}) => {

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search notes..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="search-input"
      />
      <select
        value={sortOption}
        onChange={(e) =>
          onSortChange(e.target.value as "created" | "updated" | "title")
        }
        className="sort-select"
      >
        <option value="updated">Last Modified</option>
        <option value="created">Date Created</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
};

export default SearchBar;

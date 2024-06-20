import React, { useState, useEffect } from 'react';
import { fetchLoquateSuggestions } from '../../services/api';
import debounce from 'lodash/debounce';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (term) => {
    try {
        const suggestions = await fetchLoquateSuggestions(term);
        setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }

    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchTerm]);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {suggestions && suggestions.length > 0 && (
        <ul className="absolute mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
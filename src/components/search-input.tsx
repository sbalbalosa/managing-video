import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import { useDebounceCallback } from '@react-hook/debounce';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';

interface Props {
  onTyping: (isTyping: boolean) => void;
  onSearch: (search: string) => void;
  onClear: () => void;
  placeholder: string;
  timeout: number;
}

export const SearchInput: React.FC<Props> = ({ onSearch, timeout, onClear, onTyping, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSearch = useDebounceCallback((search: string): void => {
    if (searchTerm !== '') {
      onSearch(search);
    }
    setIsTyping(false);
  }, timeout);

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsTyping(false);
    onClear();
  };

  const handleChange = (term: string) => {
    setSearchTerm(term);
    if (term === '') {
      onClear();
    }
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsTyping(true);
      handleSearch(searchTerm);
    } else {
      setIsTyping(false);
    }
  }, [handleSearch, searchTerm]);

  useEffect(() => {
    onTyping(isTyping);
  }, [isTyping, onTyping]);

  return (
    <TextField
      fullWidth
      label="Search"
      variant="standard"
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="start">
            {searchTerm !== '' ? (
              <IconButton aria-label="delete" onClick={handleClearSearch}>
                <CloseIcon />
              </IconButton>
            ) : null}
          </InputAdornment>
        ),
      }}
      onChange={(e) => handleChange(e.target.value)}
      value={searchTerm}
    />
  );
};

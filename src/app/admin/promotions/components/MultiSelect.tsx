'use client'

import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SelectOption } from '../types';

interface MultiSelectProps {
  options: SelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = 'Select items',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items available',
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const labelByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, closeDropdown]);

  useEffect(() => {
    if (open) searchInputRef.current?.focus();
  }, [open]);

  const toggleValue = useCallback(
    (value: string) => {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    },
    [onChange, selected],
  );

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) toggleValue(option.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — a div (not a button) because the chips contain real remove buttons */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeDropdown() : setOpen(true))}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full min-h-[42px] px-3 py-1.5 border rounded-lg cursor-pointer flex items-center gap-1.5 flex-wrap transition-colors bg-white ${
          open ? 'border-brand_pink ring-2 ring-brand_pink/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400 py-0.5">{placeholder}</span>
        ) : (
          selected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-brand_pink/10 border border-brand_pink/20 text-brand_pink rounded-md text-xs font-medium"
            >
              {labelByValue.get(value) || value}
              <button
                type="button"
                aria-label={`Remove ${labelByValue.get(value) || value}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleValue(value);
                }}
                className="p-0.5 rounded hover:bg-brand_pink/20 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative border-b border-gray-100">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="w-full py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <ul role="listbox" aria-multiselectable="true" className="max-h-48 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                {options.length === 0 ? emptyMessage : 'No matches found'}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selected.includes(option.value);
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                        index === highlightedIndex ? 'bg-gray-50' : ''
                      } ${isSelected ? 'text-brand_pink font-medium' : 'text-gray-700'}`}
                    >
                      <span
                        className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-brand_pink border-brand_pink' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {selected.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-500 font-medium">
                {selected.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-brand_pink hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(MultiSelect);

import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-full min-w-[160px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-colors text-left"
      >
        <span className="truncate">{value || placeholder}</span>
        <svg
          className={`w-4 h-4 text-text-faint transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto animate-modal-in">
          {options.map((option) => {
            const val = typeof option === 'string' ? option : option.value;
            const lbl = typeof option === 'string' ? option : option.label;
            
            return (
              <button
                key={val}
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-hover transition-colors ${
                  val === value ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary'
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

import { SearchInputProps } from './SearchInput.types';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchInputProps) => {
  return (
    <div
      className={cn(
        'relative h-[54px] border border-GreyScale-300 w-full rounded-[10px] flex items-center',
        className,
      )}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-full p-4 text-sm font-medium rounded-[10px] pr-0 border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 text-GreyScale-900 placeholder:text-GreyScale-500 placeholder:font-normal"
      />
      <div className="h-full flex items-center justify-center rounded-r-[10px] pr-5 pl-2">
        <Search className="text-GreyScale-900" size={20} />
      </div>
    </div>
  );
};

export { SearchInput };

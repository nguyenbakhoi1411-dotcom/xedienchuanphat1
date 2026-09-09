"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export const NumberInput = ({ value, onChange, placeholder = "0" }: { value: number, onChange: (val: number) => void, placeholder?: string }) => {
  const [local, setLocal] = useState(value === 0 ? "" : new Intl.NumberFormat('vi-VN').format(value));
  
  useEffect(() => {
     setLocal(value === 0 ? "" : new Intl.NumberFormat('vi-VN').format(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const raw = e.target.value.replace(/\D/g, "");
     const num = parseInt(raw, 10);
     if (isNaN(num)) {
       setLocal("");
       onChange(0);
     } else {
       setLocal(new Intl.NumberFormat('vi-VN').format(num));
       onChange(num);
     }
  };

  return (
    <input
      type="text"
      className="w-full text-right px-2 py-1 outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 rounded border border-transparent font-semibold bg-transparent"
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

export const TextInput = ({ value, onChange, placeholder = "" }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  return (
    <input
      type="text"
      className="w-full px-2 py-1 outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 rounded border border-transparent font-semibold bg-transparent text-slate-700"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

interface ComboboxItem {
  code: string;
  name: string;
}

export const GenericCombobox = ({ 
  value, 
  items, 
  onChange, 
  onNameChange,
  codeLabel = "Mã",
  nameLabel = "Tên"
}: { 
  value: string, 
  items: ComboboxItem[], 
  onChange: (c: string) => void, 
  onNameChange: (n: string) => void,
  codeLabel?: string,
  nameLabel?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter(a => a.code.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={wrapperRef}>
       <div className={`flex bg-white rounded transition-colors ${isOpen ? 'border border-blue-500 ring-1 ring-blue-200' : 'border border-transparent hover:border-slate-300'}`}>
          <input 
            type="text" 
            value={search} 
            onChange={e => {
              setSearch(e.target.value);
              setIsOpen(true);
            }} 
            onFocus={() => setIsOpen(true)} 
            className="w-full outline-none px-2 py-1 font-semibold text-slate-800 bg-transparent" 
          />
          <button className="px-1 text-slate-500 hover:bg-slate-100 rounded-r" onClick={() => setIsOpen(!isOpen)}>
            <ChevronDown className="w-4 h-4" />
          </button>
       </div>
       {isOpen && (
         <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-slate-300 shadow-xl z-50 max-h-64 flex flex-col rounded">
            <div className="flex bg-slate-100 border-b border-slate-300 font-bold p-2 text-xs">
               <div className="w-1/3">{codeLabel}</div>
               <div className="w-2/3">{nameLabel}</div>
            </div>
            <div className="overflow-y-auto">
               {filtered.length > 0 ? filtered.map(a => (
                  <div key={a.code} className="flex p-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100" onClick={() => {
                     onChange(a.code);
                     onNameChange(a.name);
                     setSearch(a.code);
                     setIsOpen(false);
                  }}>
                     <div className="w-1/3 text-slate-800 font-semibold">{a.code}</div>
                     <div className="w-2/3 text-slate-600">{a.name}</div>
                  </div>
               )) : (
                 <div className="p-3 text-center text-slate-500 text-sm">Không tìm thấy dữ liệu</div>
               )}
            </div>
         </div>
       )}
    </div>
  );
};

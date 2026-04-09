"use client";

import React from "react";

type CategoryFilterProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, active, onChange }) => {
  return (
    <div className="flex overflow-x-auto gap-3 py-5 px-6 no-scrollbar bg-black/90 backdrop-blur-md">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 italic ${
            active === category
              ? "text-white shadow-xl"
              : "bg-transparent border-white/10 text-neutral-500 hover:border-white/30"
          }`}
          style={active === category ? { backgroundColor: "var(--primary)", borderColor: "var(--primary)" } : {}}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

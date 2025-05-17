'use client';

import { useState } from 'react';
import Link from 'next/link';

export interface CardItem {
  id: number;
  title: string;
  content: string;
  author: string;
  likes: number;
  categoryName: string;
  categorySlug: string;
}

export function CardStack({ items }: { items: CardItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full h-full">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute w-full transition-all duration-300 ${
            index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          style={{
            transform: `translateY(${(index - activeIndex) * 20}px)`,
          }}
        >
          <Link href={`/board/${item.categorySlug}/${item.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {item.content}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{item.author}</span>
                <span>❤️ {item.likes}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === activeIndex ? 'bg-coral-600' : 'bg-gray-300'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

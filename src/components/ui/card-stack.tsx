'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export type CardItem = {
  id: number;
  title: string;
  author: string;
  content: string;
  likes: number;
  categoryName: string;
  categorySlug: string;
};

export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
}: {
  items: CardItem[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);

  useEffect(() => {
    if (!items || items.length === 0) return;
    setCards(items);
  }, [items]);

  useEffect(() => {
    if (!cards || cards.length === 0) return;

    const interval = setInterval(() => {
      setCards(prevCards => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [cards]);

  if (!cards || cards.length === 0) {
    return (
      <div className="relative h-60 w-full max-w-md mx-auto flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative h-60 w-full max-w-md mx-auto">
      {cards.map((card, index) => (
        <Link key={card.id} href={`/board/${card.categorySlug}/${card.id}`} className="block">
          <motion.div
            className="absolute w-full bg-white dark:bg-black rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-white/[0.1] hover:border-coral-500 transition-colors cursor-pointer"
            style={{
              transformOrigin: 'top center',
            }}
            animate={{
              top: index * -offset,
              scale: 1 - index * scaleFactor,
              zIndex: cards.length - index,
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-coral-500 bg-coral-50 dark:bg-coral-900/20 px-2 py-1 rounded-full">
                  {card.categoryName}
                </span>
                <span className="text-xs text-gray-400">Likes {card.likes}</span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {card.content}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">{card.author}</p>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

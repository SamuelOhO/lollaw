'use client';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';
import { cn } from '@/utils/cn';

let interval: any;

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
  offset,
  scaleFactor,
}: {
  items: CardItem[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<CardItem[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: CardItem[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="relative h-60 w-60 md:h-60 md:w-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">게시글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative h-60 w-60 md:h-60 md:w-96">
      {cards.map((card, index) => {
        return (
          <Link key={card.id} href={`/board/${card.categorySlug}/${card.id}`}>
            <motion.div
              className={cn(
                "absolute dark:bg-black bg-white h-60 w-60 md:h-60 md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between cursor-pointer hover:border-coral-500 transition-colors"
              )}
              style={{
                transformOrigin: "top center",
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
                zIndex: cards.length - index, //  decrease z-index for the cards that are behind
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-coral-500 bg-coral-50 dark:bg-coral-900/20 px-2 py-1 rounded-full">
                    {card.categoryName}
                  </span>
                  <span className="text-xs text-gray-400">❤️ {card.likes}</span>
                </div>
                <h3 className="font-semibold text-lg text-neutral-700 dark:text-neutral-200">
                  {card.title}
                </h3>
                <div className="font-normal text-neutral-700 dark:text-neutral-200 text-sm line-clamp-3">
                  {card.content}
                </div>
              </div>
              <div>
                <p className="text-neutral-500 font-medium dark:text-white text-sm">
                  {card.author}
                </p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

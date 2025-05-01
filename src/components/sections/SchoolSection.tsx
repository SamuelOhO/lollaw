"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const cards = [
  {
    id: 1,
    title: "로그인이 필요한 서비스입니다",
    content: "로그인 후 재학생/졸업생 인증을 진행해주세요.",
    buttonText: "로그인하기",
    buttonLink: "/auth/login"
  },
  {
    id: 2,
    title: "학교별 게시판",
    content: "재학/졸업생 인증시 이용 가능",
    buttonText: "자세히 보기",
    buttonLink: "/schools"
  }
];

export default function ClientSection() {
  const [currentCards, setCurrentCards] = useState(cards);
  // 인증 상태 가정 (임시)
  const isAuthenticated = true;
  const isVerified = true;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-60 w-full max-w-md mx-auto">
      {currentCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute w-full bg-gradient-to-br from-blue-500/40 to-purple-600/40 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
          style={{
            transformOrigin: "top center",
          }}
          animate={{
            top: index * -10,
            scale: 1 - index * 0.06,
            zIndex: cards.length - index,
          }}
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {card.title}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
              {card.content}
            </p>
            <Link
              href={card.buttonLink}
              className="inline-block mt-6 px-6 py-2 bg-white/90 hover:bg-white text-blue-600 rounded-lg transition-colors text-center font-semibold shadow-sm"
            >
              {card.buttonText}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 
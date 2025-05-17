// utils/date.ts
import { format as dateFnsFormat } from 'date-fns';
import { ko } from 'date-fns/locale';

export function format(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
}

export function formatKoreanDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // 오전/오후, 시:분까지 한국어로
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  let hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  const isAM = hour < 12;
  const ampm = isAM ? '오전' : '오후';
  if (!isAM && hour > 12) hour -= 12;
  return `${year}년 ${month}월 ${day}일 ${ampm} ${hour}:${minute.toString().padStart(2, '0')}`;
}

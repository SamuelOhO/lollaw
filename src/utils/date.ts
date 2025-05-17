// utils/date.ts
import { format as dateFnsFormat } from 'date-fns';
import { ko } from 'date-fns/locale';

export function format(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(dateObj, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
}

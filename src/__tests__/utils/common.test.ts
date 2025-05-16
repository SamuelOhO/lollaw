import { cn } from '@/utils/common';

describe('cn', () => {
  it('여러 클래스를 하나로 병합해야 합니다', () => {
    const result = cn('px-2 py-1', 'bg-red-500', 'text-white');
    expect(result).toBe('px-2 py-1 bg-red-500 text-white');
  });

  it('조건부 클래스를 처리해야 합니다', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class');
    expect(result).toBe('base-class active-class');
  });

  it('중복된 Tailwind 클래스를 병합해야 합니다', () => {
    const result = cn('px-2 py-1', 'px-4 py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('객체 형태의 클래스를 처리해야 합니다', () => {
    const result = cn('base-class', { 'conditional-class': true, 'other-class': false });
    expect(result).toBe('base-class conditional-class');
  });
}); 
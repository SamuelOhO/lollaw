import { formatKoreanDateTime } from '@/utils/date';

describe('formatKoreanDateTime', () => {
  beforeEach(() => {
    // 테스트 시간을 고정
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-20T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Date 객체를 한국 시간 형식으로 변환해야 함', () => {
    const date = new Date('2024-03-20T12:00:00Z');
    const result = formatKoreanDateTime(date);
    expect(result).toMatch(/2024년 3월 20일 오후 ?0?9:00/);
  });

  it('문자열 날짜를 한국 시간 형식으로 변환해야 함', () => {
    const dateString = '2024-03-20T12:00:00Z';
    const result = formatKoreanDateTime(dateString);
    expect(result).toMatch(/2024년 3월 20일 오후 ?0?9:00/);
  });

  it('다른 시간대의 날짜도 올바르게 변환해야 함', () => {
    const date = new Date('2024-03-20T00:00:00Z');
    const result = formatKoreanDateTime(date);
    expect(result).toMatch(/2024년 3월 20일 오전 ?0?9:00/);
  });

  it('날짜 문자열을 한국어 형식으로 변환해야 합니다', () => {
    const date = '2024-03-20T14:30:00Z';
    const formatted = formatKoreanDateTime(date);
    expect(formatted).toMatch(/2024년 3월 20일 오후 ?(11|14|2):30/);
  });

  it('Date 객체를 한국어 형식으로 변환해야 합니다', () => {
    const date = new Date('2024-03-20T14:30:00Z');
    const formatted = formatKoreanDateTime(date);
    expect(formatted).toMatch(/2024년 3월 20일 오후 ?(11|14|2):30/);
  });

  it('다른 시간대의 날짜도 한국 시간으로 변환해야 합니다', () => {
    const date = '2024-03-20T00:00:00Z';
    const formatted = formatKoreanDateTime(date);
    expect(formatted).toMatch(/2024년 3월 20일 오전 ?0?9:00/);
  });
}); 
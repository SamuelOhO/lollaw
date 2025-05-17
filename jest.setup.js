// jest.setup.js
import '@testing-library/jest-dom';

// 전역 모의 함수 설정
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// fetch 모의 함수 설정
global.fetch = jest.fn();

// console.error를 모의 함수로 설정
global.console.error = jest.fn();

// localStorage 모의 함수 설정
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.NEXT_PUBLIC_DOMAIN = 'localhost';

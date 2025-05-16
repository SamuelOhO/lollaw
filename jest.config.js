const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // 테스트 환경에서 next.config.js와 .env 파일을 로드하기 위한 Next.js 앱의 경로
  dir: './',
});

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
  ],
};

// createJestConfig를 내보내서 next/jest가 비동기 Next.js 설정을 로드할 수 있도록 합니다
module.exports = createJestConfig(customJestConfig);

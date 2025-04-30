export default function UnauthorizedPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              접근 권한이 없습니다
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              해당 학교 게시판에 접근하기 위해서는 학교 이메일 인증이 필요합니다.
            </p>
          </div>
          <div className="mt-5">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              메인페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }
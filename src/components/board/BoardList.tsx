'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Post {
  id: number
  title: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

interface BoardListProps {
  posts: Post[]
}

export default function BoardList({ posts }: BoardListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/post/${post.id}`} className="text-blue-600 hover:text-blue-800">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {post.profiles.avatar_url && (
                      <img 
                        src={post.profiles.avatar_url} 
                        alt="" 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span className="text-sm text-gray-900">{post.profiles.display_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function WritePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login") // 로그인 안 했으면 리디렉션
      } else {
        setUserId(data.user.id)
      }
    })
  }, [])

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from("posts").insert({
      title,
      content,
      user_id: userId,
    })
    if (error) {
      alert("작성 실패: " + error.message)
    } else {
      router.push("/community")
    }
    setLoading(false)
  }

  if (!userId) return null // 로딩 중이거나 로그인 확인 전엔 아무것도 렌더링하지 않음

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">글쓰기</h1>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        className="w-full p-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="내용을 입력하세요"
        className="w-full h-40 p-2 border rounded mb-4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "작성 중..." : "작성하기"}
      </button>
    </div>
  )
}
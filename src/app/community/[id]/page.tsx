import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

type PageProps = {
  params: {
    id: string
  }
}

export default async function PostDetail({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: post, error } = await supabase
    .from("posts")
    .select("title, content, created_at")
    .eq("id", params.id)
    .single()

  if (!post || error) {
    return notFound()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {new Date(post.created_at).toLocaleString()}
      </p>
      <div className="whitespace-pre-wrap">{post.content}</div>
    </div>
  )
}
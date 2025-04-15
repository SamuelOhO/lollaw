import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

export default async function Page({ params }: any) {
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
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.created_at).toLocaleString()}
      </p>
      <p className="whitespace-pre-wrap">{post.content}</p>
    </div>
  )
}

// // src/app/community/[id]/page.tsx

// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
// import { cookies } from "next/headers"
// import { notFound } from "next/navigation"

// export default async function Page({
//   params,
// }: {
//   params: { id: string }
// }) {
//   const supabase = createServerComponentClient({ cookies })

//   const { data: post, error } = await supabase
//     .from("posts")
//     .select("title, content, created_at")
//     .eq("id", params.id)
//     .single()

//   if (!post || error) {
//     return notFound()
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
//       <p className="text-sm text-gray-500 mb-4">
//         {new Date(post.created_at).toLocaleString()}
//       </p>
//       <p className="whitespace-pre-wrap">{post.content}</p>
//     </div>
//   )
// }

// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
// import { cookies } from "next/headers"
// import { notFound } from "next/navigation"

// interface Props {
//   params: { id: string }
// }

// export default async function Page(props: Props) {
//   const { id } = props.params

//   const supabase = createServerComponentClient({ cookies })

//   const { data: post, error } = await supabase
//     .from("posts")
//     .select("title, content, created_at")
//     .eq("id", id)
//     .single()

//   if (!post || error) {
//     return notFound()
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
//       <p className="text-sm text-gray-500 mb-4">
//         {new Date(post.created_at).toLocaleString()}
//       </p>
//       <p className="whitespace-pre-wrap">{post.content}</p>
//     </div>
//   )
// }
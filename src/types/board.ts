export interface Post {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  category_id: number
  user_id: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  requires_auth: boolean
}

export interface BoardPageProps {
  params: { 
    slug: string 
  }
  searchParams: { 
    page?: string
    limit?: string 
  }
} 
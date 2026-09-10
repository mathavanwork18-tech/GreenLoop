import { postsApi } from '../../../services/posts/posts.api'
import { mapsApi } from '../../../services/maps/maps.api'
import type { Post } from '../../../types/post.types'
import type { EcosystemPartner } from '../../../types/map.types'

export const homeApi = {
  async getHomeFeed(): Promise<{ posts: Post[]; recommended: Post[]; nearby: EcosystemPartner[] }> {
    const [allPosts, allPartners] = await Promise.all([
      postsApi.getPosts(),
      mapsApi.getPartners(),
    ])

    const recommended = allPosts.filter(p => p.recommended || p.likes > 8)

    return {
      posts: allPosts,
      recommended,
      nearby: allPartners.slice(0, 4),
    }
  },

  async toggleLike(postId: string): Promise<Post[]> {
    return postsApi.toggleLike(postId)
  },

  async toggleSave(postId: string): Promise<Post[]> {
    return postsApi.toggleSave(postId)
  }
}

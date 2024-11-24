export interface Anime {
  id: string
  title: string
  image: string
  description?: string
  status?: string
  releaseDate?: string
  totalEpisodes?: number
}

export interface Episode {
  id: string
  number: number
  url?: string
}

export interface AnimeDetails extends Anime {
  episodes: Episode[]
} 
import axios from 'axios';
import { config } from '../config.js';

// AniList GraphQL endpoint
const ANILIST_API = 'https://graphql.anilist.co';

// Simple cache (5 menit)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[CACHE] Hit for ${key}`);
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`[CACHE] Set for ${key}`);
}

// GraphQL query helper
async function graphqlQuery(query, variables = {}) {
  try {
    console.log('[ANILIST] Making GraphQL query...', JSON.stringify(variables));
    const response = await axios.post(ANILIST_API, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.errors) {
      console.error('[ANILIST] GraphQL errors:', JSON.stringify(response.data.errors));
      throw new Error(response.data.errors[0].message);
    }
    
    console.log('[ANILIST] Query successful');
    return response.data;
  } catch (error) {
    console.error('[ANILIST] Query failed:', error.message);
    if (error.response?.data) {
      console.error('[ANILIST] Response data:', JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function searchAnime(query, page = 1, type = null) {
  try {
    const cacheKey = `search_${query}_${page}_${type || 'all'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($search: String, $page: Int, $perPage: Int, $format: MediaFormat) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(search: $search, type: ANIME, format: $format, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
            format
            seasonYear
          }
        }
      }
    `;
    
    const variables = {
      search: query,
      page: page,
      perPage: config.itemsPerPage
    };
    
    // Only add format if type is specified
    if (type) {
      variables.format = type.toUpperCase();
    }
    
    const response = await graphqlQuery(gqlQuery, variables);
    
    // Transform ke format yang compatible dengan UI
    const result = {
      data: response.data.Page.media.map(anime => ({
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        year: anime.seasonYear
      })),
      pagination: {
        items: {
          total: response.data.Page.pageInfo.total,
          count: response.data.Page.media.length,
          per_page: response.data.Page.pageInfo.perPage
        },
        current_page: response.data.Page.pageInfo.currentPage,
        has_next_page: response.data.Page.pageInfo.hasNextPage,
        last_visible_page: response.data.Page.pageInfo.lastPage
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error searching anime:', error.message);
    throw error;
  }
}

export async function getAnimeById(id) {
  try {
    const cacheKey = `anime_${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
          bannerImage
          averageScore
          episodes
          status
          format
          duration
          seasonYear
          season
          description
          genres
          studios {
            nodes {
              name
            }
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          siteUrl
        }
      }
    `;
    
    const variables = { id: parseInt(id) };
    const response = await graphqlQuery(gqlQuery, variables);
    
    // Transform ke format yang compatible
    const anime = response.data.Media;
    const result = {
      data: {
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_english: anime.title.english,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        duration: anime.duration ? `${anime.duration} min per ep` : null,
        rating: null,
        genres: anime.genres ? anime.genres.map(g => ({ name: g })) : [],
        studios: anime.studios?.nodes || [],
        synopsis: anime.description?.replace(/<[^>]*>/g, ''),
        aired: {
          string: `${anime.startDate?.year || '?'} to ${anime.endDate?.year || '?'}`
        },
        url: anime.siteUrl,
        year: anime.seasonYear
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching anime details:', error.message);
    throw error;
  }
}

export async function getTopAnime(page = 1, type = null) {
  try {
    const cacheKey = `top_${page}_${type || 'all'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($page: Int, $perPage: Int, $format: MediaFormat) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, format: $format, sort: SCORE_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
            format
            seasonYear
          }
        }
      }
    `;
    
    const variables = {
      page: page,
      perPage: config.itemsPerPage
    };
    
    // Only add format if type is specified
    if (type) {
      variables.format = type.toUpperCase();
    }
    
    const response = await graphqlQuery(gqlQuery, variables);
    
    // Transform ke format yang compatible
    const result = {
      data: response.data.Page.media.map(anime => ({
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        year: anime.seasonYear
      })),
      pagination: {
        items: {
          total: response.data.Page.pageInfo.total,
          count: response.data.Page.media.length,
          per_page: response.data.Page.pageInfo.perPage
        },
        current_page: response.data.Page.pageInfo.currentPage,
        has_next_page: response.data.Page.pageInfo.hasNextPage,
        last_visible_page: response.data.Page.pageInfo.lastPage
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching top anime:', error.message);
    throw error;
  }
}

export async function getAnimeByGenre(genre, page = 1, type = null) {
  try {
    const cacheKey = `genre_${genre}_${page}_${type || 'all'}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($genre: String, $page: Int, $perPage: Int, $format: MediaFormat) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(genre: $genre, type: ANIME, format: $format, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
            format
            seasonYear
            genres
          }
        }
      }
    `;
    
    const variables = {
      genre: genre,
      page: page,
      perPage: config.itemsPerPage
    };
    
    // Only add format if type is specified
    if (type) {
      variables.format = type.toUpperCase();
    }
    
    const response = await graphqlQuery(gqlQuery, variables);
    
    // Transform ke format yang compatible
    const result = {
      data: response.data.Page.media.map(anime => ({
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        year: anime.seasonYear,
        genres: anime.genres
      })),
      pagination: {
        items: {
          total: response.data.Page.pageInfo.total,
          count: response.data.Page.media.length,
          per_page: response.data.Page.pageInfo.perPage
        },
        current_page: response.data.Page.pageInfo.currentPage,
        has_next_page: response.data.Page.pageInfo.hasNextPage,
        last_visible_page: response.data.Page.pageInfo.lastPage
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching anime by genre:', error.message);
    throw error;
  }
}

// Helper untuk format type anime
export const animeTypes = {
  tv: 'TV',
  movie: 'MOVIE',
  ova: 'OVA',
  special: 'SPECIAL',
  ona: 'ONA',
  music: 'MUSIC'
};


// Get anime trailer
export async function getAnimeTrailer(id) {
  try {
    const cacheKey = `trailer_${id}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          trailer {
            id
            site
            thumbnail
          }
          averageScore
          format
          status
          siteUrl
        }
      }
    `;
    
    const variables = { id: parseInt(id) };
    const response = await graphqlQuery(gqlQuery, variables);
    
    const anime = response.data.Media;
    const result = {
      id: anime.id,
      title: anime.title.english || anime.title.romaji,
      coverImage: anime.coverImage.large,
      trailer: anime.trailer,
      averageScore: anime.averageScore,
      format: anime.format,
      status: anime.status,
      siteUrl: anime.siteUrl
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching anime trailer:', error.message);
    throw error;
  }
}

// Get seasonal anime
export async function getSeasonalAnime(season, year, page = 1) {
  try {
    const cacheKey = `seasonal_${season}_${year}_${page}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
            format
            seasonYear
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;
    
    const variables = {
      season: season,
      year: year,
      page: page,
      perPage: config.itemsPerPage
    };
    
    const response = await graphqlQuery(gqlQuery, variables);
    
    const result = {
      data: response.data.Page.media.map(anime => ({
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        year: anime.seasonYear,
        startDate: anime.startDate
      })),
      pagination: {
        items: {
          total: response.data.Page.pageInfo.total,
          count: response.data.Page.media.length,
          per_page: response.data.Page.pageInfo.perPage
        },
        current_page: response.data.Page.pageInfo.currentPage,
        has_next_page: response.data.Page.pageInfo.hasNextPage,
        last_visible_page: response.data.Page.pageInfo.lastPage
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching seasonal anime:', error.message);
    throw error;
  }
}

// Get recommendations based on genre and score
export async function getRecommendations(genre, minScore = 70, page = 1) {
  try {
    const cacheKey = `recommend_${genre}_${minScore}_${page}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    
    const gqlQuery = `
      query ($genre: String, $minScore: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(genre: $genre, type: ANIME, averageScore_greater: $minScore, sort: SCORE_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
            }
            averageScore
            episodes
            status
            format
            seasonYear
            genres
          }
        }
      }
    `;
    
    const variables = {
      genre: genre,
      minScore: minScore,
      page: page,
      perPage: config.itemsPerPage
    };
    
    const response = await graphqlQuery(gqlQuery, variables);
    
    const result = {
      data: response.data.Page.media.map(anime => ({
        mal_id: anime.id,
        title: anime.title.english || anime.title.romaji,
        title_japanese: anime.title.native,
        images: { jpg: { large_image_url: anime.coverImage.large } },
        score: anime.averageScore ? anime.averageScore / 10 : null,
        episodes: anime.episodes,
        status: anime.status,
        type: anime.format,
        year: anime.seasonYear,
        genres: anime.genres
      })),
      pagination: {
        items: {
          total: response.data.Page.pageInfo.total,
          count: response.data.Page.media.length,
          per_page: response.data.Page.pageInfo.perPage
        },
        current_page: response.data.Page.pageInfo.currentPage,
        has_next_page: response.data.Page.pageInfo.hasNextPage,
        last_visible_page: response.data.Page.pageInfo.lastPage
      }
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    throw error;
  }
}

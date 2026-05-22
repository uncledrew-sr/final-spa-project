import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useMovieStore = defineStore('movie', () => {
    // [1] State (상태 관리 구역)
    const movies = ref([]);

    // [세션 스토리지 적용]
    const favorites = ref(JSON.parse(sessionStorage.getItem('favorites')) || []);

    // [2] UX 및 예외 처리를 위한 핵심 방어 상태 변수
    const isLoading = ref(false);
    const errorMessage = ref('');

    // [3] Actions: 외부 서버 통신 함수 (async/await 적용)
    const fetchMovies = async () => {
        isLoading.value = true;
        errorMessage.value = '';

        try {
            const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

            const movieParams = {
                api_key: API_KEY,
                language: 'ko-KR',
                region: 'KR',
                sort_by: 'popularity.desc',
                include_adult: false,
                'release_date.gte': '2025-01-01',
                with_release_type: '2|3',
                page: 1
            };

            const response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: movieParams
            });

            const fetchedMovies = response.data.results;

            fetchedMovies.forEach(movie => {
                const isAlreadyFavorite = favorites.value.some(fav => fav.id === movie.id);
                movie.isFavorite = isAlreadyFavorite;
            });

            movies.value = fetchedMovies;
        } catch (error) {
            console.error('API 통신 에러 상세 내역:', error);
            errorMessage.value = '영화 데이터를 불러오는 데 실패했습니다. 통신 상태나 API Key를 확인해 주세요.';
        } finally {
            isLoading.value = false;
        }
    };

    const toggleFavorite = (movieId) => {
        const movie = movies.value.find(m => m.id === movieId);
        if (movie) {
            movie.isFavorite = !movie.isFavorite;

            if (movie.isFavorite) {
                favorites.value.push(movie);
            } else {
                favorites.value = favorites.value.filter(m => m.id !== movieId);
            }
            sessionStorage.setItem('favorites', JSON.stringify(favorites.value));
        }
    };

    return {
        movies,
        favorites,
        isLoading,
        errorMessage,
        fetchMovies,
        toggleFavorite
    };
});
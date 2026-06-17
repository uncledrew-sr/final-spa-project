<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '../stores/movieStore';

const route = useRoute();
const router = useRouter();
const store = useMovieStore();

// 검색창 입력값: URL 쿼리 파라미터에서 초기값 동기화
const inputQuery = ref(route.query.q || '');

onMounted(async () => {
  // 목록 데이터가 없으면 먼저 로딩
  if (store.movies.length === 0) {
    await store.fetchMovies();
  }
  document.title = `🔍 "${route.query.q}" 검색 결과 | NETVUE`;
});

// URL 쿼리가 바뀌면(브라우저 뒤로가기 등) 입력창도 동기화
watch(() => route.query.q, (newQ) => {
  inputQuery.value = newQ || '';
});

// 검색어 기준으로 제목 필터링 (대소문자 무시)
const filteredMovies = computed(() => {
  const keyword = (route.query.q || '').trim().toLowerCase();
  if (!keyword) return [];
  return store.movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  );
});

// 검색 폼 제출: 현재 입력값을 쿼리 파라미터로 라우터에 반영
const submitSearch = () => {
  const keyword = inputQuery.value.trim();
  if (!keyword) return;
  router.push({ name: 'search', query: { q: keyword } });
  document.title = `🔍 "${keyword}" 검색 결과 | NETVUE`;
};
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🔍 영화 검색</h1>
      <p class="sub-title">제목으로 원하는 영화를 찾아보세요</p>
    </div>

    <!-- 검색 입력 폼 -->
    <form class="search-form" @submit.prevent="submitSearch">
      <input
        v-model="inputQuery"
        class="search-input"
        type="text"
        placeholder="영화 제목을 입력하세요..."
        autofocus
      />
      <button type="submit" class="search-submit-btn">검색</button>
    </form>

    <!-- 로딩 중 -->
    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 데이터를 불러오는 중입니다...
    </div>

    <!-- 검색어 미입력 상태 -->
    <div v-else-if="!route.query.q" class="empty-guide">
      <span class="empty-icon">🎬</span>
      <p>검색어를 입력하면 결과가 표시됩니다.</p>
    </div>

    <!-- 결과 없음 -->
    <div v-else-if="filteredMovies.length === 0" class="empty-guide">
      <span class="empty-icon">😢</span>
      <p><strong>"{{ route.query.q }}"</strong>에 해당하는 영화가 없습니다.</p>
    </div>

    <!-- 검색 결과 목록 -->
    <template v-else>
      <p class="result-count">
        <strong>"{{ route.query.q }}"</strong> 검색 결과 — 총 {{ filteredMovies.length }}편
      </p>
      <div class="movie-list">
        <div v-for="movie in filteredMovies" :key="movie.id" class="movie-card">
          <img
            v-if="movie.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            class="poster"
          />
          <div v-else class="poster-placeholder">이미지 준비 중</div>

          <div class="card-content">
            <h3 class="title">{{ movie.title }}</h3>
            <p v-if="movie.release_date" class="release-date">📅 {{ movie.release_date }}</p>
            <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
            <p class="overview">
              {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '줄거리 정보 없음' }}
            </p>
            <button
              @click="store.toggleFavorite(movie.id)"
              :class="{ active: movie.isFavorite }"
              class="fav-btn"
            >
              {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
            </button>
          </div>
          <RouterLink
            :to="`/movies/${movie.id}`"
            class="stretched-link"
            :aria-label="`${movie.title} 상세 정보 보기`"
          ></RouterLink>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page { padding: 40px; background-color: #f8f9fa; min-height: 100vh; }
.header-section { margin-bottom: 28px; text-align: center; color: #232c50; }
.sub-title { font-size: 14px; color: #7f8c8d; margin-top: 5px; }

/* 검색 폼 */
.search-form {
  display: flex;
  gap: 12px;
  max-width: 640px;
  margin: 0 auto 36px;
}
.search-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #dee2e6;
  border-radius: 40px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #ff4757; }
.search-submit-btn {
  padding: 14px 28px;
  background: #ff4757;
  color: #fff;
  border: none;
  border-radius: 40px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.search-submit-btn:hover { background: #e84040; }

.result-count { text-align: center; margin-bottom: 24px; color: #555; font-size: 15px; }

/* 안내 영역 */
.empty-guide {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}
.empty-icon { font-size: 52px; display: block; margin-bottom: 16px; }
.empty-guide p { font-size: 18px; }

.status-message { text-align: center; font-size: 20px; font-weight: bold; padding: 50px; border-radius: 12px; }
.loading { color: #3498db; background-color: #e3f2fd; }

/* 카드 그리드 (MoviesView와 동일한 레이아웃) */
.movie-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
.movie-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}
.movie-card:hover { transform: translateY(-5px); }
.poster { width: 100%; height: 380px; object-fit: cover; }
.poster-placeholder { width: 100%; height: 380px; background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #7f8c8d; font-weight: bold; }
.card-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
.title { font-size: 18px; color: #333; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; }
.release-date { font-size: 13px; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; }
.rating { font-weight: bold; color: #f39c12; margin-bottom: 10px; font-size: 16px; }
.overview { font-size: 13px; color: #555; line-height: 1.4; margin-bottom: 20px; flex-grow: 1; }
.fav-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: #ecf0f1;
  color: #333;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  transition: 0.3s;
  margin-top: auto;
}
.fav-btn.active { background: #ff4757; color: white; }
.stretched-link {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}
</style>

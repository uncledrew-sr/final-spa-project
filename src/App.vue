<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <RouterLink to="/" class="logo-zone">
          <span class="logo-icon">🍿</span>
          <h1 class="logo-text">NETVUE</h1>
        </RouterLink>

        <nav class="nav-menu">
          <RouterLink to="/" class="nav-item">홈</RouterLink>
          <RouterLink to="/movies" class="nav-item">영화 목록</RouterLink>
          <RouterLink to="/favorites" class="nav-item">❤️ 찜 목록</RouterLink>
        </nav>

        <!-- 헤더 검색 폼: 입력 후 /search?q= 로 이동 -->
        <form class="header-search-form" @submit.prevent="goSearch">
          <input
            v-model="headerQuery"
            class="header-search-input"
            type="text"
            placeholder="영화 검색..."
          />
          <button type="submit" class="header-search-btn">🔍</button>
        </form>

        <div class="header-dashboard">
          <div class="dashboard-badge favorite-count">
            <span class="badge-label">❤️ 찜한 작품</span>
            <span class="badge-value">{{ totalFavoritesCount }}개</span>
          </div>
          <div class="dashboard-badge average-rating">
            <span class="badge-label">⭐ 평균 평점</span>
            <span class="badge-value">{{ averageFavoritesRating }} / 10</span>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useMovieStore } from './stores/movieStore';

const store = useMovieStore();
const router = useRouter();

// 헤더 검색창 입력값
const headerQuery = ref('');

// 검색 실행: 입력값을 쿼리로 실어 검색 결과 페이지로 이동
const goSearch = () => {
  const keyword = headerQuery.value.trim();
  if (!keyword) return;
  router.push({ name: 'search', query: { q: keyword } });
  headerQuery.value = '';
};

// 세션 스토리지 기반 실시간 찜 개수
const totalFavoritesCount = computed(() => store.favorites.length);

// TMDB vote_average 기준 찜 목록 평균 평점
const averageFavoritesRating = computed(() => {
  if (store.favorites.length === 0) return '0.0';
  const sum = store.favorites.reduce((acc, movie) => acc + movie.vote_average, 0);
  return (sum / store.favorites.length).toFixed(1);
});
</script>

<style scoped>
.app-container { font-family: "Noto Sans KR", sans-serif; background-color: #f8f9fa; min-height: 100vh; display: flex; flex-direction: column; }
.main-header { background-color: #1e272e; color: #ffffff; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); padding: 0 40px; }
.header-content { max-width: 1200px; margin: 0 auto; height: 80px; display: flex; align-items: center; justify-content: space-between; }

.logo-zone { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #ffffff; }
.logo-icon { font-size: 28px; }
.logo-text { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(45deg, #ff4757, #ff6b81); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.nav-menu { display: flex; gap: 30px; }
.nav-item { color: #ced5e0; text-decoration: none; font-size: 16px; font-weight: 700; transition: color 0.2s ease; padding: 8px 12px; border-radius: 6px; }
.nav-item:hover { color: #ffffff; background-color: rgba(255, 255, 255, 0.05); }
.router-link-active.nav-item { color: #ff4757; background-color: rgba(255, 87, 87, 0.1); }

/* 헤더 검색 폼 */
.header-search-form { display: flex; align-items: center; gap: 6px; }
.header-search-input {
  padding: 8px 16px;
  border: 1px solid #3f4656;
  background: #2f3542;
  color: #fff;
  border-radius: 30px;
  font-size: 14px;
  outline: none;
  width: 180px;
  transition: border-color 0.2s, width 0.3s;
}
.header-search-input::placeholder { color: #747d8c; }
.header-search-input:focus { border-color: #ff4757; width: 220px; }
.header-search-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
}

.header-dashboard { display: flex; gap: 15px; }
.dashboard-badge { background-color: #2f3542; padding: 10px 16px; border-radius: 30px; display: flex; align-items: center; gap: 8px; border: 1px solid #3f4656; }
.badge-label { font-size: 13px; color: #a4b0be; font-weight: 500; }
.badge-value { font-size: 14px; font-weight: 800; color: #ffffff; }
.average-rating .badge-value { color: #e1b12c; }

.main-content { flex-grow: 1; width: 100%; box-sizing: border-box; }
</style>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();

// 정렬 기준: 기본값 인기순(popularity)
const sortKey = ref('popularity');
// 정렬 방향: 각 기준의 기본 방향을 별도 관리
const sortDir = ref('desc'); // 'asc' | 'desc'

// 페이지네이션: 현재 페이지, 1페이지당 표시할 카드 수
const currentPage = ref(1);
const PAGE_SIZE = 8;

onMounted(() => {
  store.fetchMovies();
  document.title = '🍿 국내 극장 화제작';
});

// 버튼 레이블에 현재 방향 화살표를 붙여 반환
const sortButtons = computed(() => [
  { key: 'popularity',   labelBase: '🔥 인기',  dirLabel: null },
  { key: 'title',        labelBase: '🔤 제목',  dirLabel: sortKey.value === 'title'        ? (sortDir.value === 'asc' ? ': 가나다순' : ': 가나다역순')   : ': 가나다순' },
  { key: 'release_date', labelBase: '📅 개봉일', dirLabel: sortKey.value === 'release_date' ? (sortDir.value === 'desc' ? ': 최신순' : ': 오래된순') : ': 최신순' },
  { key: 'vote_average', labelBase: '⭐ 평점',  dirLabel: sortKey.value === 'vote_average' ? (sortDir.value === 'desc' ? ': 높은순' : ': 낮은순')  : ': 높은순' },
]);

// 정렬 기준에 따라 원본 배열을 복사 후 방향까지 적용해 재배열 (원본 불변 유지)
const sortedMovies = computed(() => {
  const list = [...store.movies];
  const dir = sortDir.value === 'asc' ? 1 : -1;

  if (sortKey.value === 'title') {
    // 가나다 기준 문자열 비교, dir로 방향 전환
    list.sort((a, b) => a.title.localeCompare(b.title, 'ko') * dir);
  } else if (sortKey.value === 'release_date') {
    // ISO 날짜 문자열 비교, dir로 최신/오래된순 전환
    list.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || '') * dir);
  } else if (sortKey.value === 'vote_average') {
    // 숫자 비교, dir로 높은/낮은순 전환
    list.sort((a, b) => (a.vote_average - b.vote_average) * dir);
  }
  // popularity: API 응답 기본 순서 유지 (방향 미적용)
  return list;
});

// 전체 페이지 수
const totalPages = computed(() => Math.ceil(sortedMovies.value.length / PAGE_SIZE));

// 현재 페이지에 해당하는 카드만 슬라이싱
const displayedMovies = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return sortedMovies.value.slice(start, start + PAGE_SIZE);
});

// 같은 키를 다시 누르면 방향 토글, 다른 키면 해당 기준의 기본 방향으로 초기화
const changeSort = (key) => {
  if (sortKey.value === key && key !== 'popularity') {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    // 기준별 기본 방향: 제목은 오름차순, 나머지는 내림차순
    sortDir.value = key === 'title' ? 'asc' : 'desc';
  }
  currentPage.value = 1;
};
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>🍿 국내 극장 화제작</h1>
      <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
    </div>

    <!-- 정렬 컨트롤 바 -->
    <div class="sort-bar">
      <span class="sort-label">정렬 기준</span>
      <button
        v-for="btn in sortButtons"
        :key="btn.key"
        @click="changeSort(btn.key)"
        :class="['sort-btn', { active: sortKey === btn.key }]"
      >
        {{ btn.labelBase }}{{ sortKey === btn.key && btn.dirLabel ? btn.dirLabel : '' }}
      </button>
    </div>

    <div v-if="store.isLoading" class="status-message loading">
      ⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...
    </div>

    <div v-else-if="store.errorMessage" class="status-message error">
      🚨 {{ store.errorMessage }}
    </div>

    <template v-else>
      <div class="movie-list">
        <div v-for="movie in displayedMovies" :key="movie.id" class="movie-card">
          <img
            v-if="movie.poster_path"
            :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
            :alt="movie.title"
            class="poster"
          />
          <div v-else class="poster-placeholder">이미지 준비 중</div>

          <div class="card-content">
            <h3 class="title">{{ movie.title }}</h3>
            <p v-if="movie.release_date" class="release-date">
              📅 개봉일: {{ movie.release_date }}
            </p>
            <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }} / 10</p>
            <p class="overview">
              {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 줄거리 요약 정보가 없습니다.' }}
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

      <!-- 페이지네이션 컨트롤 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >‹</button>

        <button
          v-for="n in totalPages"
          :key="n"
          @click="currentPage = n"
          :class="['page-btn', { active: currentPage === n }]"
        >
          {{ n }}
        </button>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >›</button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page { padding: 40px; background-color: #f8f9fa; min-height: 100vh; }
.header-section { margin-bottom: 24px; text-align: center; color: #232c50; }
.sub-title { font-size: 14px; color: #7f8c8d; margin-top: 5px; }

/* 정렬 바 */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.sort-label { font-size: 14px; color: #7f8c8d; font-weight: 600; margin-right: 4px; }
.sort-btn {
  padding: 8px 18px;
  border: 2px solid #dee2e6;
  background: #fff;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}
.sort-btn:hover { border-color: #ff4757; color: #ff4757; }
.sort-btn.active { background: #ff4757; border-color: #ff4757; color: #fff; }

.status-message { text-align: center; font-size: 20px; font-weight: bold; padding: 50px; border-radius: 12px; }
.loading { color: #3498db; background-color: #e3f2fd; }
.error { color: #e74c3c; background-color: #fdeaea; }

.movie-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
.movie-card:hover { transform: translateY(-5px); }
.poster { width: 100%; height: 380px; object-fit: cover; }
.poster-placeholder { width: 100%; height: 380px; background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #7f8c8d; font-weight: bold; }
.card-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
.title { font-size: 18px; color: #333; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; }
.release-date { font-size: 13px; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; }
.rating { font-weight: bold; color: #f39c12; margin-bottom: 10px; font-size: 16px; }
.overview { font-size: 13px; color: #555; line-height: 1.4; margin-bottom: 20px; flex-grow: 1; }
.fav-btn.active { background: #ff4757; color: white; }

.movie-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  text-align: left;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
}

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

.stretched-link {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 48px;
}
.page-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #dee2e6;
  background: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { border-color: #ff4757; color: #ff4757; }
.page-btn.active { background: #ff4757; border-color: #ff4757; color: #fff; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>

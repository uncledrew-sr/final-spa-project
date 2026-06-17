<script setup>
import { computed, onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();

onMounted(() => {
  document.title = '❤️ 내 찜 목록 | NETVUE';
});

// 찜한 영화들의 평균 평점 집계
const averageRating = computed(() => {
  if (store.favorites.length === 0) return '0.0';
  const total = store.favorites.reduce((acc, m) => acc + m.vote_average, 0);
  return (total / store.favorites.length).toFixed(1);
});
</script>

<template>
  <main class="page">
    <div class="header-section">
      <h1>❤️ 내 찜 목록</h1>
      <p class="sub-title">내가 찜한 영화를 한눈에 모아볼 수 있는 공간입니다</p>
    </div>

    <!-- 찜 목록 요약 대시보드 -->
    <div v-if="store.favorites.length > 0" class="dashboard">
      <div class="dashboard-card">
        <span class="d-label">찜한 작품 수</span>
        <span class="d-value">{{ store.favorites.length }}편</span>
      </div>
      <div class="dashboard-card">
        <span class="d-label">평균 평점</span>
        <span class="d-value highlight">⭐ {{ averageRating }}</span>
      </div>
    </div>

    <!-- 찜 목록이 비어있을 때 안내 -->
    <div v-if="store.favorites.length === 0" class="empty-guide">
      <span class="empty-icon">🎬</span>
      <p>아직 찜한 영화가 없습니다.</p>
      <RouterLink to="/movies" class="go-movies-btn">영화 목록 보러가기</RouterLink>
    </div>

    <!-- 찜한 영화 카드 목록 -->
    <div v-else class="movie-list">
      <div v-for="movie in store.favorites" :key="movie.id" class="movie-card">
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
          <!-- 찜 해제 버튼: z-index 2로 stretched-link 위에 배치 -->
          <button
            @click="store.toggleFavorite(movie.id)"
            class="fav-btn active"
          >
            ❤️ 찜 해제
          </button>
        </div>
        <RouterLink
          :to="`/movies/${movie.id}`"
          class="stretched-link"
          :aria-label="`${movie.title} 상세 정보 보기`"
        ></RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page { padding: 40px; background-color: #f8f9fa; min-height: 100vh; }
.header-section { margin-bottom: 28px; text-align: center; color: #232c50; }
.sub-title { font-size: 14px; color: #7f8c8d; margin-top: 5px; }

/* 찜 현황 요약 대시보드 */
.dashboard {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}
.dashboard-card {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 16px;
  padding: 20px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.d-label { font-size: 13px; color: #7f8c8d; font-weight: 600; }
.d-value { font-size: 28px; font-weight: 900; color: #1e272e; }
.d-value.highlight { color: #f39c12; }

/* 빈 화면 안내 */
.empty-guide {
  text-align: center;
  padding: 80px 20px;
  color: #7f8c8d;
}
.empty-icon { font-size: 56px; display: block; margin-bottom: 16px; }
.empty-guide p { font-size: 18px; margin-bottom: 24px; }
.go-movies-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #ff4757;
  color: #fff;
  border-radius: 40px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  transition: background 0.2s;
}
.go-movies-btn:hover { background: #e84040; }

/* 카드 그리드 */
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

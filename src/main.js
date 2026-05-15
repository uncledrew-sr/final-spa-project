import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Pinia 불러오기
import App from './App.vue';
import router from './router';

const app = createApp(App);

// 앱에 라우터와 피니아(중앙 금고)를 장착합니다.
app.use(createPinia());
app.use(router);

app.mount('#app');
// main.js 는 vue 애플리케이션의 시작점이다
// 저장하면 바로 빌드되서 화면에 바로 적용된다.
import { createApp } from 'vue'
import App from './App.vue'
// src/router/index.js 파일의 router를 사용하겠다라는 선언
import router from '@/router/index.js'
import vuetify from './plugins/vuetify';
import '@mdi/font/css/materialdesignicons.css'
import axios from 'axios';
import store from './store';

// createApp(App).mount('#app')
const app = createApp(App);


// axios요청 인터셉터를 설정하여 모든 요청에 엑세스 토큰을 포함
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 해당 인터셉터가 무시되고, 사용자의 본래요청인 화면으로 라우팅
        return Promise.reject(error);
    }
)

// 401읍답을 받을 경우에 interceptor를 통해 전역적으로 rt를 통한 at 재발급
// 만약 rt도 401응답을 받을 경우에 token제거 후 login화면으로 리다이렉트
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                localStorage.removeItem('token');
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/refresh-token`, { refreshToken });
                localStorage.setItem('token', response.data.result.token);
                window.location.reload();
            } catch (e) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error)
    }
)


app.use(store);
app.use(router);
app.use(vuetify);
app.mount("#app");
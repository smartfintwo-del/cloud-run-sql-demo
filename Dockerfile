# 1단계: 빌더 이미지 설정
FROM node:18-alpine 

# 작업 디렉토리 설정
WORKDIR /app

# 2단계: 의존성 파일만 먼저 복사 (캐싱 최적화)
# package.json과 package-lock.json이 반드시 이 시점에 /app에 존재해야 합니다.
COPY package.json package-lock.json ./

# 3단계: 의존성 설치 (npm ci가 성공하는 지점)
RUN npm ci --omit=dev

# 4단계: 나머지 애플리케이션 파일 복사
# backend와 frontend 폴더의 내용을 복사합니다.
COPY backend ./backend
COPY frontend ./frontend

# 5단계: 환경 설정 및 실행 명령어
ENV PORT=8080
EXPOSE 8080

# 백엔드 디렉토리로 이동 후 npm start를 실행하는 올바른 CMD 형식
CMD ["sh", "-c", "cd backend && npm start"]

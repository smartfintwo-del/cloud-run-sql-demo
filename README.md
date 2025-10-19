
# Cloud Run × Cloud SQL (Postgres) – Minimal Workshop

## DB 스키마
`backend/database/schema.sql` 실행

## Cloud Run 환경변수
- `CLOUD_SQL_CONNECTION_NAME` : `<project>:<region>:<instance>`
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- (선택) `UPLOAD_USER`, `UPLOAD_PASS`

## 빌드/배포
- 컨테이너 이미지 빌드 후 Cloud Run에 배포
- Cloud Run Connections에서 Cloud SQL 인스턴스 추가

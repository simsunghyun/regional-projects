# 권역별 발전계획 · 사업과 근거

2026-10-31 사이트 전체 전달본 / 데이터 기준일 2026-10-30

## GitHub에 올리기
1. ZIP을 해제합니다. ZIP 파일 자체가 아니라 해제한 파일과 폴더를 저장소에 올립니다.
2. 저장소 최상위에 index.html, app.js, style.css, data/, assets/, downloads/가 있어야 합니다.
3. GitHub 저장소 Settings → Pages → Build and deployment에서 Source를 Deploy from a branch로 선택합니다.
4. Branch는 업로드한 브랜치(일반적으로 main), 폴더는 /(root)를 선택하고 Save 합니다.
5. 배포가 완료되면 Pages에 표시된 주소로 접속합니다.

파일이 1,300개 이상이므로 GitHub Desktop 등으로 폴더 전체를 커밋·푸시하는 방법이 편리합니다.
별도 설치나 빌드, API 키, 서버 프로그램은 필요하지 않습니다. .nojekyll 파일도 함께 올려 주세요.
공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 포함 내용
- 전체 1,312개 사업 데이터, 원문에서 추출한 근거와 출처·위치, 공개자료 연결 및 확인 수준
- 권역·원문 부처 탐색, 지식그래프, 사업 수·예산 비교, 복수 부처 반복 집계
- 사업 선택, 선택 사업 요약, 권역·부처별 선택 사업 펼치기
- 전체 선택 또는 펼친 사업만 Excel 다운로드: 요약·근거·확인 수준 포함
- 다운로드용 원본 분석 엑셀·JSON, 이미지와 위원회 로고
- developer-source/: 개발 당시 보조 소스·검증·가공 스크립트 참고본

## 파일 수정·운영
실제 실행 파일은 최상위 app.js, xlsx-export.js, style.css, index.html입니다.
developer-source의 가공 스크립트는 개발 환경 경로와 실행 순서에 의존하는 참고본이며, 사이트 실행에는 필요하지 않습니다.
엑셀의 사업 상세 링크는 현재 접속한 사이트 주소를 사용하도록 변경했습니다. 저장소 하위 경로에서도 동작합니다.
선택 목록은 브라우저에 저장되므로 기존 사이트에서 선택한 목록이 새 GitHub 주소로 자동 이동하지는 않습니다.
로컬 확인은 이 폴더에서 python -m http.server 8766 실행 후 http://localhost:8766/ 접속으로 가능합니다.

## 자료 범위
원문 근거는 기존 사이트에 수록된 발췌·파일명·위치입니다. 별도의 전체 원자료 PDF/HWP/DOCX 파일은 이 ZIP에 추가하지 않았습니다.
부처 연결은 원문 표기 기준이며 소관 확정이 아닙니다. 보류·미확인 금액은 0으로 치환하지 않습니다.
원문·공개자료·로고의 출처는 사이트에 표시되어 있습니다. 이 패키지에 별도의 포괄적 오픈소스 라이선스를 부여하지 않았습니다.
기존 Sites 배포 설정·인증정보·Git 이력·테스트 다운로드 파일은 포함하지 않았습니다.

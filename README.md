## **1. 브랜치 구조**

| 브랜치 유형 | 브랜치 이름 예시 | 설명 |
| --- | --- | --- |
| **메인 (배포)** | `main` | 🚀 최종 배포 브랜치 (직접 작업 금지) |
| **개발 (통합)** | `dev` | 🛠 기능 개발이 모이는 브랜치 |
| **기능 개발** | `feature/기능명` | 각자 개발할 기능별 브랜치 (예: `feature/login`) |
| **버그 수정** | `fix/버그명` | 특정 버그 수정 브랜치 (예: `fix/upload-error`) |

✅ **기능 개발은 `dev`에서 새로운 브랜치를 만들어 진행**

✅ 기능이 완성되면 **PR(Pull Request) 생성 후 `dev`에 머지**

---

## **2. 브랜치 생성 및 작업 흐름**

### 📌 **기능 개발 시 브랜치 생성**

```bash
git checkout dev  # 항상 dev에서 브랜치를 만든다
git pull origin dev  # 최신 코드 가져오기
git checkout -b feature/기능명  # 새 기능 브랜치 생성
```

### 🛠 **코드 수정 & 커밋**

```bash
git add .
git commit -m "Feat: 기능 추가 설명"
```

### 🚀 **원격 저장소에 푸시**

```bash
git push origin feature/기능명
```

### ✅ **PR(Pull Request) 생성 후 코드 리뷰**

- GitHub에서 `feature/기능명` → `dev`로 **PR 생성**
- 팀원 코드 리뷰 후 `dev` 브랜치로 머지

### 🔄 **다음 기능 개발 시, `dev` 브랜치 최신 코드 가져오기**

```bash
git checkout dev
git pull origin dev
```

---

## **3. 충돌 방지 및 해결 방법**

### **🚨 같은 파일을 여러 명이 수정하면 충돌 가능 → 충돌 방법**

1️⃣ **작업 전 최신 코드 가져오기**

```bash
git checkout dev
git pull origin dev
```

2️⃣ **충돌 가능성이 있는 파일을 조심해서 작업**

3️⃣ **PR을 만들기 전에 `dev` 최신 코드 반영**

```bash
git checkout feature/기능명
git merge dev  # dev 브랜치 최신 코드 가져오기
```

4️⃣ **충돌 발생 시 직접 해결 후 커밋 & 푸시**

```bash
git add .
git commit -m "Fix: 충돌 해결"
git push origin feature/기능명
```

---

## **4. 최종 배포 (dev → main)**

모든 기능이 `dev`에 머지되었으면, 테스트 후 `main`에 반영합니다.

```bash
git checkout main
git merge dev  # dev 브랜치의 변경 사항을 main에 적용
git push origin main
```

---

## **5. 최종 정리 (Git 브랜치 전략)**

✅ `main` - **배포용 (절대 직접 작업 X)**

✅ `dev` - **개발용 (모든 기능 브랜치를 머지)**

✅ `feature/기능명` - **각자 기능 개발 (완성되면 `dev`로 PR)**

✅ `fix/버그명` - **버그 수정 (완성되면 `dev`로 PR)**

📢 **⚠️ 주의: `main`에서 직접 작업하지 말고, 항상 `dev`에서 새 브랜치를 만들 것!**

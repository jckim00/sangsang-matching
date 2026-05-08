import { test, expect } from "@playwright/test";
import { resetDb, insertJob, getLatestSenior } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
  await insertJob({
    title: "서울 경비직",
    region: "서울",
    job_type: "경비",
    required_career: 3,
  });
});

test("정상 시나리오: 시니어 등록 → 성공 메시지 → 6점 금색 배지 표시", async ({
  page,
}) => {
  await page.goto("/register");

  // 이름 입력
  await page.fill("#name", "테스트시니어");

  // 지역 선택
  await page.getByText("지역을 선택하세요").click();
  await page.getByRole("option", { name: "서울" }).click();

  // 희망 직종 선택
  await page.getByText("직종을 선택하세요").click();
  await page.getByRole("option", { name: "경비" }).click();

  // 경력 입력
  await page.fill("#career_years", "5");

  // 제출
  await page.getByRole("button", { name: "프로필 등록하기" }).click();

  // 성공 메시지 확인 (초록 박스)
  await expect(page.getByText("등록이 완료되었습니다")).toBeVisible({
    timeout: 15_000,
  });

  // DB에서 방금 생성된 senior_id 조회
  const senior = await getLatestSenior();

  // 추천 목록 페이지 이동
  await page.goto(`/recommendations?senior_id=${senior.id}`);

  // 6점 금색 배지 카드가 최상단에 노출
  await expect(page.getByText("최적 6점").first()).toBeVisible({
    timeout: 10_000,
  });
});

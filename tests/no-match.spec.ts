import { test, expect } from "@playwright/test";
import { resetDb, insertJob, getLatestSenior } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
  // 서울/경비 시니어와 절대 매칭되지 않는 공고
  // 점수 공식: 지역일치(3)+직종일치(2)+경력충족(1)
  // required_career=0 이면 3>=0 으로 1점 발생하므로 99로 설정해 경력 조건도 0점 처리
  await insertJob({
    title: "기타 직종",
    region: "기타",
    job_type: "기타",
    required_career: 99,
  });
});

test("엣지 시나리오: 매칭 없을 때 '현재 매칭되는 일자리가 없습니다' 표시", async ({
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
  await page.fill("#career_years", "3");

  // 제출
  await page.getByRole("button", { name: "프로필 등록하기" }).click();

  // 등록 성공 확인 후 senior_id 조회
  await expect(page.getByText("등록이 완료되었습니다")).toBeVisible({
    timeout: 15_000,
  });

  const senior = await getLatestSenior();

  // 추천 목록 페이지 이동
  await page.goto(`/recommendations?senior_id=${senior.id}`);

  // 매칭 없음 안내 박스 확인
  await expect(
    page.getByText("현재 매칭되는 일자리가 없습니다")
  ).toBeVisible({ timeout: 10_000 });
});

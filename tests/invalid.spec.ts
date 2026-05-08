import { test, expect } from "@playwright/test";
import { resetDb, insertJob, countSeniors } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
  await insertJob({
    title: "서울 경비직",
    region: "서울",
    job_type: "경비",
    required_career: 3,
  });
});

test("실패 시나리오: 이름 미입력 → 빨간 오류 박스 표시, DB 미삽입", async ({
  page,
}) => {
  await page.goto("/register");

  // 이름은 의도적으로 비워둠
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

  // 이름 필드 위 빨간 오류 박스 확인
  await expect(page.getByText("이름을 입력해 주세요")).toBeVisible({
    timeout: 5_000,
  });

  // seniors 테이블에 새 레코드가 없음을 확인
  const count = await countSeniors();
  expect(count).toBe(0);
});

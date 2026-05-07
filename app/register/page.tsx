import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">시니어 프로필 등록</h1>
      <p className="text-xl text-slate-500 mb-8">정보를 입력하시면 일자리를 추천해 드립니다</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="name">
                이름
              </label>
              <Input
                id="name"
                name="name"
                placeholder="홍길동"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="region">
                거주 지역
              </label>
              <Input
                id="region"
                name="region"
                placeholder="예: 서울 강남구"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="desired_job">
                희망 직종
              </label>
              <Input
                id="desired_job"
                name="desired_job"
                placeholder="예: 경비, 청소, 배달"
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="career_years">
                경력 (년수)
              </label>
              <Input
                id="career_years"
                name="career_years"
                type="number"
                placeholder="예: 5"
                min={0}
                className="h-14 text-xl px-4"
                disabled
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-16 text-2xl font-bold mt-2"
              disabled
            >
              프로필 등록하기
            </Button>
          </form>

          <p className="mt-4 text-center text-lg text-slate-400">
            — 기능 구현 예정 —
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">추천 매칭 목록</h1>
      <p className="text-xl text-slate-500 mb-8">매칭 점수가 높은 순서로 표시됩니다</p>

      {/* 필터/검색 자리 */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xl font-medium text-slate-600">필터</span>
        <Badge variant="secondary" className="text-lg px-4 py-1">지역</Badge>
        <Badge variant="secondary" className="text-lg px-4 py-1">직종</Badge>
        <Badge variant="secondary" className="text-lg px-4 py-1">경력</Badge>
        <span className="ml-auto text-lg text-slate-400">— 필터 기능 구현 예정 —</span>
      </div>

      {/* 매칭 카드 목록 자리 */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl text-slate-400">시니어 이름 #{i}</CardTitle>
              <Badge className="text-xl px-4 py-1 bg-slate-200 text-slate-500">
                매칭 점수: —
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-xl text-slate-400">
                <div>
                  <span className="font-medium">희망 직종</span>
                  <p className="mt-1">—</p>
                </div>
                <div>
                  <span className="font-medium">지역</span>
                  <p className="mt-1">—</p>
                </div>
                <div>
                  <span className="font-medium">경력</span>
                  <p className="mt-1">—</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xl text-slate-400 font-medium mb-2">추천 일자리</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1 text-slate-400">—</Badge>
                </div>
              </div>
              <Button size="lg" className="mt-4 h-12 text-xl w-full" disabled>
                매칭 확정
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xl text-slate-400">
        — 매칭 데이터 로딩 기능 구현 예정 —
      </p>
    </div>
  );
}

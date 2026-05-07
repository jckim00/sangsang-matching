import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusColumns = [
  {
    key: "unmatched",
    label: "미매칭",
    count: 0,
    badgeVariant: "destructive" as const,
    description: "아직 매칭되지 않은 시니어",
  },
  {
    key: "pending",
    label: "매칭 대기",
    count: 0,
    badgeVariant: "secondary" as const,
    description: "매칭 확정 대기 중",
  },
  {
    key: "assigned",
    label: "배정 완료",
    count: 0,
    badgeVariant: "default" as const,
    description: "일자리 배정 완료",
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-slate-500 mb-8">매칭 전체 현황을 관리합니다</p>

      {/* 요약 카드 3개 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {statusColumns.map((col) => (
          <Card key={col.key} className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{col.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={col.badgeVariant} className="text-4xl px-6 py-2 rounded-xl">
                {col.count}
              </Badge>
              <p className="mt-3 text-lg text-slate-500">{col.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 탭별 목록 */}
      <Tabs defaultValue="unmatched">
        <TabsList className="h-14 text-lg mb-6 w-full">
          {statusColumns.map((col) => (
            <TabsTrigger
              key={col.key}
              value={col.key}
              className="flex-1 text-xl h-12"
            >
              {col.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {statusColumns.map((col) => (
          <TabsContent key={col.key} value={col.key}>
            <div className="flex flex-col gap-4">
              {/* 빈 상태 자리 */}
              <Card className="border-dashed opacity-50">
                <CardContent className="py-12 text-center">
                  <p className="text-2xl text-slate-400 mb-4">
                    {col.label} 목록이 여기에 표시됩니다
                  </p>
                  <p className="text-xl text-slate-400 mb-6">
                    — 데이터 로딩 기능 구현 예정 —
                  </p>
                  <Button size="lg" className="h-12 text-xl px-8" disabled>
                    {col.key === "unmatched" && "매칭 실행"}
                    {col.key === "pending" && "일괄 확정"}
                    {col.key === "assigned" && "배정 내역 보기"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

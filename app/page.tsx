import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-10 py-10">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">상상우리</h1>
        <p className="text-2xl text-slate-600">시니어 ↔ 일자리 자동 매칭 시스템</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">프로필 등록</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-lg text-slate-600">
              이름, 지역, 희망 직종, 경력을 등록하세요
            </p>
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "text-xl h-14 w-full")}>
              등록하러 가기
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">추천 목록</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-lg text-slate-600">
              점수순 자동 매칭 결과를 확인하세요
            </p>
            <Link href="/recommendations" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "text-xl h-14 w-full")}>
              확인하러 가기
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">담당자 대시보드</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-lg text-slate-600">
              매칭 현황을 한눈에 관리하세요
            </p>
            <Link href="/admin" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-xl h-14 w-full")}>
              대시보드 열기
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

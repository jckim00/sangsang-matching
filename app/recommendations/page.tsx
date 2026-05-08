"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MatchCard = {
  id: string;
  score: number;
  status: string;
  jobs: { title: string; region: string; job_type: string; required_career: number } | null;
};

function scoreBadge(score: number) {
  if (score >= 6) return { label: "매우 적합", className: "bg-yellow-100 text-yellow-800 border border-yellow-300" };
  if (score >= 4) return { label: "적합", className: "bg-green-100 text-green-800 border border-green-300" };
  return { label: "보통", className: "bg-slate-100 text-slate-600 border border-slate-300" };
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const seniorId = searchParams.get("senior_id");

  const [matches, setMatches]     = useState<MatchCard[]>([]);
  const [seniorName, setSeniorName] = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!seniorId) { setLoading(false); return; }

    async function fetchData() {
      const [seniorRes, matchRes] = await Promise.all([
        supabase.from("seniors").select("name").eq("id", seniorId).single(),
        supabase
          .from("matches")
          .select("id, score, status, jobs(title, region, job_type, required_career)")
          .eq("senior_id", seniorId)
          .gt("score", 0)
          .order("score", { ascending: false }),
      ]);
      if (seniorRes.data) setSeniorName(seniorRes.data.name);
      setMatches((matchRes.data as MatchCard[]) ?? []);
      setLoading(false);
    }
    fetchData();
  }, [seniorId]);

  if (!seniorId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 px-8 py-12">
          <p className="text-2xl font-bold text-slate-600 mb-3">시니어 ID가 필요합니다</p>
          <p className="text-xl text-slate-400">URL 예시: /recommendations?senior_id=xxx</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        {seniorName ? `${seniorName} 님께 맞는 일자리` : "추천 일자리 목록"}
      </h1>
      {seniorName && (
        <p className="text-xl text-slate-500 mb-8">점수 높은 순으로 보여드립니다</p>
      )}

      {loading && <p className="text-xl text-slate-400 text-center py-16">불러오는 중...</p>}

      {!loading && matches.length === 0 && (
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 px-8 py-12 text-center">
          <p className="text-2xl font-bold text-slate-500 mb-3">현재 매칭되는 일자리가 없습니다</p>
          <p className="text-xl text-slate-400 mb-2">일자리 정보가 등록되면 자동으로 매칭됩니다</p>
          <p className="text-xl text-slate-500 font-medium">담당자가 직접 연락드리니 잠시만 기다려 주세요</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {matches.map((match) => {
          const badge = scoreBadge(match.score);
          const job   = match.jobs;
          return (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-slate-900 mb-3">
                      {job?.title ?? "—"}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-lg text-slate-600">
                      <div>
                        <p className="font-medium text-slate-500 text-base mb-1">지역</p>
                        <p className="font-semibold">{job?.region ?? "—"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-base mb-1">직종</p>
                        <p className="font-semibold">{job?.job_type ?? "—"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500 text-base mb-1">요구 경력</p>
                        <p className="font-semibold">{job?.required_career ?? 0}년 이상</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="text-5xl font-bold text-slate-900">{match.score}</span>
                    <span className="text-lg text-slate-400">/ 6점</span>
                    <Badge className={`text-lg px-4 py-1 ${badge.className}`}>
                      {badge.label}
                    </Badge>
                    {match.status === "assigned" && (
                      <Badge className="text-base bg-blue-100 text-blue-800 border border-blue-300">배정 완료</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={<p className="text-xl text-slate-400 text-center py-16">불러오는 중...</p>}>
      <RecommendationsContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase, type Job, type Senior } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOBS    = ["경비", "청소", "조리", "돌봄", "기타"];

type MatchRow = { senior_id: string; job_id: string; score: number; status: string };
type SeniorStat = Senior & { bestScore: number; matchStatus: "unmatched" | "pending" | "assigned" };

function computeStats(seniors: Senior[], matches: MatchRow[]): SeniorStat[] {
  return seniors.map(s => {
    const sm = matches.filter(m => m.senior_id === s.id && m.score > 0);
    const bestScore = sm.length > 0 ? Math.max(...sm.map(m => m.score)) : 0;
    let matchStatus: SeniorStat["matchStatus"] = "unmatched";
    if (sm.some(m => m.status === "assigned" || m.status === "done")) matchStatus = "assigned";
    else if (sm.some(m => m.status === "pending")) matchStatus = "pending";
    return { ...s, bestScore, matchStatus };
  });
}

type JobForm   = { title: string; region: string; job_type: string; required_career: string };
type JobErrors = Partial<Record<keyof JobForm, string>>;

export default function AdminPage() {
  const [stats, setStats]           = useState<SeniorStat[]>([]);
  const [jobs, setJobs]             = useState<Job[]>([]);
  const [jobForm, setJobForm]       = useState<JobForm>({ title: "", region: "", job_type: "", required_career: "" });
  const [jobErrors, setJobErrors]   = useState<JobErrors>({});
  const [jobSuccess, setJobSuccess] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const [seniorRes, matchRes, jobRes] = await Promise.all([
      supabase.from("seniors").select("*").order("created_at", { ascending: false }),
      supabase.from("matches").select("senior_id, job_id, score, status"),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    ]);
    setStats(computeStats((seniorRes.data ?? []) as Senior[], (matchRes.data ?? []) as MatchRow[]));
    setJobs((jobRes.data ?? []) as Job[]);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 집계
  const unmatched = stats.filter(s => s.matchStatus === "unmatched").length;
  const pending   = stats.filter(s => s.matchStatus === "pending").length;
  const assigned  = stats.filter(s => s.matchStatus === "assigned").length;

  // 일자리 추가
  function validateJob(): JobErrors {
    const e: JobErrors = {};
    if (!jobForm.title.trim()) e.title    = "공고명을 입력해 주세요.";
    if (!jobForm.region)       e.region   = "지역을 선택해 주세요.";
    if (!jobForm.job_type)     e.job_type = "직종을 선택해 주세요.";
    return e;
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    setJobSuccess(false);
    const errs = validateJob();
    setJobErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setJobLoading(true);
    const { data: newJob, error } = await supabase
      .from("jobs")
      .insert({ title: jobForm.title.trim(), region: jobForm.region, job_type: jobForm.job_type, required_career: Number(jobForm.required_career) || 0 })
      .select()
      .single();

    if (error) { setJobErrors({ title: "저장 중 오류: " + error.message }); setJobLoading(false); return; }

    // 일자리 등록 즉시 자동 재매칭 (RPC)
    await supabase.rpc("rematch_job", { p_job_id: newJob.id });

    setJobLoading(false);
    setJobSuccess(true);
    setJobForm({ title: "", region: "", job_type: "", required_career: "" });
    setJobErrors({});
    fetchAll();
  }

  async function handleDeleteJob(id: string) {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(prev => prev.filter(j => j.id !== id));
  }

  // 상태 배지
  function statusBadge(s: SeniorStat["matchStatus"]) {
    if (s === "assigned") return <Badge className="text-base bg-blue-100 text-blue-800 border border-blue-300">배정 완료</Badge>;
    if (s === "pending")  return <Badge className="text-base bg-green-100 text-green-800 border border-green-300">대기 중</Badge>;
    return <Badge variant="outline" className="text-base text-slate-500">미매칭</Badge>;
  }

  // 점수 색상
  function scoreColor(score: number) {
    if (score >= 6) return "text-yellow-700 font-bold";
    if (score >= 4) return "text-green-700 font-bold";
    if (score >= 1) return "text-slate-600";
    return "text-slate-400";
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-slate-500 mb-8">매칭 현황과 일자리를 관리합니다</p>

      <Tabs defaultValue="dashboard">
        <TabsList className="h-14 mb-8 w-full">
          <TabsTrigger value="dashboard" className="flex-1 text-xl h-12">시니어 현황</TabsTrigger>
          <TabsTrigger value="jobs"      className="flex-1 text-xl h-12">일자리 관리</TabsTrigger>
        </TabsList>

        {/* ── 시니어 현황 탭 ── */}
        <TabsContent value="dashboard">
          {/* 집계 카드 3개 */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { label: "미매칭", count: unmatched, cls: "text-red-600",  desc: "매칭 없거나 0점" },
              { label: "매칭 대기", count: pending,   cls: "text-green-600", desc: "pending 매칭 보유" },
              { label: "배정 완료", count: assigned,  cls: "text-blue-600",  desc: "assigned/done 완료" },
            ].map(c => (
              <Card key={c.label} className="text-center">
                <CardHeader className="pb-2"><CardTitle className="text-2xl">{c.label}</CardTitle></CardHeader>
                <CardContent>
                  <p className={`text-5xl font-bold ${c.cls}`}>{c.count}</p>
                  <p className="mt-2 text-lg text-slate-500">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 시니어 목록 테이블 */}
          <Card>
            <CardHeader><CardTitle className="text-2xl">시니어 목록 ({stats.length}명)</CardTitle></CardHeader>
            <CardContent>
              {stats.length === 0 ? (
                <p className="text-xl text-slate-400 text-center py-8">등록된 시니어가 없습니다</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xl">
                    <thead>
                      <tr className="border-b text-left text-slate-500">
                        <th className="pb-3 pr-4 font-semibold">이름</th>
                        <th className="pb-3 pr-4 font-semibold">지역</th>
                        <th className="pb-3 pr-4 font-semibold">희망 직종</th>
                        <th className="pb-3 pr-4 font-semibold text-right">최고 점수</th>
                        <th className="pb-3 pr-4 font-semibold">상태</th>
                        <th className="pb-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map(s => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="py-4 pr-4 font-semibold text-slate-900">{s.name}</td>
                          <td className="py-4 pr-4 text-slate-700">{s.region}</td>
                          <td className="py-4 pr-4 text-slate-700">{s.desired_job}</td>
                          <td className={`py-4 pr-4 text-right text-2xl ${scoreColor(s.bestScore)}`}>
                            {s.bestScore > 0 ? `${s.bestScore}점` : "—"}
                          </td>
                          <td className="py-4 pr-4">{statusBadge(s.matchStatus)}</td>
                          <td className="py-4">
                            <Button asChild variant="outline" size="sm" className="h-10 text-lg px-4">
                              <Link href={`/recommendations?senior_id=${s.id}`}>상세 보기</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 일자리 관리 탭 ── */}
        <TabsContent value="jobs">
          <div className="flex flex-col gap-8">
            <Card>
              <CardHeader><CardTitle className="text-2xl">일자리 추가</CardTitle></CardHeader>
              <CardContent>
                {jobSuccess && (
                  <div className="mb-4 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-4">
                    <p className="text-xl font-bold text-green-700">일자리가 등록되었습니다 ✓ 자동 매칭이 실행됐습니다.</p>
                  </div>
                )}
                <form onSubmit={handleAddJob} className="flex flex-col gap-5" noValidate>
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-medium text-slate-800">공고명 <span className="text-red-500">*</span></label>
                    {jobErrors.title && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{jobErrors.title}</p></div>}
                    <Input value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="예: 아파트 경비원 모집" className="h-14 text-xl px-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xl font-medium text-slate-800">지역 <span className="text-red-500">*</span></label>
                      {jobErrors.region && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{jobErrors.region}</p></div>}
                      <Select value={jobForm.region} onValueChange={v => setJobForm({ ...jobForm, region: v })}>
                        <SelectTrigger className="h-14 text-xl px-4"><SelectValue placeholder="지역 선택" /></SelectTrigger>
                        <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xl font-medium text-slate-800">직종 <span className="text-red-500">*</span></label>
                      {jobErrors.job_type && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{jobErrors.job_type}</p></div>}
                      <Select value={jobForm.job_type} onValueChange={v => setJobForm({ ...jobForm, job_type: v })}>
                        <SelectTrigger className="h-14 text-xl px-4"><SelectValue placeholder="직종 선택" /></SelectTrigger>
                        <SelectContent>{JOBS.map(j => <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-medium text-slate-800">요구 경력 (년수)</label>
                    <Input type="number" min={0} value={jobForm.required_career} onChange={e => setJobForm({ ...jobForm, required_career: e.target.value })} placeholder="예: 2" className="h-14 text-xl px-4" />
                  </div>
                  <Button type="submit" size="lg" className="h-14 text-xl font-bold" disabled={jobLoading}>
                    {jobLoading ? "저장 중..." : "일자리 등록"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-2xl">등록된 일자리 ({jobs.length}건)</CardTitle></CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-xl text-slate-400 text-center py-8">등록된 일자리가 없습니다</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xl">
                      <thead>
                        <tr className="border-b text-left text-slate-500">
                          <th className="pb-3 pr-4 font-semibold">공고명</th>
                          <th className="pb-3 pr-4 font-semibold">지역</th>
                          <th className="pb-3 pr-4 font-semibold">직종</th>
                          <th className="pb-3 pr-4 font-semibold">요구경력</th>
                          <th className="pb-3 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-4 pr-4 font-medium text-slate-900">{job.title}</td>
                            <td className="py-4 pr-4 text-slate-700">{job.region}</td>
                            <td className="py-4 pr-4"><Badge variant="secondary" className="text-lg px-3 py-1">{job.job_type}</Badge></td>
                            <td className="py-4 pr-4 text-slate-700">{job.required_career}년</td>
                            <td className="py-4">
                              <Button variant="destructive" size="sm" className="h-10 text-lg px-4" onClick={() => handleDeleteJob(job.id)}>삭제</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase, type Job } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOBS = ["경비", "청소", "조리", "돌봄", "기타"];

const statusColumns = [
  { key: "unmatched", label: "미매칭", badgeVariant: "destructive" as const, description: "아직 매칭되지 않은 시니어" },
  { key: "pending",   label: "매칭 대기", badgeVariant: "secondary" as const, description: "매칭 확정 대기 중" },
  { key: "assigned",  label: "배정 완료", badgeVariant: "default" as const, description: "일자리 배정 완료" },
];

type JobForm = { title: string; region: string; job_type: string; required_career: string };
type JobErrors = Partial<Record<keyof JobForm, string>>;

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobForm, setJobForm] = useState<JobForm>({ title: "", region: "", job_type: "", required_career: "" });
  const [jobErrors, setJobErrors] = useState<JobErrors>({});
  const [jobLoading, setJobLoading] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data);
  }

  function validateJob(): JobErrors {
    const e: JobErrors = {};
    if (!jobForm.title.trim()) e.title = "공고명을 입력해 주세요.";
    if (!jobForm.region) e.region = "지역을 선택해 주세요.";
    if (!jobForm.job_type) e.job_type = "직종을 선택해 주세요.";
    return e;
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    setJobSuccess(false);
    const errs = validateJob();
    setJobErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setJobLoading(true);
    const { error } = await supabase.from("jobs").insert({
      title: jobForm.title.trim(),
      region: jobForm.region,
      job_type: jobForm.job_type,
      required_career: Number(jobForm.required_career) || 0,
    });
    setJobLoading(false);

    if (error) {
      setJobErrors({ title: "저장 중 오류: " + error.message });
      return;
    }

    setJobSuccess(true);
    setJobForm({ title: "", region: "", job_type: "", required_career: "" });
    setJobErrors({});
    fetchJobs();
  }

  async function handleDeleteJob(id: string) {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">담당자 대시보드</h1>
      <p className="text-xl text-slate-500 mb-8">매칭 전체 현황과 일자리를 관리합니다</p>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {statusColumns.map((col) => (
          <Card key={col.key} className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{col.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={col.badgeVariant} className="text-4xl px-6 py-2 rounded-xl">0</Badge>
              <p className="mt-3 text-lg text-slate-500">{col.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="unmatched">
        <TabsList className="h-14 mb-6 w-full">
          {statusColumns.map((col) => (
            <TabsTrigger key={col.key} value={col.key} className="flex-1 text-xl h-12">
              {col.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="jobs" className="flex-1 text-xl h-12">
            일자리 관리
          </TabsTrigger>
        </TabsList>

        {/* 매칭 현황 탭 (뼈대 유지) */}
        {statusColumns.map((col) => (
          <TabsContent key={col.key} value={col.key}>
            <Card className="border-dashed opacity-50">
              <CardContent className="py-12 text-center">
                <p className="text-2xl text-slate-400 mb-4">{col.label} 목록이 여기에 표시됩니다</p>
                <p className="text-xl text-slate-400">— 매칭 로직 구현 예정 —</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* 일자리 관리 탭 */}
        <TabsContent value="jobs">
          <div className="flex flex-col gap-8">

            {/* 일자리 추가 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">일자리 추가</CardTitle>
              </CardHeader>
              <CardContent>
                {jobSuccess && (
                  <div className="mb-4 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-4">
                    <p className="text-xl font-bold text-green-700">일자리가 등록되었습니다 ✓</p>
                  </div>
                )}
                <form onSubmit={handleAddJob} className="flex flex-col gap-5" noValidate>
                  {/* 공고명 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-medium text-slate-800">
                      공고명 <span className="text-red-500">*</span>
                    </label>
                    {jobErrors.title && (
                      <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2">
                        <p className="text-lg text-red-600">{jobErrors.title}</p>
                      </div>
                    )}
                    <Input
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      placeholder="예: 아파트 경비원 모집"
                      className="h-14 text-xl px-4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 지역 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xl font-medium text-slate-800">
                        지역 <span className="text-red-500">*</span>
                      </label>
                      {jobErrors.region && (
                        <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2">
                          <p className="text-lg text-red-600">{jobErrors.region}</p>
                        </div>
                      )}
                      <Select value={jobForm.region} onValueChange={(v) => setJobForm({ ...jobForm, region: v })}>
                        <SelectTrigger className="h-14 text-xl px-4">
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map((r) => (
                            <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 직종 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xl font-medium text-slate-800">
                        직종 <span className="text-red-500">*</span>
                      </label>
                      {jobErrors.job_type && (
                        <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2">
                          <p className="text-lg text-red-600">{jobErrors.job_type}</p>
                        </div>
                      )}
                      <Select value={jobForm.job_type} onValueChange={(v) => setJobForm({ ...jobForm, job_type: v })}>
                        <SelectTrigger className="h-14 text-xl px-4">
                          <SelectValue placeholder="직종 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOBS.map((j) => (
                            <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 요구 경력 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-medium text-slate-800">요구 경력 (년수)</label>
                    <Input
                      type="number"
                      min={0}
                      value={jobForm.required_career}
                      onChange={(e) => setJobForm({ ...jobForm, required_career: e.target.value })}
                      placeholder="예: 2"
                      className="h-14 text-xl px-4"
                    />
                  </div>

                  <Button type="submit" size="lg" className="h-14 text-xl font-bold" disabled={jobLoading}>
                    {jobLoading ? "저장 중..." : "일자리 등록"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 일자리 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">등록된 일자리 ({jobs.length}건)</CardTitle>
              </CardHeader>
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
                        {jobs.map((job) => (
                          <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="py-4 pr-4 font-medium text-slate-900">{job.title}</td>
                            <td className="py-4 pr-4 text-slate-700">{job.region}</td>
                            <td className="py-4 pr-4">
                              <Badge variant="secondary" className="text-lg px-3 py-1">{job.job_type}</Badge>
                            </td>
                            <td className="py-4 pr-4 text-slate-700">{job.required_career}년</td>
                            <td className="py-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-10 text-lg px-4"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                삭제
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

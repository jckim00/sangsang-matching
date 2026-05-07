"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOBS   = ["경비", "청소", "조리", "돌봄", "기타"];

type Form   = { name: string; region: string; desired_job: string; career_years: string };
type Errors = Partial<Record<keyof Form, string>>;

export default function RegisterPage() {
  const [form, setForm]       = useState<Form>({ name: "", region: "", desired_job: "", career_years: "" });
  const [errors, setErrors]   = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim())   e.name        = "이름을 입력해 주세요.";
    if (!form.region)        e.region      = "지역을 선택해 주세요.";
    if (!form.desired_job)   e.desired_job = "희망 직종을 선택해 주세요.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const { data: newSenior, error } = await supabase
      .from("seniors")
      .insert({ name: form.name.trim(), region: form.region, desired_job: form.desired_job, career_years: Number(form.career_years) || 0 })
      .select()
      .single();

    if (error) {
      setErrors({ name: "저장 중 오류: " + error.message });
      setLoading(false);
      return;
    }

    // 등록 즉시 자동 재매칭 (RPC)
    await supabase.rpc("rematch_senior", { p_senior_id: newSenior.id });

    setLoading(false);
    setSuccess(true);
    setForm({ name: "", region: "", desired_job: "", career_years: "" });
    setErrors({});
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">시니어 프로필 등록</h1>
      <p className="text-xl text-slate-500 mb-8">정보를 입력하시면 일자리를 자동으로 추천해 드립니다</p>

      {success && (
        <div className="mb-6 rounded-xl border-2 border-green-500 bg-green-50 px-6 py-4">
          <p className="text-xl font-bold text-green-700">등록이 완료되었습니다 ✓ 매칭 결과를 추천 목록에서 확인하세요.</p>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-2xl">기본 정보 입력</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="name">이름 <span className="text-red-500">*</span></label>
              {errors.name && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{errors.name}</p></div>}
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="홍길동" className="h-14 text-xl px-4" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800">거주 지역 <span className="text-red-500">*</span></label>
              {errors.region && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{errors.region}</p></div>}
              <Select value={form.region} onValueChange={v => setForm({ ...form, region: v })}>
                <SelectTrigger className="h-14 text-xl px-4"><SelectValue placeholder="지역을 선택하세요" /></SelectTrigger>
                <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r} className="text-xl py-3">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800">희망 직종 <span className="text-red-500">*</span></label>
              {errors.desired_job && <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2"><p className="text-lg text-red-600">{errors.desired_job}</p></div>}
              <Select value={form.desired_job} onValueChange={v => setForm({ ...form, desired_job: v })}>
                <SelectTrigger className="h-14 text-xl px-4"><SelectValue placeholder="직종을 선택하세요" /></SelectTrigger>
                <SelectContent>{JOBS.map(j => <SelectItem key={j} value={j} className="text-xl py-3">{j}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xl font-medium text-slate-800" htmlFor="career_years">경력 (년수)</label>
              <Input id="career_years" type="number" min={0} value={form.career_years} onChange={e => setForm({ ...form, career_years: e.target.value })} placeholder="예: 5" className="h-14 text-xl px-4" />
            </div>

            <Button type="submit" size="lg" className="h-16 text-2xl font-bold mt-2" disabled={loading}>
              {loading ? "저장 중..." : "프로필 등록하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

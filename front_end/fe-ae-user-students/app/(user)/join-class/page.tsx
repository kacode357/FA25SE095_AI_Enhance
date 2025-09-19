"use client";

import { useApp } from "@/components/providers/AppProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import React, { useState } from "react";

export default function JoinClassPage() {
  const { joinClass } = useApp();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = joinClass(code.trim());
    setMessage(res.message);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tham gia lớp</h1>
      <form onSubmit={onSubmit} className="card p-4 space-y-3 max-w-lg">
        <Input label="Mã lớp / Link mời" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: MKT101 hoặc d.hyper/xyz" />
        <Button type="submit">Tham gia</Button>
        {message && <p className="text-sm text-black/70">{message}</p>}
      </form>
    </div>
  );
}

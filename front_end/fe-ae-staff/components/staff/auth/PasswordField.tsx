"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function PasswordField(props: Omit<React.ComponentProps<typeof Input>, 'type'>){
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-14" />
      <button type="button" onClick={()=>setShow(s=>!s)} className="absolute top-1/2 -translate-y-1/2 right-2 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition">
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

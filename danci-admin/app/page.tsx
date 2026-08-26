"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem("danci-auth") ? "/books" : "/signin");
  }, [router]);
  return <div className="loading">正在进入词记后台…</div>;
}

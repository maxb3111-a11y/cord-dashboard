"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { PasscodeGate } from "@/components/PasscodeGate";

export default function HomePage() {
  const [status, setStatus] = useState<{
    checked: boolean;
    authenticated: boolean;
    authRequired: boolean;
  }>({ checked: false, authenticated: false, authRequired: false });

  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) =>
        setStatus({
          checked: true,
          authenticated: Boolean(d.authenticated),
          authRequired: Boolean(d.authRequired),
        })
      )
      .catch(() =>
        setStatus({ checked: true, authenticated: true, authRequired: false })
      );
  }, []);

  if (!status.checked) {
    return <div className="min-h-screen bg-[#0b0e14]" />;
  }

  if (!status.authenticated) {
    return (
      <PasscodeGate
        onSuccess={() =>
          setStatus((s) => ({ ...s, authenticated: true }))
        }
      />
    );
  }

  return <DashboardShell authRequired={status.authRequired} />;
}

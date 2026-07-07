"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopySkillNameButtonProps {
  name: string;
}

export function CopySkillNameButton({ name }: CopySkillNameButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = name;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
    }
  }, [name]);

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "已复制" : "复制 Skill 名称"}
    </Button>
  );
}

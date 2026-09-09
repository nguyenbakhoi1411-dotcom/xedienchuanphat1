"use client";

import { Bot, ExternalLink, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useAskAssistant, useAssistantStatus } from "./hooks";
import type { AssistantMessage } from "./types";
import { cn } from "@/lib/cn";

export function InternalAiAssistant() {
  const user = useCurrentUser();
  const pathname = usePathname();
  const canUse = Boolean(user?.permissions.includes("AI_ASSISTANT_USE"));
  const status = useAssistantStatus(canUse);
  const ask = useAskAssistant();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      text: "Xin chào! Tôi là trợ lý AI của Chuẩn Phát. Tôi có thể giúp bạn tra cứu số liệu, phân tích dữ liệu và trả lời câu hỏi về hoạt động kinh doanh. Tôi không tự thay đổi dữ liệu.",
      timestamp: new Date()
    }
  ]);

  const contextQuestions = useMemo(() => {
    const moduleQuestions: Record<string, string[]> = {
      "/dashboard":  ["Doanh thu tháng này so tháng trước thế nào?", "Đơn hàng nào đang tồn đọng?", "Hàng nào sắp hết?"],
      "/sales":      ["Đơn hàng nào chưa thanh toán?", "KH nào có doanh thu cao nhất tháng?", "Tỷ lệ huỷ đơn tháng này?"],
      "/cash":       ["Tồn quỹ tiền mặt hiện tại?", "Thu chi hôm nay bao nhiêu?", "Phiếu nào chưa ghi sổ?"],
      "/purchasing": ["Đơn mua nào đang chờ duyệt?", "NCC nào có công nợ cao nhất?", "Hàng nào chưa về đủ?"],
      "/inventory":  ["Sản phẩm nào tồn dưới mức tối thiểu?", "SP nào xuất nhiều nhất tháng?", "Giá trị tồn kho hiện tại?"],
      "/accounting": ["Lợi nhuận tháng này bao nhiêu?", "Bút toán nào chưa ghi sổ?", "Cân đối kế toán hiện tại?"],
      "/crm":        ["Lead nào cần chăm sóc hôm nay?", "KH nào sắp hết hợp đồng bảo hành?", "Tỷ lệ chuyển đổi lead tháng này?"],
    };
    const base = (pathname || "").split("/").slice(0, 2).join("/");
    return moduleQuestions[base] ?? (status.data?.quickQuestions ?? []);
  }, [pathname, status.data?.quickQuestions]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ question: string }>;
      setOpen(true);
      const questionText = customEvent.detail.question;
      setTimeout(() => {
        setQuestion(questionText);
        const userMsg: AssistantMessage = { role: "user", text: questionText, timestamp: new Date() };
        setMessages((current) => [...current, userMsg]);
        setQuestion("");
        ask.mutate(
          { question: questionText, branchId: user?.branchId ?? undefined },
          {
            onSuccess: (response) => {
              setMessages((current) => [
                ...current,
                { role: "assistant", text: response.answer, response, timestamp: new Date() }
              ]);
            }
          }
        );
      }, 100);
    };
    window.addEventListener("ai-ask", handler as EventListener);
    return () => window.removeEventListener("ai-ask", handler as EventListener);
  }, [ask, user?.branchId]);

  if (!canUse || status.isLoading || status.isError || status.data?.enabled !== true) {
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    const userMsg: AssistantMessage = { role: "user", text, timestamp: new Date() };
    setMessages((current) => [...current, userMsg]);
    setQuestion("");
    ask.mutate(
      { question: text, branchId: user?.branchId ?? undefined },
      {
        onSuccess: (response) => {
          setMessages((current) => [
            ...current,
            { role: "assistant", text: response.answer, response, timestamp: new Date() }
          ]);
        }
      }
    );
  }

  function askQuick(text: string) {
    setQuestion(text);
    const userMsg: AssistantMessage = { role: "user", text, timestamp: new Date() };
    setMessages((current) => [...current, userMsg]);
    ask.mutate(
      { question: text, branchId: user?.branchId ?? undefined },
      {
        onSuccess: (response) => {
          setMessages((current) => [
            ...current,
            { role: "assistant", text: response.answer, response, timestamp: new Date() }
          ]);
        }
      }
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Mo AI Assistant"
      >
        <Bot className="h-5 w-5" />
      </button>

      {open ? (
        <section className="fixed bottom-5 right-5 z-50 flex h-[min(720px,calc(100vh-40px))] w-[min(440px,calc(100vw-32px))] flex-col rounded-lg border border-border bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-text">Trợ lý AI nội bộ</h2>
                <p className="text-xs text-slate-500">Đọc theo quyền, cần xác nhận khi có thao tác.</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50" aria-label="Dong AI Assistant">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="border-b border-border bg-amber-50 px-4 py-2 text-xs text-amber-800">
            AI chỉ hỗ trợ tham khảo. Không tự tạo, sửa, xóa hoặc duyệt chứng từ.
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {ask.isPending ? <div className="text-xs text-slate-500">Đang phân tích dữ liệu...</div> : null}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {contextQuestions.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => askQuick(item)}
                  disabled={ask.isPending}
                  className="shrink-0 rounded-lg border border-border bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:border-primary hover:bg-orange-50 disabled:opacity-60"
                >
                  {item}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Hỏi doanh thu, tồn kho, công nợ..."
                className="h-10 min-w-0 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
              />
              <Button type="submit" disabled={ask.isPending || !question.trim()} className="px-3">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      ) : null}
    </>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const assistant = message.role === "assistant";
  return (
    <div className={`flex ${assistant ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[92%] rounded-lg px-3 py-2 text-sm ${assistant ? "bg-slate-50 text-text" : "bg-primary text-white"}`}>
        <p className="leading-5">{message.text}</p>
        
        {message.timestamp && (
          <p className={cn("text-[10px] mt-1", assistant ? "text-slate-400" : "text-orange-200")}>
            {new Date(message.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {message.response ? (
          <div className="mt-3 space-y-2">
            {message.response.metrics.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {message.response.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg bg-white p-2 text-xs text-slate-600">
                    <div>{metric.label}</div>
                    <div className="mt-1 font-semibold text-text">{formatMetric(metric.value, metric.unit)}</div>
                  </div>
                ))}
              </div>
            ) : null}
            {message.response.warnings.map((warning) => (
              <div key={warning} className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{warning}</div>
            ))}
            {message.response.proposedAction ? (
              <div className="rounded-lg border border-amber-200 bg-white p-2 text-xs text-slate-700">
                <Badge tone="amber">Cần xác nhận</Badge>
                <p className="mt-2 font-semibold text-text">{message.response.proposedAction.title}</p>
                <p className="mt-1">{message.response.proposedAction.description}</p>
              </div>
            ) : null}
            {message.response.links.length ? (
              <div className="flex flex-wrap gap-2">
                {message.response.links.map((link) => (
                  <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2 py-1 text-xs font-medium text-primary hover:bg-orange-50">
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatMetric(value: number, unit: string) {
  if (unit === "VND") return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
  return `${new Intl.NumberFormat("vi-VN").format(value)} ${unit}`;
}

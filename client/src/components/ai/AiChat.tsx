import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Wand2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAiParseExpense, useAiAdvisor } from "@/api/hooks";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "log" | "ask";
type Msg = { role: "user" | "assistant"; text: string };

const LOG_SUGGESTIONS = [
  "Spent 12 on coffee today",
  "Paid 850 for rent yesterday",
  "Budget 500 for Food",
];

const ASK_SUGGESTIONS = [
  "Where am I overspending this month?",
  "Any quick ways to save 10%?",
  "Compare this month vs last month",
];

export function AiChat() {
  const [mode, setMode] = useState<Mode>("log");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        'Hi. Tell me what you spent ("12 on coffee") or set a budget ("budget 500 for food"). Switch to Ask for a quick read.',
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const parseMut = useAiParseExpense();
  const askMut = useAiAdvisor();
  const pending = parseMut.isPending || askMut.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  const push = (m: Msg) => setMessages((prev) => [...prev, m]);

  async function send(value: string) {
    const q = value.trim();
    if (!q || pending) return;
    push({ role: "user", text: q });
    setText("");

    if (mode === "log") {
      parseMut.mutate(q, {
        onSuccess: (data) => {
          push({ role: "assistant", text: data.message });
          if (data.success && data.expense) {
            toast({
              title: "Expense logged",
              description: `${formatCurrency(data.expense.amount)} · ${data.expense.categoryName}`,
            });
          } else if (data.success && data.kind === "budget" && data.budget) {
            toast({
              title: "Budget set",
              description: `${data.budget.categoryName ?? "Overall"} · ${formatCurrency(
                data.budget.amount
              )}/month`,
            });
          }
        },
        onError: () => push({ role: "assistant", text: "Couldn't reach the server." }),
      });
    } else {
      askMut.mutate(q, {
        onSuccess: (data) => push({ role: "assistant", text: data.answer }),
        onError: () => push({ role: "assistant", text: "Couldn't reach the advisor." }),
      });
    }
  }

  const suggestions = mode === "log" ? LOG_SUGGESTIONS : ASK_SUGGESTIONS;
  const placeholder =
    mode === "log"
      ? "Log an expense or set a budget"
      : "Ask about your spending";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/80 bg-background/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-semibold tracking-tight text-foreground">
              AI Assistant
            </div>
            <div className="text-[11px] text-muted-foreground">
              Powered by Groq · llama-3.3
            </div>
          </div>
        </div>
        <div className="flex rounded-md border border-border bg-background p-0.5 text-xs font-medium">
          <button
            onClick={() => setMode("log")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition-colors",
              mode === "log"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Wand2 className="h-3 w-3" /> Log
          </button>
          <button
            onClick={() => setMode("ask")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition-colors",
              mode === "ask"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageCircle className="h-3 w-3" /> Ask
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-[12px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="flex items-center gap-2 border-t border-border/80 bg-background/50 px-3 py-2.5"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={pending}
          className="h-9 border-border bg-background"
        />
        <Button
          type="submit"
          size="icon"
          disabled={pending || !text.trim()}
          className="h-9 w-9 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

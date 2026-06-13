"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Lỗi giao diện", error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 text-center shadow-soft">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-text">Không tải được màn hình</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Đã xảy ra lỗi giao diện. Vui lòng tải lại hoặc quay lại sau.</p>
          <Button className="mt-4" onClick={() => this.setState({ hasError: false })}>
            Thử lại
          </Button>
        </div>
      </section>
    );
  }
}

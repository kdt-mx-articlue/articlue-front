import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Articlue ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-lg p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl">!</span>
            </div>

            <h1 className="text-2xl font-bold text-text-main mb-3">
              서버 연결에 실패했습니다
            </h1>

            <p className="text-text-sub leading-7 mb-6">
              일시적인 오류가 발생했습니다.
              잠시 후 다시 시도해주세요.
            </p>

            <button
              type="button"
              onClick={this.handleRefresh}
              className="w-full bg-brand-500 text-white py-3 rounded-full font-bold hover:bg-brand-600 transition"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
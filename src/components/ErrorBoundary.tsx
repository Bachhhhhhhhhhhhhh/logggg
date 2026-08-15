import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { err: string | null }
> {
  state = { err: null as string | null }

  static getDerivedStateFromError(error: Error) {
    return { err: error.message || 'Unknown error' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#05060a] px-6 text-center text-[#ece7dc]">
          <div className="font-serif text-3xl">Memory failed to start</div>
          <p className="max-w-lg text-sm text-[#9a9284]">{this.state.err}</p>
          <button
            type="button"
            className="rounded-md border border-[#d4af78]/40 px-3 py-1.5 text-sm text-[#d4af78]"
            onClick={() => {
              try {
                localStorage.removeItem('memory.prefs.v1')
              } catch {
                /* ignore */
              }
              location.href = '/'
            }}
          >
            Reset prefs and reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

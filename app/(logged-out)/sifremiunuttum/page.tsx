import { TopicsSidebar } from "@/components/topics-sidebar"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function SifremiUnuttumPage() {
  return (
    <div className="w-full bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-6.5rem)]">
          {/* Left Sidebar - Topics (Hidden on mobile) */}
          <div className="hidden lg:block">
            <TopicsSidebar />
          </div>

          {/* Main Content Area - Forgot Password Form */}
          <main className="flex-1 w-full lg:max-w-4xl mx-auto bg-white">
            <div className="flex items-center justify-center py-12 px-4 lg:px-6">
              <div className="w-full max-w-lg">
                <ForgotPasswordForm />
              </div>
            </div>
          </main>

          {/* Right Sidebar - Empty space for ads */}
          <div className="hidden xl:block w-80">
            {/* Empty for now, can add ads later */}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Card } from "@/components/ui/card";
import EndpointDisplay from "@/components/worker-tester/endpoint-display";
import ApiTestPanel from "@/components/worker-tester/api-test-panel";
import StatusPanel from "@/components/worker-tester/status-panel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#fafafa]">
      <Card className="w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-medium">Cloudflare Worker Tester</h1>
          <p className="text-sm md:text-base opacity-90 mt-1">Test your Cloudflare Worker API responses</p>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-6">
          <EndpointDisplay endpoint="https://english-gemini-worker1.des9891sl.workers.dev/" />
          <ApiTestPanel />
          <StatusPanel />
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Cloudflare Worker Tester Interface</p>
      </div>
    </div>
  );
}

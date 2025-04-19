import { useState } from "react";
import { Bolt, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResponseDisplay from "./response-display";
import { formatBytes } from "@/lib/utils";

const WORKER_ENDPOINT = "https://english-gemini-worker1.des9891sl.workers.dev/";

interface ResponseData {
  data: any;
  time: number;
  size: string;
}

export default function ApiTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  const handleTestWorker = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const response = await fetch(WORKER_ENDPOINT);
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const responseSize = JSON.stringify(data).length;
      const formattedSize = formatBytes(responseSize);
      
      setResponse({
        data,
        time: responseTimeMs,
        size: formattedSize
      });
      setLastTested(new Date());
    } catch (err: any) {
      console.error('Error fetching from worker:', err);
      setError(err.message || 'Failed to connect to the worker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[#333333]">Test Your Worker</h2>
        <Button
          onClick={handleTestWorker}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
        >
          <Bolt className="h-5 w-5 mr-2" />
          Test Worker
        </Button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Fetching response...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-[#F44336]/10 border border-[#F44336]/30 text-[#F44336] rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-[#F44336]">Error: Failed to fetch</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Response Section */}
      {response && <ResponseDisplay response={response} />}
    </div>
  );
}

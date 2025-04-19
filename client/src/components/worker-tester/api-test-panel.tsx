import { useState } from "react";
import { Bolt, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResponseDisplay from "./response-display";
import { formatBytes } from "@/lib/utils";

const WORKER_ENDPOINT = "https://english-gemini-worker1.des9891sl.workers.dev/";

type WordType = "Nouns" | "Verbs" | "Idioms";

interface ResponseData {
  selectedType: WordType;
  data: any;
  time: number;
  size: string;
}

export default function ApiTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<WordType>("Nouns");

  const handleTestWorker = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = performance.now();
      const response = await fetch(WORKER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: selectedType })
      });
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
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-[#333333]">Test Your Worker</h2>
        
        {/* Request Preview */}
        <div className="bg-[#F5F5F5] p-4 rounded-md">
          <h3 className="font-medium mb-2">Request Preview</h3>
          <div className="overflow-auto bg-white border border-gray-200 rounded p-3">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {JSON.stringify({ type: selectedType }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex gap-4">
          {["Nouns", "Verbs", "Idioms"].map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="radio"
                value={type}
                checked={selectedType === type}
                onChange={(e) => setSelectedType(e.target.value as WordType)}
                className="w-4 h-4"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
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

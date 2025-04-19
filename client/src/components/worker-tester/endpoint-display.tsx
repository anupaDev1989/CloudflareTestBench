import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EndpointDisplayProps {
  endpoint: string;
}

export default function EndpointDisplay({ endpoint }: EndpointDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text:", err);
    }
  };

  return (
    <div className="bg-[#F5F5F5] rounded-md p-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-gray-500">ENDPOINT</h2>
          <div className="font-mono text-sm md:text-base break-all">
            {endpoint}
          </div>
        </div>
        
        <Button
          variant="outline" 
          size="sm"
          className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          onClick={handleCopyEndpoint}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

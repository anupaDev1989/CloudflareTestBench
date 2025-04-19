
import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponseDisplayProps {
  response: {
    data: any;
    time: number;
    size: string;
  };
}

export default function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formatResponse = (data: any) => {
    if (!Array.isArray(data)) return null;
    
    return data.map((item, index) => (
      <div key={index} className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-semibold text-primary">{item.word}</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Meaning:</h4>
            <p className="text-gray-600">{item.meaning}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Examples:</h4>
            <ul className="list-disc list-inside space-y-1">
              {item.examples.map((example: string, i: number) => (
                <li key={i} className="text-gray-600 ml-2">{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ));
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text:", err);
    }
  };

  return (
    <div className="bg-[#F5F5F5] p-4 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-lg">Response</h3>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center justify-center px-3 py-1 bg-white hover:bg-gray-50 transition-colors"
          onClick={handleCopyResponse}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md p-4 max-h-[600px] overflow-y-auto">
        {formatResponse(response.data)}
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
        <div>Response time: <span className="font-medium">{response.time} ms</span></div>
        <div>Size: <span className="font-medium">{response.size}</span></div>
      </div>
    </div>
  );
}

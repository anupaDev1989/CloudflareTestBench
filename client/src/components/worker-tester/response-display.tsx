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

  const formatJson = (json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
      (match) => {
        let cls = 'text-[#F57C00]'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-[#5C6BC0]'; // key
            match = match.replace(/":$/, '"');
          } else {
            cls = 'text-[#4CAF50]'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-[#7B1FA2]'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-[#795548]'; // null
        }
        
        return `<span class="${cls}">${match}</span>`;
      }
    );
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Response</h3>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center justify-center px-2 py-1 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          onClick={handleCopyResponse}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="overflow-auto bg-white border border-gray-200 rounded p-3 max-h-[400px]">
        <pre 
          className="text-sm font-mono whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatJson(response.data) }}
        />
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>Response time: <span>{response.time} ms</span></span>
        <span>Size: <span>{response.size}</span></span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Check, Clipboard, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponseDisplayProps {
  response: {
    data: any;
    time: number;
    size: string;
  };
}

export default function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Generic JSON formatter with syntax highlighting
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

  // Special formatter for our English vocabulary data structure
  const formatWordEntries = (data: any) => {
    if (!Array.isArray(data)) return null;

    return data.map((item, index) => (
      <div key={index} className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary">{item.word}</h3>
            {item.type && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {item.type}
              </Badge>
            )}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Meaning:</h4>
            <p className="text-gray-600">{item.meaning}</p>
          </div>
          {item.examples && item.examples.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Examples:</h4>
              <ul className="list-disc list-inside space-y-1">
                {item.examples.map((example: string, i: number) => (
                  <li key={i} className="text-gray-600 ml-2">{example}</li>
                ))}
              </ul>
            </div>
          )}
          {item.synonyms && item.synonyms.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Synonyms:</h4>
              <div className="flex flex-wrap gap-2">
                {item.synonyms.map((synonym: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-gray-100">
                    {synonym}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(response.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker-response-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Is data an array with the expected word structure?
  const isWordArray = Array.isArray(response.data) && 
    response.data.length > 0 && 
    typeof response.data[0] === 'object' &&
    'word' in response.data[0] &&
    'meaning' in response.data[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Response Data</h3>
          {Array.isArray(response.data) && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {response.data.length} items
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            title="Download JSON"
          >
            <DownloadCloud className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyResponse}
            title={copied ? "Copied!" : "Copy JSON"}
          >
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isWordArray ? (
        <div className="bg-gray-50 rounded-lg p-4">
          {formatWordEntries(response.data)}
        </div>
      ) : (
        <div className="overflow-auto bg-white border border-gray-200 rounded-md p-4 max-h-[500px]">
          <pre 
            className="text-sm font-mono whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatJson(response.data) }}
          />
        </div>
      )}
    </div>
  );
}
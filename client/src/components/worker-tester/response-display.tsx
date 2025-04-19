import { useState } from "react";
import { Check, Clipboard, FileJson, FileText, ChevronDown, ChevronUp, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ResponseDisplayProps {
  response: {
    data: any;
    time: number;
    size: string;
    contentType: string;
    isJson: boolean;
    status: number;
    statusText: string;
    headers: Record<string, string>;
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

  const renderContent = () => {
    if (response.isJson) {
      return (
        <pre 
          className="text-sm font-mono whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatJson(response.data) }}
        />
      );
    } else {
      // For text responses, display as plain text
      return (
        <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
          {response.data}
        </pre>
      );
    }
  };

  const handleCopyResponse = async () => {
    try {
      // Handle copying based on content type
      const textToCopy = response.isJson 
        ? JSON.stringify(response.data, null, 2) 
        : response.data.toString();
        
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text:", err);
    }
  };

  const getStatusColor = () => {
    if (response.status >= 200 && response.status < 300) {
      return "bg-[#4CAF50] text-white"; // Success
    } else if (response.status >= 400 && response.status < 500) {
      return "bg-[#FF9800] text-white"; // Client error
    } else if (response.status >= 500) {
      return "bg-[#F44336] text-white"; // Server error
    } else {
      return "bg-gray-500 text-white"; // Other
    }
  };

  return (
    <div className="bg-[#F5F5F5] p-4 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="font-medium">Response</h3>
          
          {/* Status code badge */}
          <Badge className={`px-2 ${getStatusColor()}`}>
            {response.status} {response.statusText}
          </Badge>
          
          {/* Content type badge */}
          <div className="text-xs px-2 py-0.5 rounded bg-gray-200 flex items-center gap-1">
            {response.isJson ? (
              <>
                <FileJson className="h-3 w-3" />
                <span>JSON</span>
              </>
            ) : (
              <>
                <FileText className="h-3 w-3" />
                <span>{response.contentType.split(';')[0] || 'plain text'}</span>
              </>
            )}
          </div>
        </div>
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
      
      {/* Response Body */}
      <div className="overflow-auto bg-white border border-gray-200 rounded p-3 max-h-[400px]">
        {renderContent()}
      </div>
      
      {/* Response Headers */}
      <div className="mt-3">
        <Accordion type="single" collapsible className="bg-white border border-gray-200 rounded overflow-hidden">
          <AccordionItem value="headers" className="border-0">
            <AccordionTrigger className="px-3 py-2 hover:bg-gray-50">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <Server className="h-4 w-4 mr-2" />
                Response Headers
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-3 pb-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2 font-medium text-gray-500">Name</th>
                      <th className="text-left p-2 font-medium text-gray-500">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(response.headers).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 font-medium text-gray-700">{key}</td>
                        <td className="p-2 font-mono text-gray-600 break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mt-2 text-xs text-gray-500 gap-2">
        <span>Response time: <span className="font-medium">{response.time} ms</span></span>
        <span>Size: <span className="font-medium">{response.size}</span></span>
      </div>
    </div>
  );
}

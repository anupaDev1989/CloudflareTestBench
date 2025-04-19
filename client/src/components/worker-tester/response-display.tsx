
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

  const formatResponse = (data: string) => {
    // Remove any markdown-style formatting
    let text = data.replace(/```/g, '');
    
    // Split into sections based on numbering or bullet points
    const sections = text.split(/(?:\d+\.|•|\*)\s+/).filter(Boolean);
    
    // Format each section
    return sections.map((section, index) => {
      const [title, ...content] = section.split(':').map(s => s.trim());
      if (content.length) {
        return (
          <div key={index} className="mb-4 last:mb-0">
            <h4 className="font-medium text-primary mb-1">{title}:</h4>
            <p className="text-gray-700">{content.join(':')}</p>
          </div>
        );
      }
      return <p key={index} className="mb-2 text-gray-700">{section}</p>;
    });
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
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
      
      <div className="bg-white border border-gray-200 rounded-md p-4 max-h-[400px] overflow-y-auto">
        <div className="prose prose-sm">
          {typeof response.data === 'string' 
            ? formatResponse(response.data)
            : <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(response.data, null, 2)}</pre>
          }
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
        <div>Response time: <span className="font-medium">{response.time} ms</span></div>
        <div>Size: <span className="font-medium">{response.size}</span></div>
      </div>
    </div>
  );
}

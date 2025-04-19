import { useState } from 'react';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Response</h2>
        <button
          onClick={handleCopyResponse}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        {formatResponse(response.data)}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Response time: {response.time} ms</span>
        <span>Size: {response.size}</span>
      </div>
    </div>
  );
}
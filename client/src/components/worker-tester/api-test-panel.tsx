
import React, { useState } from "react";
import { Bolt, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponseDisplay from "./response-display";
import { formatBytes } from "@/lib/utils";

const DEFAULT_ENDPOINT = "https://english-gemini-worker1.des9891sl.workers.dev/";

interface ResponseData {
  data: any;
  time: number;
  size: string;
  contentType: string;
  isJson: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export default function ApiTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<Date | null>(null);

  // Request configuration
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [requestBody, setRequestBody] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleTestWorker = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Configure request options based on HTTP method
      const options: RequestInit = {
        method,
        headers: {}
      };

      // Add request body for non-GET requests if provided
      if (method !== "GET" && requestBody.trim()) {
        try {
          // Try to parse as JSON first
          JSON.parse(requestBody);
          options.headers = {
            ...options.headers,
            "Content-Type": "application/json"
          };
          options.body = requestBody;
        } catch (e) {
          // If not valid JSON, send as plain text
          options.headers = {
            ...options.headers,
            "Content-Type": "text/plain"
          };
          options.body = requestBody;
        }
      }

      const response = await fetch(endpoint, options);
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

      // Get the content type from the response
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      // Collect all headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Handle different content types
      let data;
      let responseText;

      if (isJson) {
        data = await response.json();
        responseText = JSON.stringify(data);
      } else {
        responseText = await response.text();
        data = responseText; // Store text directly for non-JSON responses
      }

      const responseSize = new TextEncoder().encode(responseText).length;
      const formattedSize = formatBytes(responseSize);

      const responseData = {
        data: isJson ? data : responseText,
        time: responseTimeMs,
        size: formattedSize,
        contentType,
        isJson,
        status: response.status,
        statusText: response.statusText,
        headers
      };
      
      setResponse(responseData);
      setLastTested(new Date());

      // Dispatch custom event for status panel
      const statusEvent = new CustomEvent('workerStatusUpdate', {
        detail: {
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'Request successful' : `Error: ${response.status} ${response.statusText}`,
          time: new Date()
        }
      });
      window.dispatchEvent(statusEvent);

    } catch (err: any) {
      console.error('Error fetching from worker:', err);
      setError(err.message || 'Failed to connect to the worker');

      // Dispatch custom event for status panel
      const statusEvent = new CustomEvent('workerStatusUpdate', {
        detail: {
          status: 'error',
          message: 'Request failed',
          time: new Date()
        }
      });
      window.dispatchEvent(statusEvent);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[#333333]">Test Your Worker</h2>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-xs"
          >
            {showAdvancedOptions ? "Hide Options" : "Show Options"}
          </Button>
          <Button
            onClick={handleTestWorker}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          >
            <Bolt className="h-5 w-5 mr-2" />
            Test Worker
          </Button>
        </div>
      </div>

      {/* Request Configuration */}
      <div className={`grid gap-4 ${showAdvancedOptions ? 'grid-cols-1 md:grid-cols-[200px_1fr]' : 'grid-cols-1'}`}>
        <div className="flex items-center space-x-2">
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as HttpMethod)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter endpoint URL"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Request Body (only show if showAdvancedOptions is true) */}
        {showAdvancedOptions && (
          <div className="space-y-2">
            <Label htmlFor="requestBody">Request Body {method === "GET" && "(not used for GET requests)"}</Label>
            <Textarea
              id="requestBody"
              placeholder={`Enter request body (JSON or plain text)${method === "GET" ? " - Note: Body is ignored for GET requests" : ""}`}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="font-mono"
              rows={4}
              disabled={method === "GET"}
            />
            <p className="text-xs text-gray-500">
              For JSON, format will be automatically detected and proper Content-Type headers will be set.
            </p>
          </div>
        )}
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

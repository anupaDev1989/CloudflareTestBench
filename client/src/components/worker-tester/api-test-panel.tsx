import { useState } from "react";
import { Bolt, AlertCircle, FileJson, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResponseDisplay from "./response-display";
import { formatBytes } from "@/lib/utils";

const WORKER_ENDPOINT = "https://english-gemini-worker1.des9891sl.workers.dev/";

type WordType = "Nouns" | "Verbs" | "Idioms";

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
  const [selectedType, setSelectedType] = useState<WordType>("Nouns");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTestWorker = async () => {
    setIsLoading(true);
    setError(null);
    
    // Dispatch event to update status panel
    const updateStatusEvent = new CustomEvent('workerStatusUpdate', {
      detail: {
        status: 'idle',
        message: 'Fetching data from worker...',
        time: new Date()
      }
    });
    window.dispatchEvent(updateStatusEvent);
    
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
      
      const now = new Date();
      setLastTested(now);
      setDialogOpen(true);
      
      // Dispatch success event to update status panel
      const successEvent = new CustomEvent('workerStatusUpdate', {
        detail: {
          status: 'success',
          message: `Successfully fetched ${Array.isArray(data) ? data.length + ' items' : 'data'}`,
          time: now
        }
      });
      window.dispatchEvent(successEvent);
    } catch (err: any) {
      console.error('Error fetching from worker:', err);
      setError(err.message || 'Failed to connect to the worker');
      
      // Dispatch error event to update status panel
      const errorEvent = new CustomEvent('workerStatusUpdate', {
        detail: {
          status: 'error',
          message: err.message || 'Failed to connect to the worker',
          time: new Date()
        }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Create a summary of the response data
  const getResponseSummary = () => {
    if (!response) return null;
    
    const data = response.data;
    let summary = "";
    
    if (Array.isArray(data)) {
      summary = `${data.length} items returned`;
    } else if (typeof data === "object") {
      const keys = Object.keys(data);
      summary = `Object with ${keys.length} properties`;
    } else {
      summary = `${typeof data} value received`;
    }
    
    return summary;
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

      {/* Response Summary Card */}
      {response && !dialogOpen && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Response Summary</span>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                Success
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{response.time} ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{response.size}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileJson className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getResponseSummary()}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => setDialogOpen(true)}
            >
              View Full Response
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Worker Response</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="formatted" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-2 w-60 mb-4">
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatted" className="flex-1 overflow-auto">
              {response && <ResponseDisplay response={response} />}
            </TabsContent>
            
            <TabsContent value="raw" className="flex-1 overflow-auto">
              {response && (
                <div className="bg-[#F5F5F5] p-4 rounded-md h-full">
                  <div className="overflow-auto bg-white border border-gray-200 rounded p-3 h-full">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {response && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-xs text-gray-500">
              <span>Response time: <span className="font-semibold">{response.time} ms</span></span>
              <span>Size: <span className="font-semibold">{response.size}</span></span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

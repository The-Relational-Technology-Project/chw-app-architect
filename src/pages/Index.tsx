
import React, { useState } from 'react';
import { Mic, MicOff, Download, Rocket, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MedicHeader } from '@/components/MedicHeader';
import { MedicHero } from '@/components/MedicHero';
import '../types/speech';

interface AppConfig {
  appName: string;
  description: string;
  forms: Array<{
    name: string;
    purpose: string;
    fields: string[];
  }>;
  tasks: Array<{
    type: string;
    description: string;
    frequency: string;
  }>;
  reports: string[];
}

// Hardcoded API credentials
const OPENAI_API_KEY = '***REMOVED_API_KEY***';
const ASSISTANT_ID = 'asst_eJtwRZyQWo8BBiJ6og26FhYs';

const Index = () => {
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<AppConfig | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        toast({
          title: "Recording started",
          description: "Speak now to describe your app...",
        });
      };

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setDescription(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Recording error",
          description: "Please try again or use text input.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
      recognitionInstance.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "Please use text input instead.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const callOpenAIAssistant = async (userDescription: string): Promise<AppConfig> => {
    try {
      // Create a thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        throw new Error(`Failed to create thread: ${threadResponse.status}`);
      }

      const thread = await threadResponse.json();

      // Add message to thread
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: userDescription
        })
      });

      if (!messageResponse.ok) {
        throw new Error(`Failed to add message: ${messageResponse.status}`);
      }

      // Run the assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID
        })
      });

      if (!runResponse.ok) {
        throw new Error(`Failed to run assistant: ${runResponse.status}`);
      }

      const run = await runResponse.json();

      // Poll for completion
      let runStatus = run;
      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Failed to check run status: ${statusResponse.status}`);
        }

        runStatus = await statusResponse.json();
      }

      if (runStatus.status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${runStatus.status}`);
      }

      // Get the messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!messagesResponse.ok) {
        throw new Error(`Failed to get messages: ${messagesResponse.status}`);
      }

      const messages = await messagesResponse.json();
      const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
      
      if (!assistantMessage) {
        throw new Error('No assistant response found');
      }

      const responseContent = assistantMessage.content[0].text.value;
      
      // Try to parse JSON from the response
      let jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      }

      if (!jsonMatch) {
        throw new Error('No valid JSON found in assistant response');
      }

      const parsedConfig = JSON.parse(jsonMatch[0]);
      return parsedConfig;

    } catch (error) {
      console.error('OpenAI Assistant API error:', error);
      throw error;
    }
  };

  const generateAppConfig = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what kind of app you want to build.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const config = await callOpenAIAssistant(description);
      setGeneratedConfig(config);
      
      toast({
        title: "App configuration generated!",
        description: "Your CHW app structure is ready for review.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate app configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportConfig = () => {
    if (generatedConfig) {
      const dataStr = JSON.stringify(generatedConfig, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'chw-app-config.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Config exported!",
        description: "Your app configuration has been downloaded.",
      });
    }
  };

  const startOver = () => {
    setDescription('');
    setGeneratedConfig(null);
    toast({
      title: "Reset complete",
      description: "Ready to build a new CHW app!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MedicHeader />
      <MedicHero />
      
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Input Section */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <span className="text-2xl">🏥</span> Describe Your Community Health App
            </CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about the health workflows, forms, and tasks you need. You can type or use voice input to describe your requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Example: I need an app to track maternal health visits, register pregnant women, monitor their health during pregnancy, and send reminders for appointments and vaccinations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 pr-16 text-base resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute top-3 right-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={isRecording ? "animate-pulse" : ""}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={generateAppConfig} 
              disabled={isGenerating || !description.trim()}
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating App Design...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Generate App Design
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Config */}
        {generatedConfig && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <span className="text-2xl">⚙️</span> Your App Configuration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Generated Community Health Toolkit configuration based on your description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm">
                  <code>{JSON.stringify(generatedConfig, null, 2)}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {generatedConfig && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <span className="text-2xl">📱</span> App Preview
              </CardTitle>
              <CardDescription className="text-gray-600">
                Preview of your Community Health Toolkit app structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Forms Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  📋 Forms
                </h3>
                <div className="grid gap-3">
                  {generatedConfig.forms.map((form, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{form.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">{form.fields.length} fields</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{form.purpose}</p>
                      <div className="flex flex-wrap gap-1">
                        {form.fields.map((field, fieldIndex) => (
                          <Badge key={fieldIndex} variant="outline" className="text-xs border-blue-300 text-blue-700">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tasks Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  ✅ Sample Tasks
                </h3>
                <div className="grid gap-3">
                  {generatedConfig.tasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{task.type}</h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">{task.frequency}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reports Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  📊 Available Reports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generatedConfig.reports.map((report, index) => (
                    <Badge key={index} variant="outline" className="text-sm border-gray-300 text-gray-700">
                      {report}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {generatedConfig && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={exportConfig} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Download className="mr-2 h-4 w-4" />
                  Export Config (JSON)
                </Button>
                <Button disabled className="flex-1 bg-gray-400 text-white">
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to CHT Instance (Coming Soon)
                </Button>
                <Button onClick={startOver} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;

import React, { useState } from 'react';
import { Mic, MicOff, Download, Rocket, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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

    // Simulate API call - this would be replaced with actual Supabase Edge Function
    setTimeout(() => {
      const mockConfig: AppConfig = {
        appName: "Community Health Tracker",
        description: description,
        forms: [
          {
            name: "Patient Registration",
            purpose: "Register new patients in the community",
            fields: ["Name", "Age", "Gender", "Address", "Phone", "Emergency Contact"]
          },
          {
            name: "Health Assessment",
            purpose: "Conduct regular health check-ups",
            fields: ["Blood Pressure", "Weight", "Temperature", "Symptoms", "Medications"]
          },
          {
            name: "Visit Report",
            purpose: "Document home visits and follow-ups",
            fields: ["Visit Date", "Patient", "Purpose", "Findings", "Next Steps"]
          }
        ],
        tasks: [
          {
            type: "Home Visit",
            description: "Visit expected for high-risk patients",
            frequency: "Weekly"
          },
          {
            type: "Medication Reminder",
            description: "Follow up on medication compliance",
            frequency: "Daily"
          },
          {
            type: "Health Education",
            description: "Conduct community health education sessions",
            frequency: "Monthly"
          }
        ],
        reports: ["Patient Summary", "Visit Statistics", "Health Outcomes", "Community Metrics"]
      };

      setGeneratedConfig(mockConfig);
      setIsGenerating(false);
      
      toast({
        title: "App configuration generated!",
        description: "Your CHW app structure is ready for review.",
      });
    }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Build a CHW App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe the kind of app you want to create. We'll generate the structure using the Community Health Toolkit.
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏥 Describe Your App
            </CardTitle>
            <CardDescription>
              Tell us about the health workflows, forms, and tasks you need. You can type or use voice input.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Example: I need an app to track maternal health visits, register pregnant women, monitor their health during pregnancy, and send reminders for appointments and vaccinations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 pr-16 text-base resize-none"
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
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
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
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Your App Configuration
              </CardTitle>
              <CardDescription>
                Generated CHT configuration based on your description
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
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Preview (Mock)
              </CardTitle>
              <CardDescription>
                This is a static preview. Deploy to live CHT coming soon!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Forms Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  📋 Forms
                </h3>
                <div className="grid gap-3">
                  {generatedConfig.forms.map((form, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{form.name}</h4>
                        <Badge variant="secondary">{form.fields.length} fields</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{form.purpose}</p>
                      <div className="flex flex-wrap gap-1">
                        {form.fields.map((field, fieldIndex) => (
                          <Badge key={fieldIndex} variant="outline" className="text-xs">
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
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ✅ Sample Tasks
                </h3>
                <div className="grid gap-3">
                  {generatedConfig.tasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.type}</h4>
                        <Badge variant="secondary">{task.frequency}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reports Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  📊 Available Reports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {generatedConfig.reports.map((report, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
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
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={exportConfig} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export Config (JSON)
                </Button>
                <Button disabled className="flex-1 bg-gray-400">
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to Preview Instance (Coming Soon)
                </Button>
                <Button onClick={startOver} variant="outline">
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

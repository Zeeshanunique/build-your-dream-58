import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Paperclip, Smile, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientType: "therapist" | "parent";
}

export const MessageModal = ({ open, onOpenChange, recipientType }: MessageModalProps) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim() || !subject.trim()) {
      toast("Please fill in both subject and message fields");
      return;
    }

    // Simulate sending message
    setTimeout(() => {
      toast(`Message sent to ${recipientType}! 📨`, {
        description: `Your message "${subject}" has been delivered successfully.`
      });
      
      // Reset form
      setMessage("");
      setSubject("");
      setPriority("normal");
      setIsScheduled(false);
      onOpenChange(false);
    }, 1000);
  };

  const conversations = [
    {
      name: "Dr. Sarah Johnson",
      role: "Lead Therapist",
      lastMessage: "Emma's attention span has improved significantly. Let's discuss the next phase.",
      time: "2 hours ago",
      unread: true
    },
    {
      name: "Michael Rodriguez", 
      role: "Parent",
      lastMessage: "Thank you for the home exercises. Emma enjoys the memory games!",
      time: "1 day ago",
      unread: false
    },
    {
      name: "Dr. Alex Chen",
      role: "EEG Specialist", 
      lastMessage: "The neurofeedback session data looks promising. Scheduling follow-up.",
      time: "2 days ago",
      unread: false
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-primary" />
            {recipientType === "therapist" ? "Message Therapist" : "Message Parent"}
          </DialogTitle>
          <DialogDescription>
            {recipientType === "therapist" 
              ? "Communicate with your child's care team"
              : "Send updates and questions to parents"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[500px]">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-border pr-4 overflow-y-auto">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Recent Conversations</h4>
              
              {conversations.map((conversation, index) => (
                <div key={index} className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {conversation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{conversation.name}</span>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{conversation.role}</div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {conversation.lastMessage}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">{conversation.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Compose */}
          <div className="flex-1 pl-4 flex flex-col">
            <div className="flex-1 space-y-4">
              {/* Message Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={`Message for ${recipientType}...`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                            Low Priority
                          </span>
                        </SelectItem>
                        <SelectItem value="normal">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                            Normal
                          </span>
                        </SelectItem>
                        <SelectItem value="high">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                            High Priority
                          </span>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-destructive rounded-full mr-2"></div>
                            Urgent
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <Label className="text-sm text-muted-foreground">Quick Templates</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Session Progress Update",
                      "Schedule Change Request", 
                      "Home Exercise Question",
                      "Behavior Observation"
                    ].map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start h-8"
                        onClick={() => {
                          setSubject(template);
                          setMessage(`Regarding: ${template}\n\n`);
                        }}
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary-dark text-white">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
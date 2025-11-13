"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, MessageSquare, CheckCircle2, Clock } from "lucide-react"

export default function NotificationsPage() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true)
  const [autoReminders, setAutoReminders] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">WhatsApp Notifications</h1>
        <p className="text-muted-foreground mt-2">Manage automated notifications and reminders</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure WhatsApp notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable automated WhatsApp messages</p>
              </div>
              <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Send automatic appointment reminders</p>
              </div>
              <Switch checked={autoReminders} onCheckedChange={setAutoReminders} />
            </div>

            <div className="space-y-2">
              <Label>Reminder Time (hours before)</Label>
              <Input type="number" defaultValue="24" placeholder="24" />
            </div>

            <div className="space-y-2">
              <Label>WhatsApp API Key</Label>
              <Input type="password" placeholder="Enter your WhatsApp API key" />
            </div>

            <Button className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Custom Message</CardTitle>
            <CardDescription>Send a WhatsApp message to a student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Student Phone Number</Label>
              <Input placeholder="+1234567890" />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Type your message here..." className="min-h-[120px]" />
            </div>

            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>Pre-configured message templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Appointment Reminder</div>
                  <div className="text-sm text-muted-foreground">Sent 24 hours before appointment</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Medication Reminder</div>
                  <div className="text-sm text-muted-foreground">Daily medication schedule reminder</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Follow-up Consultation</div>
                  <div className="text-sm text-muted-foreground">Reminder for follow-up visits</div>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Test Results Ready</div>
                  <div className="text-sm text-muted-foreground">Notify when lab results are available</div>
                </div>
              </div>
              <Badge variant="outline">Inactive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Last 10 sent messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">John Doe - Appointment Reminder</div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Reminder: Your appointment is tomorrow at 10:00 AM
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Jane Smith - Medication Reminder</div>
                  <span className="text-sm text-muted-foreground">5 hours ago</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Don't forget to take your medication at 2:00 PM
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Mike Johnson - Follow-up</div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Pending delivery</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

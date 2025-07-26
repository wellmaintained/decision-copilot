'use client'

import { Badge } from "@decision-copilot/ui"
import { Github, Mail, Slack } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function UserAccountPage() {
  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Account Settings</CardTitle>
              <CardDescription>Manage your account settings and linked services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  defaultValue="John Doe" 
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Linked Accounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Linked Accounts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Github className="h-5 w-5" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">johndoe</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Google Account</p>
                    <p className="text-sm text-muted-foreground">john.doe@gmail.com</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Organisation & Teams */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organisation & Teams</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="organisation">Organisation</Label>
                <Input 
                  id="organisation" 
                  defaultValue="Acme Corp" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teams">Teams</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>Engineering</Badge>
                  <Badge>Frontend</Badge>
                  <Badge>Design</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Communication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Communication</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Slack className="h-5 w-5" />
                <Label htmlFor="slack">Slack Username</Label>
              </div>
              <Input 
                id="slack" 
                defaultValue="@johndoe" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
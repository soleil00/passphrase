"use client"

import { useState } from "react"
import { MessageCircle, Mail, Send, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: "system",
      text: "Welcome to Pi Recovery Service support! How can we help you today?",
      time: "Just now",
    },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
        time: "Just now",
      },
    ])

    setMessage("")

    // Simulate agent response after a delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Thank you for your message. One of our support agents will respond shortly. In the meantime, you can check our FAQ section for common questions.",
          time: "Just now",
        },
      ])
    }, 1000)
  }

  const faqItems = [
    {
      question: "How does the Pi Recovery Service work?",
      answer:
        "Our service uses advanced algorithms to recover missing words from your Pi Network wallet passphrase. You provide the words you remember (at least 21 out of 24), and our system identifies the missing words. For wallet protection, we secure your Pi by transferring it to a new secure wallet.",
    },
    {
      question: "What is the fee for using the recovery service?",
      answer:
        "We charge a 25% fee of your Pi balance, but only if the recovery is successful. There's no upfront payment, and you only pay if we successfully recover your passphrase and access your wallet.",
    },
    {
      question: "How long does the recovery process take?",
      answer:
        "The recovery process typically takes between 1-24 hours, depending on the complexity of the recovery and the current system load. You'll receive updates on your dashboard throughout the process.",
    },
    {
      question: "Is my passphrase information secure?",
      answer:
        "Yes, we use end-to-end encryption for all passphrase data. Our system is designed to process your information securely, and we never store your complete passphrase after recovery is complete.",
    },
    {
      question: "What if the recovery is unsuccessful?",
      answer:
        "If we're unable to recover your passphrase, you won't be charged any fee. We'll provide you with information about why the recovery was unsuccessful and suggest alternative approaches if available.",
    },
  ]

  return (
    <div className=" py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Customer Support</h1>
          <p className="text-xl text-muted-foreground">We&apos;re here to help with any questions or concerns</p>
        </div>

        <Tabs defaultValue="chat" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card id="live-chat">
              <CardHeader>
                <CardTitle>Live Chat Support</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : msg.sender === "agent"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {msg.sender === "agent" && <div className="font-semibold mb-1">Support Agent</div>}
                          <p>{msg.text}</p>
                          <div className="text-xs mt-1 opacity-70">{msg.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Send us a message and we&apos;ll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="name" placeholder="Your name" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="Your email" className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Please describe your issue in detail..." rows={6} />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center items-center">
      <img src="/faq.png"/>
      </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center gap-4 p-6">
                <Mail className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">support@piphrase.com</div>
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className="flex items-center justify-center gap-4 p-6">
                <Phone className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  )
}


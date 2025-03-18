import { Clock, Shield, Users } from 'lucide-react'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const OurFeatures = () => {
  return (
    <section className="">
        <div className="">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Service</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide a secure, reliable, and user-friendly solution for Pi Network wallet recovery
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-primary" />,
                title: "Advanced Security",
                description: "End-to-end encryption and secure processing to protect your sensitive information",
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "Fast Recovery",
                description: "Quick processing times to recover your passphrase when you need it most",
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "24/7 Support",
                description: "Our team is always available to assist you with any questions or concerns",
              },
            ].map((feature, i) => (
              <Card key={i} className="card-hover">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
  )
}

export default OurFeatures
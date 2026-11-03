'use client';
import React from 'react'
import { Mail, Phone, Target, Users, Heart, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">

        {/* What is JobIn */}
        <section className="py-16 md:py-20 px-10 lg:px-20">
          <div className="container items-start justify-start ">
            <div className="max-w-4xl mx-auto items-start justify-start ">
              <div className="flex items-start gap-4 mb-8 justify-start md:flex-row flex-col">
                    <Image
                      src="/chara-fullbody.png" 
                      alt="JobIn character illustration"
                      width={120}
                      height={120}
                      className="object-contain hidden md:block"
                    />
                    <Image
                      src="/chara-fullbody.png" 
                      alt="JobIn character illustration"
                      width={150}
                      height={150}
                      className="object-contain block md:hidden"
                    />
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-foreground">What is JobIn?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    JobIn is a platform built to help blue-collar workers, such as builders, drivers, technicians, tailors, and cooks, find decent work and training that grows their skills.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">10,000+</h3>
                    <p className="text-sm text-muted-foreground">Active job seekers</p>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">500+</h3>
                    <p className="text-sm text-muted-foreground">Open jobs</p>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">100+</h3>
                    <p className="text-sm text-muted-foreground">Courses and training</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 md:py-20 bg-muted/30 px-10 lg:px-20">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Our vision and mission</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Vision */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Vision</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      To be the leading platform that helps blue-collar workers in Indonesia find decent work and improve their quality of life.
                    </p>
                  </CardContent>
                </Card>

                {/* Mission */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Mission</h3>
                    </div>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Connect workers with the best job opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Provide training that builds new skills</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Build an inclusive world of work</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-20 px-10 lg:px-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Need help?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our team is here to help. Reach us by:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Phone className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground">Phone</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Call us directly
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.location.href = 'tel:+6281234567890'}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        +62 812-3456-7890
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Mail className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground">Email</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Send us a message
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.location.href = 'mailto:help@jobin.id'}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        help@jobin.id
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Support hours:</strong> Monday to Friday, 09:00–17:00 WIB
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default page
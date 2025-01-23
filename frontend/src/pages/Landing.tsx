import React from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { Button } from "../components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/shadcn/card";
import { Badge } from "../components/shadcn/badge";
import { BackgroundPhoneAnimation } from "../components/ui/PhoneAnimation";
import { motion } from "framer-motion";

export const Landing: React.FC = () => {
  return (
    <ScrollableLayout>
      <div className="flex flex-col gap-2">   
        <div className="relative flex flex-col justify-start items-start min-h-[80vh]">
          <BackgroundPhoneAnimation className="absolute w-[100%] min-h-[80vh]">
            <div className="relative flex-col w-full justify-center items-center z-10 px-4 py-16 max-w-6xl mx-8">
              <h2 className="text-3xl max-w-4xl relative z-20 md:text-4xl lg:text-7xl font-bold text-left text-black dark:text-white font-sans tracking-tight">
                Discover your chat
                <div className="relative inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
                  <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-2 md:py-4 from-primary via-secondary to-accent">
                    <span className="">personality.</span>
                  </div>
                  <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-primary to-accent py-2 md:py-4">
                    <span className="">personality.</span>
                  </div>
                </div>
              </h2>
              <p className="text-lg md:text-xl mb-8 dark:text-white max-w-xl">
                Upload your chat history and uncover hilarious insights about your texting style. 
                Are you the Meme Lord? The Ghost? Or maybe the Therapist Friend? Let's find out! 
              </p>
              <Button className="dark:text-white relative z-20" onClick={() => window.location.href = '/dashboard'}>
                Analyze your chats
              </Button>
            </div>
          </BackgroundPhoneAnimation>
        </div>

        <h1 className="font-chivo text-2xl md:text-4xl font-bold mb-8 text-center dark:text-white my-4">
          Unlock the secrets of your chat personality
        </h1>
      
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 max-w-6xl mx-auto px-4">
          <Card className="col-span-1 md:col-span-3 hover:border-primary ease-in-out transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎭</span>
                Chat Personality Analysis
              </CardTitle>
              <CardDescription className="font-jakarta">
                Get your unique chat personality type and discover your texting quirks.
                <br />
                <Button variant="link" className="p-0 font-jakarta">See example analysis →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 border rounded-xl p-4 bg-accent/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">Your Chat Style</span>
                  <Badge variant="secondary" className="font-jakarta">The Meme Lord</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Emoji Game</span>
                    <div className="flex items-center gap-2">
                      <span>Expert Level</span>
                      <span>🚀</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <div className="flex items-center gap-2">
                      <span>Lightning Fast</span>
                      <span>⚡</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 hover:border-secondary ease-in-out transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Fun Metrics
              </CardTitle>
              <CardDescription className="font-jakarta">
                Track your meme game, sass levels, and conversation starters.
                <br />
                <Button variant="link" className="p-0">View metrics →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                  🤣 Meme Master
                </Badge>
                <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                  💫 Conversation Starter
                </Badge>
                <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                  🎭 Sass Level: Expert
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto px-4">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Card className="hover:border-primary ease-in-out transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Chat Achievements
                </CardTitle>
                <CardDescription className="font-jakarta">
                  Unlock badges and achievements as you analyze more conversations.
                  <br/>
                  <Button variant="link" className="p-0">View badges →</Button>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary ease-in-out transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  The Problem Finder
                </CardTitle>
                <CardDescription className="font-jakarta">
                  Discover communication patterns that might need attention in your chats.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="col-span-1 md:col-span-3 hover:border-primary ease-in-out transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Chat Insights
              </CardTitle>
              <CardDescription className="font-jakarta">
                Get detailed breakdowns of your messaging style and habits.
                <br/>
                <Button variant="link" className="p-0">View example →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 border rounded-xl p-4 bg-accent/5">
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                    🏆 Top Reactor
                  </Badge>
                  <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                    💬 Conversation Starter
                  </Badge>
                  <Badge variant="outline" className="bg-accent/5 hover:bg-accent/10 transition-colors">
                    🎯 Quick Responder
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto my-16 px-4 min-h-[400px]">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 flex items-center justify-center">
              <motion.div 
                className="relative w-72 h-72"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {/* First Chat Bubble */}
                <motion.div 
                  className="absolute top-0 left-0 bg-accent/20 p-4 rounded-2xl w-48"
                  animate={{ 
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex gap-2 mb-2">
                    <span className="text-xl">😎</span>
                    <span className="text-xl">🚀</span>
                  </div>
                  <div className="h-2 bg-primary/20 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-primary/20 rounded w-1/2"></div>
                </motion.div>

                {/* Second Chat Bubble */}
                <motion.div 
                  className="absolute bottom-0 right-0 bg-primary/20 p-4 rounded-2xl w-48"
                  animate={{ 
                    y: [0, 20, 0],
                    x: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <div className="flex gap-2 mb-2">
                    <span className="text-xl">🎮</span>
                    <span className="text-xl">✨</span>
                  </div>
                  <div className="h-2 bg-secondary/20 rounded w-2/3 mb-2"></div>
                  <div className="h-2 bg-secondary/20 rounded w-1/2"></div>
                </motion.div>
              </motion.div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center dark:text-white">
              <p className="font-bold text-primary">CHAT PERSONALITY</p>
              <h2 className="text-3xl font-bold mb-4">Level Up Your Chats</h2>
              <p className="text-lg mb-6">
                Watch as we analyze your messages and reveal your unique chat personality.
                From emoji usage to response times, discover what makes your style special!
              </p>
              <Button>Analyze Your Style</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-auto min-h-[400px] max-w-6xl mx-auto my-16 px-4 dark:text-white">
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center">
              <p className="font-bold text-primary">CHAT DETECTIVE</p>
              <h2 className="text-3xl font-bold mb-4">Who Sent That Message?</h2>
              <p className="text-lg mb-6">
                Think you can identify your friends just by their texting style? 
                Our AI analyzes patterns, emojis, and timing to create unique chat fingerprints.
                Test your skills and see if you can match the message to the sender!
              </p>
              <Button>Try Chat Detective</Button>
          </div>
          <div className="w-full md:w-1/2 mb-8 md:mb-0 flex items-center justify-center">
              <motion.div 
                className="relative w-72 h-72"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4 bg-secondary/10 rounded-full w-48 h-48 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <motion.div 
                    className="bg-primary/20 rounded-full w-32 h-32 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  >
                    <div className="text-4xl">🔍</div>
                  </motion.div>
                </motion.div>
                
                {/* Floating Chat Attributes */}
                <motion.div
                  className="absolute top-0 right-0"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Badge variant="outline">😊 Emoji Lover</Badge>
                </motion.div>
                <motion.div
                  className="absolute bottom-0 left-0"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  <Badge variant="outline">⚡ Quick Replier</Badge>
                </motion.div>
              </motion.div>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-50 min-h-[20vh]">
          <div className="absolute w-[100vw] min-h-[25vh] bg-secondary flex flex-col justify-center items-center p-5">
              <h1 className="relative text-4xl font-bold m-0 font-chivo">
                  <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-2 from-primary via-accent to-accent">
                      <span className="">Start Your Chat Adventure</span>
                  </div>
                  <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-primary via-accent to-accent py-2">
                      <span className="">Start Your Chat Adventure</span>
                  </div>
              </h1>
              <p className="text-white mb-1">Discover your unique chat personality today</p>
              <Button onClick={() => window.location.href = '/dashboard'}>Get Started</Button>
          </div>
        </div>
      </div>
    </ScrollableLayout>
  );
};
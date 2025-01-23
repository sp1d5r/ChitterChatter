import React from "react";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { Button } from "../components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/shadcn/card";
import { Badge } from "../components/shadcn/badge";
import { BackgroundPhoneAnimation } from "../components/ui/PhoneAnimation";

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

        <h1 className="text-2xl md:text-4xl font-bold mb-8 text-center dark:text-white my-4">
          Unlock the secrets of your chat personality
        </h1>
      
        <div className="grid grid-cols-5 gap-4 mb-4 max-w-6xl mx-auto">
          <Card className="col-span-3 hover:border-primary ease-in-out">
            <CardHeader>
              <CardTitle>Personality Analysis</CardTitle>
              <CardDescription>
                Get your unique chat personality type and discover your texting quirks.
                <br />
                <Button variant="link" className="p-0">See example analysis →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Your Chat Style</span>
                  <Badge variant="secondary">The Meme Lord</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Emoji Usage</span>
                    <span>🚀 Expert Level</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Time</span>
                    <span>Lightning Fast ⚡</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 hover:border-secondary ease-in-out">
            <CardHeader>
              <CardTitle>Fun Metrics</CardTitle>
              <CardDescription>
                Track your meme game, sass levels, and dad joke frequency.
                <br />
                <Button variant="link" className="p-0">View metrics →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                <Badge variant="outline">🤣 Meme Master</Badge>
                <Badge variant="outline">👻 Occasional Ghost</Badge>
                <Badge variant="outline">🎭 Sass Level: Expert</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-5 gap-4 max-w-6xl mx-auto">
          <div className="col-span-2 space-y-4">
            <Card className="hover:border-primary ease-in-out">
              <CardHeader>
                <CardTitle>Chat Achievements</CardTitle>
                <CardDescription>
                  Unlock badges and achievements as you analyze more conversations.
                  <br/>
                  <Button variant="link" className="p-0">View badges →</Button>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary ease-in-out">
              <CardHeader>
                <CardTitle>Weekly Leaderboards</CardTitle>
                <CardDescription>
                  Compete with friends to see who's the ultimate chat champion this week.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="col-span-3 hover:border-primary ease-in-out">
            <CardHeader>
              <CardTitle>Chat Insights</CardTitle>
              <CardDescription>
                Get detailed breakdowns of your messaging style and habits.
                <br/>
                <Button variant="link" className="p-0">View example →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 border rounded p-4">
                <div className="text-center space-y-2">
                  <Badge variant="outline">🏆 Top Reactor</Badge>
                  <Badge variant="outline">💬 Conversation Starter</Badge>
                  <Badge variant="outline">🎯 Quick Responder</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto my-16 px-4">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <img 
                  src="/achievements.svg" 
                  alt="Chat achievements and badges" 
                  className="w-full aspect-square h-auto object-cover rounded-lg shadow-lg"
              />
          </div>
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center dark:text-white">
              <p className="font-bold text-primary">ACHIEVEMENTS</p>
              <h2 className="text-3xl font-bold mb-4">Level Up Your Chats</h2>
              <p className="text-lg mb-6">
                Earn badges for your unique chat style. Are you the Emoji Master? 
                The GIF Champion? Or maybe the Late Night Chatter? Find out and 
                collect them all!
              <br/>
              <Button>View Achievements</Button>
              </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto my-16 px-4 dark:text-white">
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center">
              <p className="font-bold text-primary">WEEKLY CHALLENGES</p>
              <h2 className="text-3xl font-bold mb-4">New Challenges Every Week</h2>
              <p className="text-lg mb-6">
                Complete weekly challenges to earn special badges. Share your 
                achievements with friends and see who can collect the most unique 
                chat styles!
              <br/>
              <Button>View Challenges</Button>
              </p>
          </div>
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <img 
                  src="/challenges.svg" 
                  alt="Weekly chat challenges" 
                  className="w-full aspect-square h-auto object-cover rounded-lg shadow-lg"
              />
          </div>
        </div>

        <div className="relative flex items-center justify-center my-50 min-h-[20vh]">
          <div className="absolute w-[100vw] min-h-[20vh] bg-secondary flex flex-col justify-center items-center">
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
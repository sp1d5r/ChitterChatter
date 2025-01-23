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
            <Card className="hover:border-blue-500 ease-in-out">
              <CardHeader>
                <CardTitle>Feature Three</CardTitle>
                <CardDescription>
                  Describe another important aspect of your product and its capabilities.
                  <br/>
                  <Button variant="link" className="p-0">Learn more →</Button>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-blue-500 ease-in-out">
              <CardHeader>
                <CardTitle>Technology Highlight</CardTitle>
                <CardDescription>
                  Showcase a key technology or framework that powers your product and its advantages.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="col-span-3 hover:border-primary ease-in-out">
            <CardHeader>
              <CardTitle>Feature Four</CardTitle>
              <CardDescription>
                Explain a complex feature or system within your product that sets it apart from competitors.
                <br/>
                <Button variant="link" className="p-0">Discover more →</Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 border rounded p-4">
                <div className="text-center text-gray-500">Feature Diagram Placeholder</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto my-16 px-4">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <img 
                  src="https://placehold.co/400" 
                  alt="Description of the thing" 
                  className="w-full aspect-sqaure h-auto object-cover rounded-lg shadow-lg"
              />
          </div>
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center dark:text-white">
              <p className="font-bold text-primary">FEATURE INFORMATION HERE</p>
              <h2 className="text-3xl font-bold mb-4">Your Headline Here</h2>
              <p className="text-lg mb-6">
              Your description text goes here. Explain the key features or benefits 
              related to the image on the left. Make it compelling and informative.
              <br/>
              <Button>Call to Action</Button>
              </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row max-w-6xl mx-auto my-16 px-4 dark:text-white">
          <div className="w-full md:w-1/2 md:pl-8 flex flex-col justify-center">
              <p className="font-bold text-primary">FEATURE INFORMATION HERE</p>
              <h2 className="text-3xl font-bold mb-4">Your Headline Here</h2>
              <p className="text-lg mb-6">
              Your description text goes here. Explain the key features or benefits 
              related to the image on the left. Make it compelling and informative.
              <br/>
              <Button>Call to Action</Button>
              </p>
          </div>
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <img 
                  src="https://placehold.co/400" 
                  alt="Description of the thing" 
                  className="w-full aspect-sqaure h-auto object-cover rounded-lg shadow-lg"
              />
          </div>
        </div>

        <div className="relative flex items-center justify-center my-50 min-h-[20vh]">
          <div className="absolute w-[100vw] min-h-[20vh] bg-primary dark:bg-[#111111] flex flex-col justify-center items-center">
              <h1 className="relative text-4xl font-bold m-0">
                  <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-2 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
                      <span className="">Join today</span>
                  </div>
                  <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 py-2">
                      <span className="">Join today</span>
                  </div>
              </h1>
              <p className="text-black mb-1 dark:text-white">Try today for free</p>
              <Button variant="secondary">Sign up</Button>
          </div>
        </div>
      </div>
    </ScrollableLayout>
  );
};
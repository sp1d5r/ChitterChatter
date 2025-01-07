import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';
import { ChatData } from 'shared/src/types/Chat';

export const ChatPage = () => {
  const { chatId } = useParams();
  const { authState } = useAuth();
  const [chat, setChat] = useState<ChatData | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (authState.user?.uid && chatId) {
      // Set up real-time listener for the specific chat
      unsubscribe = FirebaseDatabaseService.listenToDocument<ChatData>(
        `chats/${authState.user.uid}/conversations/`,
        chatId,
        (updatedChat) => {
          if (updatedChat) {
            setChat(updatedChat);
          }
        },
        (error) => {
          console.error('Error listening to chat:', error);
        }
      );
    }

    // Cleanup listener when component unmounts or chatId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authState.user, chatId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      {chat ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Chat Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-500 hover:scale-[1.01] animate-fadeIn">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                         bg-clip-text text-transparent mb-6 animate-pulse">
              ✨ {chat.conversationType || 'Chat'} Wrapped
            </h1>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl transform transition-all hover:-translate-y-1">
                <p className="text-lg text-purple-600">💬 Messages</p>
                <p className="text-4xl font-bold animate-count">{chat.messageCount || 0}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl transform transition-all hover:-translate-y-1">
                <p className="text-lg text-blue-600">👥 Members</p>
                <p className="text-4xl font-bold">{chat.members?.length || 0}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl transform transition-all hover:-translate-y-1">
                <p className="text-lg text-teal-600">🌟 Chaos Level</p>
                <p className="text-4xl font-bold">{chat.groupVibe?.results.chaosLevel.rating}/10</p>
              </div>
            </div>

            {/* Group Personality Section */}
            {chat.groupVibe?.results && (
              <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 p-6 rounded-2xl mb-8 animate-slideIn">
                <h2 className="text-2xl font-bold mb-4">🎭 Group Personality</h2>
                <p className="text-xl mb-2">Your group is: <span className="font-bold">{chat.groupVibe.results.personalityType}</span></p>
                <div className="space-y-2">
                  {chat.groupVibe.results.collectiveQuirks.map((quirk, i) => (
                    <p key={i} className="text-lg animate-fadeIn" style={{animationDelay: `${i * 0.2}s`}}>
                      🌈 {quirk}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {chat.superlatives?.results && (
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-2xl mb-8">
                <h2 className="text-2xl font-bold mb-4">🏆 Chat Awards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chat.superlatives.results.awards.map((award, i) => (
                    <div key={i} 
                         className="bg-white/50 p-4 rounded-xl transform transition-all hover:scale-105"
                         style={{animationDelay: `${i * 0.3}s`}}>
                      <h3 className="font-bold text-lg">🎉 {award.title}</h3>
                      <p className="text-sm">Goes to: <span className="font-bold">{award.recipient}</span></p>
                      <p className="text-sm italic">"{award.reason}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memorable Moments */}
            {chat.memorableMoments?.results && (
              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4">✨ Greatest Hits</h2>
                
                {/* Epic Discussions */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">🔥 Epic Discussions</h3>
                  {chat.memorableMoments.results.epicDiscussions.map((discussion, i) => (
                    <div key={i} className="bg-white/50 p-3 rounded-lg mb-2 animate-slideIn"
                         style={{animationDelay: `${i * 0.2}s`}}>
                      <p className="font-bold">{discussion.topic}</p>
                      <p className="text-sm italic">"{discussion.highlight}"</p>
                    </div>
                  ))}
                </div>

                {/* Running Jokes */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">😂 Inside Jokes</h3>
                  {chat.memorableMoments.results.runningJokes.map((joke, i) => (
                    <div key={i} className="bg-white/50 p-3 rounded-lg mb-2 animate-slideIn"
                         style={{animationDelay: `${i * 0.2}s`}}>
                      <p className="font-bold">{joke.joke}</p>
                      <p className="text-sm text-gray-600">{joke.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-bounce">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};   
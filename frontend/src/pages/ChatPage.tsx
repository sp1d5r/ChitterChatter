import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';
import { ChatData } from 'shared/src/types/Chat';

export const ChatPage = () => {
  const { chatId } = useParams();
  const { authState } = useAuth();
  const [chat, setChat] = useState<ChatData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isShared = location.search.includes('shared=true');

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
  
  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.href}${window.location.search ? '&' : '?'}shared=true`;
    const shareData = {
      title: `${chat?.conversationType || 'Chat'} Wrapped`,
      text: `Check out our ${chat?.conversationType || 'chat'} analysis! ${chat?.messageCount || 0} messages of pure chaos 😂`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [chat]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTryItOut = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-6">
      {chat ? (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Share/Back/Try It Button Row */}
          <div className="flex justify-between px-2 sm:px-0">
            {isShared ? (
              <button
                onClick={handleTryItOut}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 
                         rounded-full shadow-md transform transition-all duration-300 
                         hover:scale-105 hover:shadow-lg text-white font-medium text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">✨</span>
                Analyze Your Own Chats!
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md
                         transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                         text-purple-600 font-medium text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">←</span>
                Back to Dashboard
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md
                       transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                       text-purple-600 font-medium text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">🔗</span>
              Share Results
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                         bg-clip-text text-transparent mb-4 sm:mb-6 animate-pulse">
              ✨ {chat.conversationType || 'Chat'} Wrapped
            </h1>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div className="p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-pink-200
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-purple-600">💬 Messages</p>
                <p className="text-xl sm:text-4xl font-bold">{chat.messageCount || 0}</p>
              </div>
              <div className="p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-blue-200
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-blue-600">👥 Members</p>
                <p className="text-xl sm:text-4xl font-bold">{chat.members?.length || 0}</p>
              </div>
              <div className="p-3 sm:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-teal-200
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-teal-600">🌟 Chaos</p>
                <p className="text-xl sm:text-4xl font-bold">{chat.groupVibe?.results.chaosLevel.rating}/10</p>
              </div>
            </div>

            {/* Group Personality Section */}
            {chat.groupVibe?.results && (
              <div className="bg-white border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl 
                            mb-4 sm:mb-8 animate-slideIn">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  🎭 Group Personality
                </h2>
                <p className="text-lg sm:text-xl mb-2">
                  <span className="font-bold">{chat.groupVibe.results.personalityType}</span>
                </p>
                <div className="space-y-2">
                  {chat.groupVibe.results.collectiveQuirks.map((quirk, i) => (
                    <p key={i} 
                       className="text-sm sm:text-lg animate-fadeIn" 
                       style={{animationDelay: `${i * 0.2}s`}}>
                      🌈 {quirk}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {chat.superlatives?.results && (
              <div className="bg-white border-2 border-amber-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  🏆 Chat Awards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {chat.superlatives.results.awards.map((award, i) => (
                    <div key={i} 
                         className="bg-white border-2 border-amber-100 p-3 sm:p-4 rounded-xl 
                                  transform transition-all hover:scale-105"
                         style={{animationDelay: `${i * 0.3}s`}}>
                      <h3 className="font-bold text-base sm:text-lg">🎉 {award.title}</h3>
                      <p className="text-xs sm:text-sm">Goes to: <span className="font-bold">{award.recipient}</span></p>
                      <p className="text-xs sm:text-sm italic">"{award.reason}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Sections */}
            <div className="space-y-4 sm:space-y-8">
              {/* Chaos Rankings */}
              <div className="mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-red-500 to-orange-500 bg-clip-text text-transparent">
                  🌶️ Chaos Rankings
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {[...chat.analysis.results]
                    .sort((a, b) => b.redFlagScore + b.toxicityScore - (a.redFlagScore + a.toxicityScore))
                    .map((member, i) => (
                      <div key={i} 
                           className={`bg-white p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-4
                                    transform transition-all hover:scale-[1.02] animate-slideIn
                                    ${i < 3 ? 'border-2 border-orange-200' : 'border-2 border-gray-100'}`}
                           style={{animationDelay: `${i * 0.1}s`}}>
                        <span className="text-2xl">{
                          i === 0 ? '🥇' : 
                          i === 1 ? '🥈' : 
                          i === 2 ? '🥉' : 
                          '👀'
                        }</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-bold">{member.memberId}</p>
                            <p className="text-sm text-gray-500">#{i + 1}</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span>🚩 {member.redFlagScore}/10</span>
                            <span>☢️ {member.toxicityScore}/10</span>
                          </div>
                          {i < 3 && (
                            <p className="text-sm text-red-500 italic mt-1">
                              "{member.redFlagReasons[0]}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Comedy Rankings */}
              <div className="mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  🎭 Comedy Rankings
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {[...chat.analysis.results]
                    .sort((a, b) => b.funnyScore - a.funnyScore)
                    .map((member, i) => (
                      <div key={i} 
                           className={`bg-white p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-4
                                    transform transition-all hover:scale-[1.02] animate-slideIn
                                    ${i < 3 ? 'border-2 border-blue-200' : 'border-2 border-gray-100'}`}
                           style={{animationDelay: `${i * 0.1}s`}}>
                        <span className="text-2xl">{
                          i === 0 ? '👑' : 
                          i === 1 ? '🎭' : 
                          i === 2 ? '🃏' : 
                          '😊'
                        }</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-bold">{member.memberId}</p>
                            <p className="text-sm text-gray-500">#{i + 1}</p>
                          </div>
                          <p className="text-sm">Funny Rating: {member.funnyScore}/10</p>
                          {i < 3 && member.funnyMoments.length > 0 && (
                            <p className="text-sm text-blue-500 italic mt-1">
                              "{member.funnyMoments[0]}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Topic Champions - Grid Layout for Everyone */}
              <div className="mb-4 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  🎯 Everyone's Hot Topics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...chat.analysis.results]
                    .sort((a, b) => b.topicAnalysis[0].frequency - a.topicAnalysis[0].frequency)
                    .map((member, i) => (
                      <div key={i} 
                           className={`bg-white p-4 rounded-xl transform transition-all 
                                    hover:scale-[1.02] animate-fadeIn
                                    ${i < 4 ? 'border-2 border-purple-200' : ''}`}
                           style={{animationDelay: `${i * 0.1}s`}}>
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{member.memberId}</p>
                          {i < 3 && <span className="text-xl">{i === 0 ? '🎯' : i === 1 ? '🎪' : '🎨'}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.topicAnalysis.slice(0, 2).map((topic, j) => (
                            <span key={j} 
                                  className="px-2 py-1 bg-purple-100 rounded-full text-sm">
                              {topic.topic} ({topic.frequency}x)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Cringe Kings/Queens */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  😬 Cringe Champions
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {[...chat.analysis.results]
                    .sort((a, b) => b.cringeScore - a.cringeScore)
                    .slice(0, 3)
                    .map((member, i) => (
                      <div key={i} 
                           className={`bg-white p-4 rounded-xl flex items-center gap-2 sm:gap-4
                                    transform transition-all hover:scale-[1.02] animate-slideIn
                                    ${i < 3 ? 'border-2 border-orange-200' : 'border-2 border-gray-100'}`}
                           style={{animationDelay: `${i * 0.2}s`}}>
                        <span className="text-2xl">{
                          i === 0 ? '😬' : i === 1 ? '🫣' : '😅'
                        }</span>
                        <div className="flex-1">
                          <p className="font-bold">{member.memberId}</p>
                          <p className="text-sm">Cringe Score: {member.cringeScore}/10</p>
                          <p className="text-sm text-orange-500 italic mt-1">
                            "{member.cringeMoments[0]}"
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-bounce">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent 
                          rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};   
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';
import { ChatData } from 'shared/src/types/Chat';
import { ClipboardIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ResponsiveContainer, CartesianGrid } from 'recharts';

export const ChatPage = () => {
  const { chatId } = useParams();
  const { authState } = useAuth();
  const [chat, setChat] = useState<ChatData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isShared = location.search.includes('shared=true');
  
  // Get userId from either auth or URL params
  const searchParams = new URLSearchParams(location.search);
  const sharedUserId = searchParams.get('userId');
  const userId = isShared ? sharedUserId : authState.user?.uid;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (userId && chatId) {
      // Use userId from either auth or URL params
      unsubscribe = FirebaseDatabaseService.listenToDocument<ChatData>(
        `chats/${userId}/conversations/`,
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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, chatId]);
  
  const handleShare = useCallback(async () => {
    // Add userId to share URL
    const shareUrl = `${window.location.href}${window.location.search ? '&' : '?'}shared=true&userId=${authState.user?.uid}`;
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
  }, [chat, authState.user?.uid]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTryItOut = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen dark:bg-background p-2 sm:p-6 dark:text-white">
      {chat ? (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
          {/* Share/Back/Try It Button Row */}
          <div className="flex justify-between px-2 sm:px-0">
            {isShared ? (
              <button
                onClick={handleTryItOut}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary 
                         rounded-full shadow-md transform transition-all duration-300 
                         hover:scale-105 hover:shadow-lg text-coffee-900 dark:text-coffee-50 font-medium text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">✨</span>
                Analyze Your Own Chats!
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-coffee-50 dark:bg-transparent border-2 border-violet-200 rounded-full shadow-md
                         transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                         text-coffee-700 dark:text-coffee-200 font-medium text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">←</span>
                Back to Dashboard
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const shareUrl = `${window.location.href}${window.location.search ? '&' : '?'}shared=true&userId=${authState.user?.uid}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="hidden sm:flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md
                          transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                          text-purple-600"
                aria-label="Copy link to clipboard"
              >
                <span className="text-lg">
                  <ClipboardIcon className="w-6 h-6" /> 
                </span>
              </button>
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
          </div>

          {/* Main Content */}
          <div className="bg-coffee-50 dark:bg-black rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                         bg-clip-text text-transparent mb-4 sm:mb-6 animate-pulse">
              ✨ {chat.conversationType || 'Chat'} Wrapped
            </h1>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div className="p-3 sm:p-6 bg-coffee-50 dark:bg-transparent border-2 border-violet-200 rounded-xl sm:rounded-2xl 
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-purple-600">💬 Messages</p>
                <p className="text-xl sm:text-4xl font-bold">{chat?.messageCount ?? 0}</p>
              </div>
              <div className="p-3 sm:p-6 bg-coffee-50 dark:bg-transparent border-2 border-violet-200 rounded-xl sm:rounded-2xl 
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-blue-600">👥 Members</p>
                <p className="text-xl sm:text-4xl font-bold">{chat?.members?.length ?? 0}</p>
              </div>
              <div className="p-3 sm:p-6 bg-coffee-50 dark:bg-transparent border-2 border-violet-200 rounded-xl sm:rounded-2xl 
                            transform transition-all hover:-translate-y-1">
                <p className="text-sm sm:text-lg text-teal-600">🌟 Chaos</p>
                <p className="text-xl sm:text-4xl font-bold">{chat?.groupVibe?.results?.chaosLevel?.rating ?? 0}/10</p>
              </div>
            </div>

            {/* Group Personality Section */}
            {chat?.groupVibe?.results && chat.groupVibe.results.personalityType && (
              <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl 
                            mb-4 sm:mb-8 animate-slideIn">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  🎭 Group Personality
                </h2>
                <p className="text-lg sm:text-xl mb-2">
                  <span className="font-bold">{chat.groupVibe.results.personalityType}</span>
                </p>
                <div className="space-y-2">
                  {chat.groupVibe.results.collectiveQuirks?.map((quirk, i) => (
                    quirk && (
                      <p key={i} 
                         className="text-sm sm:text-lg animate-fadeIn" 
                         style={{animationDelay: `${i * 0.2}s`}}>
                        🌈 {quirk}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Awards Section */}
            {chat?.superlatives?.results?.awards && chat.superlatives.results.awards.length > 0 && (
              <div className="bg-coffee-50 dark:bg-transparent border-2 border-amber-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                             from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  🏆 Chat Awards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {chat.superlatives.results.awards.map((award, i) => (
                    award && (
                      <div key={i} 
                           className="bg-coffee-50 dark:bg-transparent border-2 border-amber-100 p-3 sm:p-4 rounded-xl 
                                    transform transition-all hover:scale-105"
                           style={{animationDelay: `${i * 0.3}s`}}>
                        <h3 className="font-bold text-base sm:text-lg">🎉 {award.title || 'Mystery Award'}</h3>
                        <p className="text-xs sm:text-sm">Goes to: <span className="font-bold">{award.recipient || 'Someone Special'}</span></p>
                        <p className="text-xs sm:text-sm italic">"{award.reason || 'For being awesome'}"</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Sections */}
            <div className="space-y-4 sm:space-y-8">
              {/* Chaos Rankings */}
              {chat?.analysis?.results && chat.analysis.results.length > 0 && (
                <div className="mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                               from-red-500 to-orange-500 bg-clip-text text-transparent">
                    🌶️ Chaos Rankings
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {[...chat.analysis.results]
                      .sort((a, b) => ((b?.redFlagScore ?? 0) + (b?.toxicityScore ?? 0)) - ((a?.redFlagScore ?? 0) + (a?.toxicityScore ?? 0)))
                      .map((member, i) => (
                        member && (
                          <div key={i} 
                               className={`bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-4
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
                                    <span>🚩 {member.redFlagScore ?? 0}/10</span>
                                    <span>☢️ {member.toxicityScore ?? 0}/10</span>
                                  </div>
                                  {i < 3 && member.redFlagReasons?.[0] && (
                                    <p className="text-sm text-red-500 italic mt-1">
                                      "{member.redFlagReasons[0]}"
                                    </p>
                                  )}
                                </div>
                              </div>
                        )
                      ))}
                  </div>
                </div>
              )}

              {/* Comedy Rankings */}
              {chat?.analysis?.results && chat.analysis.results.length > 0 && (
                <div className="mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                               from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    🎭 Comedy Rankings
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {[...chat.analysis.results]
                      .sort((a, b) => (b?.funnyScore ?? 0) - (a?.funnyScore ?? 0))
                      .map((member, i) => (
                        member && (
                          <div key={i} 
                               className={`bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-4
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
                                  {i < 3 && member.funnyMoments?.length > 0 && (
                                    <p className="text-sm text-blue-500 italic mt-1">
                                      "{member.funnyMoments[0]}"
                                    </p>
                                  )}
                                </div>
                              </div>
                        )
                      ))}
                  </div>
                </div>
              )}

              {/* Topic Champions */}
              {chat?.analysis?.results && chat.analysis.results.length > 0 && (
                <div className="mb-4 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                               from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    🎯 Everyone's Hot Topics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...chat.analysis.results]
                      .sort((a, b) => ((b?.topicAnalysis?.[0]?.frequency ?? 0) - (a?.topicAnalysis?.[0]?.frequency ?? 0)))
                      .map((member, i) => (
                        member && member.topicAnalysis && (
                          <div key={i} 
                               className={`bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 rounded-xl transform transition-all 
                                        hover:scale-[1.02] animate-fadeIn
                                        ${i < 4 ? 'border-2 border-purple-200' : ''}`}
                               style={{animationDelay: `${i * 0.1}s`}}>
                              <div className="flex justify-between items-center">
                                <p className="font-bold">{member.memberId}</p>
                                {i < 3 && <span className="text-xl">{i === 0 ? '🎯' : i === 1 ? '🎪' : '🎨'}</span>}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {member.topicAnalysis.slice(0, 2).map((topic, j) => (
                                  topic && (
                                    <span key={j} className="px-2 py-1 bg-purple-100 dark:bg-transparent dark:border-2 dark:border-violet-200 rounded-full text-sm">
                                      {topic.topic || 'Unknown'} ({topic.frequency ?? 0}x)
                                    </span>
                                  )
                                ))}
                              </div>
                            </div>
                        )
                      ))}
                  </div>
                </div>
              )}

              {/* Cringe Kings/Queens */}
              {chat?.analysis?.results && chat.analysis.results.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 bg-gradient-to-r 
                               from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    😬 Cringe Champions
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {[...chat.analysis.results]
                      .sort((a, b) => (b?.cringeScore ?? 0) - (a?.cringeScore ?? 0))
                      .slice(0, 3)
                      .map((member, i) => (
                        <div key={i} 
                             className={`bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 rounded-xl flex items-center gap-2 sm:gap-4
                                      transform transition-all hover:scale-[1.02] animate-slideIn
                                      ${i < 3 ? 'border-2 border-orange-200' : 'border-2 border-gray-100'}`}
                             style={{animationDelay: `${i * 0.2}s`}}>
                          <span className="text-2xl">{
                            i === 0 ? '😬' : i === 1 ? '🫣' : '😅'
                          }</span>
                          <div className="flex-1">
                            <p className="font-bold">{member?.memberId || 'Anonymous'}</p>
                            <p className="text-sm">Cringe Score: {member?.cringeScore ?? 0}/10</p>
                            {member?.cringeMoments?.length > 0 && (
                              <p className="text-sm text-orange-500 italic mt-1">
                                "{member.cringeMoments[0]}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analytics */}
            {chat?.analytics && (
              <div className="space-y-6">
                {/* Message Distribution */}
                <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-xl font-bold mb-4">Message Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(chat.analytics.memberStats).map(([member, stats]) => (
                      <div key={member} 
                           className="flex items-center gap-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{member}</p>
                          <p className="text-sm text-muted-foreground">
                            {stats.messageCount} messages ({Math.round(stats.messageCount / chat.analytics!.groupStats.totalMessages * 100)}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-xl font-bold mb-4">Weekly Activity</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={Object.entries(chat.analytics.groupStats.timeline.daily)
                          .map(([day, count]) => ({
                            day: day.slice(0, 3), // Take first 3 letters of day name
                            messages: count
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="messages" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Timeline */}
                <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-xl font-bold mb-4">Daily Timeline</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(chat.analytics.groupStats.timeline.hourly)
                          .map(([hour, count]) => ({
                            hour: `${hour.padStart(2, '0')}:00`,
                            messages: count
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="messages" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Words and Emojis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Top Words</h3>
                    <div className="space-y-2">
                      {chat.analytics.groupStats.topWords.map((word, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium">{word.word}</span>
                          <span className="text-muted-foreground">{word.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Top Emojis</h3>
                    <div className="space-y-2">
                      {chat.analytics.groupStats.topEmojis.map((emoji, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-2xl">{emoji.emoji}</span>
                          <span className="text-muted-foreground">{emoji.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Spent & Laugh Counter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Time Spent Messaging</h3>
                    {Object.entries(chat.analytics.memberStats).map(([member, stats]) => (
                      <div key={member} className="flex justify-between items-center mb-2">
                        <span className="font-medium">{member}</span>
                        <span className="text-muted-foreground">
                          {Math.round(stats.estimatedTimeSpent / 60 / 24 * 10) / 10} days
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-coffee-50 dark:bg-transparent border-2 border-violet-200 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Laugh Counter</h3>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl">😂</span>
                      <div className="text-center">
                        <p className="text-3xl font-bold">{chat.analytics.groupStats.laughCount}</p>
                        <p className="text-sm text-muted-foreground">times</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
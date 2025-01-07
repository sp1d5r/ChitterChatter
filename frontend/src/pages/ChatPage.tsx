import React from "react";
import { useParams } from 'react-router-dom';

export const ChatPage = () => {
  const { chatId } = useParams();
  
  return (
    <div>Chat ID: {chatId}</div>
  );
};   
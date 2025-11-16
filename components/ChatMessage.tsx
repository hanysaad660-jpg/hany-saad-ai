import React from 'react';
import { ChatMessage as ChatMessageType, MessageContent, MessageRole, GroundingSource } from '../types';
import { UserIcon, BotIcon, SpeakerIcon } from './Icons';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak: (text: string) => void;
}

const ContentRenderer: React.FC<{ content: MessageContent }> = ({ content }) => {
  switch (content.type) {
    case 'text':
      return (
        <div className="prose prose-invert prose-p:my-2 prose-headings:my-2 prose-ul:my-2 max-w-full">
            <Markdown remarkPlugins={[remarkGfm]}>{content.data}</Markdown>
        </div>
      );
    case 'image':
      return (
        <img
          src={content.data.startsWith('data:') ? content.data : `data:${content.mimeType};base64,${content.data}`}
          alt="Generated content"
          className="rounded-lg max-w-sm"
        />
      );
    case 'video':
      return (
        <CustomVideoPlayer src={content.data} />
      );
    case 'audio':
      return <audio controls src={content.data} />;
    case 'loading':
      return (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-400"></div>
          <span>{content.data}</span>
        </div>
      );
    case 'error':
        return (
            <div className="text-red-400 bg-red-900/50 p-3 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{content.data}</p>
            </div>
        );
    default:
      return null;
  }
};

const SourceList: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => (
    <div className="mt-2 border-t border-gray-600 pt-2">
        <h4 className="text-xs font-bold text-gray-400 mb-1">المصادر:</h4>
        <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
                <a 
                    key={index} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-blue-300 text-xs px-2 py-1 rounded-full transition-colors"
                >
                    {index + 1}. {source.title}
                </a>
            ))}
        </div>
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
  const isUser = message.role === MessageRole.USER;
  const textContentForSpeech = message.content.filter(c => c.type === 'text').map(c => c.data).join(' ');

  return (
    <div className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-white" />
        </div>
      )}
      <div className={`flex flex-col max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-2xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
          <div className="space-y-4">
             {message.content.map((content, index) => (
                <ContentRenderer key={index} content={content} />
            ))}
          </div>
          {message.sources && message.sources.length > 0 && <SourceList sources={message.sources} />}
        </div>
         {!isUser && textContentForSpeech && (
            <button 
                onClick={() => onSpeak(textContentForSpeech)} 
                className="mt-2 p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Read message aloud"
            >
                <SpeakerIcon className="w-5 h-5" />
            </button>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-gray-200" />
        </div>
      )}
    </div>
  );
};

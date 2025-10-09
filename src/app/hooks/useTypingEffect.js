"use client";

import { useState, useEffect, useRef } from 'react';

export function useTypingEffect(message = '', onMessageEnd) {
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setDisplayedMessage('');
        setIsTyping(true);
    }, [message]);

    useEffect(() => {
        if (isTyping && displayedMessage.length < message.length) {
            timeoutRef.current = setTimeout(() => {
                setDisplayedMessage(message.substring(0, displayedMessage.length + 1));
            }, 30);
        } else if (displayedMessage.length === message.length && message !== '') {
            if (isTyping) {
                setIsTyping(false);
                if (onMessageEnd) {
                    timeoutRef.current = setTimeout(onMessageEnd, 1000);
                }
            }
        }
        return () => clearTimeout(timeoutRef.current);
    }, [displayedMessage, isTyping, message, onMessageEnd]);

    const handleSkip = () => {
        clearTimeout(timeoutRef.current);
        if (isTyping) {
            setIsTyping(false);
            setDisplayedMessage(message);
            if (onMessageEnd) {
                timeoutRef.current = setTimeout(onMessageEnd, 1000);
            }
        } else {
            if (onMessageEnd) {
                onMessageEnd();
            }
        }
    };

    return { displayedMessage, isTyping, handleSkip };
}
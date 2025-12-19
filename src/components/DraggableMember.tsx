'use client';

import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Member } from '@/types';

interface DraggableMemberProps {
  member: Member;
  teamColor?: 'red' | 'green' | null;
  onNameChange?: (memberId: string, newName: string) => void;
}

export default function DraggableMember({ member, teamColor, onNameChange }: DraggableMemberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.id,
    data: { member },
    disabled: isEditing,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getBorderStyle = () => {
    if (teamColor === 'red') return 'border-l-4 border-l-[#ff3b30]';
    if (teamColor === 'green') return 'border-l-4 border-l-[#34c759]';
    return '';
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update editName when member.name changes externally
  useEffect(() => {
    setEditName(member.name);
  }, [member.name]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== member.name && onNameChange) {
      onNameChange(member.id, editName.trim());
    } else {
      setEditName(member.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME入力中（変換中）はEnterを無視
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditName(member.name);
      setIsEditing(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setEditName(member.name);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : listeners)}
      {...(isEditing ? {} : attributes)}
      className={`member-card ${getBorderStyle()} ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''} flex items-center justify-between gap-2`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="editable-input flex-1"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className="flex-1 select-none">{member.name}</span>
          <button
            onClick={handleEditClick}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[#8e8e93] hover:text-[#007aff] p-1 rounded transition-colors"
            title="名前を編集"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

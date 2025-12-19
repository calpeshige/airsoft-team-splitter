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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(member.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== member.name && onNameChange) {
      onNameChange(member.id, editName.trim());
    } else {
      setEditName(member.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditName(member.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : listeners)}
      {...(isEditing ? {} : attributes)}
      onDoubleClick={handleDoubleClick}
      className={`member-card ${getBorderStyle()} ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="editable-input"
        />
      ) : (
        <span>{member.name}</span>
      )}
    </div>
  );
}

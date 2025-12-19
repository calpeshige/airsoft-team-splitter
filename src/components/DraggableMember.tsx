'use client';

import { useDraggable } from '@dnd-kit/core';
import { Member } from '@/types';

interface DraggableMemberProps {
  member: Member;
  teamColor?: 'red' | 'green' | null;
}

export default function DraggableMember({ member, teamColor }: DraggableMemberProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: member.id,
    data: { member },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getBorderColor = () => {
    if (teamColor === 'red') return 'border-l-4 border-l-red-500';
    if (teamColor === 'green') return 'border-l-4 border-l-green-500';
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`member-card ${getBorderColor()} ${isDragging ? 'dragging opacity-50' : ''}`}
    >
      {member.name}
    </div>
  );
}

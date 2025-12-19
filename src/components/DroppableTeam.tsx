'use client';

import { useDroppable } from '@dnd-kit/core';
import { Member } from '@/types';
import DraggableMember from './DraggableMember';

interface DroppableTeamProps {
  id: string;
  teamName: string;
  teamColor: 'red' | 'green';
  members: Member[];
  onNameChange?: (memberId: string, newName: string) => void;
}

export default function DroppableTeam({ id, teamName, teamColor, members, onNameChange }: DroppableTeamProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const teamStyles = teamColor === 'red' ? 'team-red' : 'team-green';
  const headerBg = teamColor === 'red' ? 'bg-[#ff3b30]' : 'bg-[#34c759]';
  const badgeClass = teamColor === 'red' ? 'badge badge-red' : 'badge badge-green';

  return (
    <div
      ref={setNodeRef}
      className={`${teamStyles} overflow-hidden min-h-[300px] transition-all ${
        isOver ? 'ring-4 ring-[#007aff]/40' : ''
      }`}
    >
      <div className={`${headerBg} text-white py-4 px-5`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {teamName}
          </h3>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {members.length}人
          </span>
        </div>
      </div>

      <div className="p-5 min-h-[250px]">
        {members.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-[#8e8e93] text-center text-base">
              ここにメンバーをドロップ
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <DraggableMember
                key={member.id}
                member={member}
                teamColor={teamColor}
                onNameChange={onNameChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

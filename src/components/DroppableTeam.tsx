'use client';

import { useDroppable } from '@dnd-kit/core';
import { Member } from '@/types';
import DraggableMember from './DraggableMember';

interface DroppableTeamProps {
  id: string;
  teamName: string;
  teamColor: 'red' | 'green';
  members: Member[];
}

export default function DroppableTeam({ id, teamName, teamColor, members }: DroppableTeamProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const teamStyles = teamColor === 'red' ? 'team-red' : 'team-green';
  const headerBg = teamColor === 'red' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div
      ref={setNodeRef}
      className={`${teamStyles} rounded-xl overflow-hidden min-h-[300px] transition-all ${
        isOver ? 'ring-4 ring-blue-400' : ''
      }`}
    >
      <div className={`${headerBg} text-white py-3 px-4`}>
        <h3 className="text-lg font-bold text-center">
          {teamName} ({members.length}人)
        </h3>
      </div>

      <div className="p-4 min-h-[250px]">
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            ここにメンバーをドロップ
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <DraggableMember
                key={member.id}
                member={member}
                teamColor={teamColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

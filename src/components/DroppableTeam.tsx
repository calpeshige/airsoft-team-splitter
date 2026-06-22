'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Member } from '@/types';
import DraggableMember from './DraggableMember';

interface DroppableTeamProps {
  id: string;
  teamName: string;
  teamColor: 'red' | 'green';
  members: Member[];
  onNameChange?: (memberId: string, newName: string) => void;
  onDeleteMember?: (memberId: string) => void;
}

export default function DroppableTeam({ id, teamName, teamColor, members, onNameChange, onDeleteMember }: DroppableTeamProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const teamStyles = teamColor === 'red' ? 'team-red' : 'team-green';
  // 白チームは白背景＋濃い文字＋グレー下線で表現（チーム編成の見出し帯と色が被らないように）
  const headerClass = teamColor === 'red'
    ? 'bg-[#ff3b30] text-white'
    : 'bg-white text-[#1d1d1f] border-b-2 border-[#8e8e93]';
  const countClass = teamColor === 'red' ? 'bg-white/20' : 'bg-black/10';

  return (
    <div
      ref={setNodeRef}
      className={`${teamStyles} overflow-hidden min-h-[300px] transition-all ${
        isOver ? 'ring-4 ring-[#007aff]/40' : ''
      }`}
    >
      <div className={`${headerClass} py-4 px-5`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {teamName}
          </h3>
          <span className={`${countClass} px-3 py-1 rounded-full text-sm font-medium`}>
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
          <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {members.map((member) => (
                <DraggableMember
                  key={member.id}
                  member={member}
                  teamColor={teamColor}
                  onNameChange={onNameChange}
                  onDeleteMember={onDeleteMember}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, closestCenter, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Member } from '@/types';
import DroppableTeam from './DroppableTeam';

interface TeamSectionProps {
  redTeam: Member[];
  greenTeam: Member[];
  onMoveToTeam: (memberId: string, targetTeam: 'red' | 'green') => void;
  onReorderTeam: (team: 'red' | 'green', members: Member[]) => void;
  onNameChange?: (memberId: string, newName: string) => void;
  downloadRef?: React.RefObject<HTMLDivElement | null>;
}

export default function TeamSection({ redTeam, greenTeam, onMoveToTeam, onReorderTeam, onNameChange, downloadRef }: TeamSectionProps) {
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const member = event.active.data.current?.member as Member;
    setActiveMember(member);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMember(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeTeamColor = active.data.current?.teamColor as 'red' | 'green';

    // ドロップ先がチームエリア自体の場合（チーム間移動）
    if (overId === 'red' || overId === 'green') {
      if (activeTeamColor !== overId) {
        onMoveToTeam(activeId, overId);
      }
      return;
    }

    // ドロップ先がメンバーの場合
    const overTeamColor = over.data.current?.teamColor as 'red' | 'green' | undefined;

    if (overTeamColor && activeTeamColor !== overTeamColor) {
      // チーム間移動
      onMoveToTeam(activeId, overTeamColor);
    } else if (activeTeamColor && activeTeamColor === overTeamColor) {
      // 同一チーム内の並び替え
      const team = activeTeamColor === 'red' ? redTeam : greenTeam;
      const oldIndex = team.findIndex(m => m.id === activeId);
      const newIndex = team.findIndex(m => m.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(team, oldIndex, newIndex);
        onReorderTeam(activeTeamColor, reordered);
      }
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div ref={downloadRef} className="grid grid-cols-2 gap-5 p-5 bg-[#f2f2f7] rounded-2xl">
          <DroppableTeam
            id="red"
            teamName="赤チーム"
            teamColor="red"
            members={redTeam}
            onNameChange={onNameChange}
          />
          <DroppableTeam
            id="green"
            teamName="緑チーム"
            teamColor="green"
            members={greenTeam}
            onNameChange={onNameChange}
          />
        </div>

        <DragOverlay>
          {activeMember ? (
            <div className="member-card bg-[#007aff]/10 border-2 border-[#007aff] shadow-lg">
              {activeMember.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

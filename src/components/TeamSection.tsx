'use client';

import { useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Member } from '@/types';
import DroppableTeam from './DroppableTeam';
import { toPng } from 'html-to-image';
import { useState } from 'react';

interface TeamSectionProps {
  redTeam: Member[];
  greenTeam: Member[];
  onMoveToTeam: (memberId: string, targetTeam: 'red' | 'green') => void;
  onNameChange?: (memberId: string, newName: string) => void;
  downloadRef?: React.RefObject<HTMLDivElement | null>;
}

export default function TeamSection({ redTeam, greenTeam, onMoveToTeam, onNameChange, downloadRef }: TeamSectionProps) {
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const member = event.active.data.current?.member as Member;
    setActiveMember(member);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMember(null);
    const { active, over } = event;

    if (!over) return;

    const memberId = active.id as string;
    const targetTeam = over.id as 'red' | 'green';

    if (targetTeam === 'red' || targetTeam === 'green') {
      onMoveToTeam(memberId, targetTeam);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

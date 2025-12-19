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
}

export default function TeamSection({ redTeam, greenTeam, onMoveToTeam }: TeamSectionProps) {
  const teamContainerRef = useRef<HTMLDivElement>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!teamContainerRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(teamContainerRef.current, {
        quality: 0.95,
        backgroundColor: '#f5f5f5',
      });

      const link = document.createElement('a');
      link.download = `チーム編成_${new Date().toLocaleDateString('ja-JP')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('画像のダウンロードに失敗しました:', error);
    }
    setIsDownloading(false);
  };

  const hasMembers = redTeam.length > 0 || greenTeam.length > 0;

  return (
    <div className="space-y-4">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div ref={teamContainerRef} className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-xl">
          <DroppableTeam
            id="red"
            teamName="赤チーム"
            teamColor="red"
            members={redTeam}
          />
          <DroppableTeam
            id="green"
            teamName="緑チーム"
            teamColor="green"
            members={greenTeam}
          />
        </div>

        <DragOverlay>
          {activeMember ? (
            <div className="member-card bg-blue-100 border-2 border-blue-500 shadow-lg">
              {activeMember.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {hasMembers && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              ダウンロード中...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              チーム編成をダウンロード (PNG)
            </>
          )}
        </button>
      )}
    </div>
  );
}

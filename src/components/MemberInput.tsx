'use client';

import { useState } from 'react';
import { Member } from '@/types';

interface MemberInputProps {
  onAddMembers: (members: Member[]) => void;
  onSplitTeams: () => void;
  hasMembers: boolean;
}

export default function MemberInput({ onAddMembers, onSplitTeams, hasMembers }: MemberInputProps) {
  const [inputText, setInputText] = useState('');

  const handleAddMembers = () => {
    const names = inputText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    const newMembers: Member[] = names.map((name, index) => ({
      id: `member-${Date.now()}-${index}`,
      name,
    }));

    onAddMembers(newMembers);
    setInputText('');
  };

  return (
    <div className="apple-card p-6 h-full">
      <h2 className="section-header text-xl mb-1">メンバー入力</h2>
      <p className="section-subheader text-sm mb-4">1行に1人ずつ入力</p>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="メンバー名を入力&#10;&#10;例:&#10;田中太郎&#10;鈴木一郎&#10;佐藤花子"
        className="apple-input w-full h-48 resize-none"
      />

      <div className="mt-5 space-y-3">
        <button
          onClick={handleAddMembers}
          disabled={!inputText.trim()}
          className="apple-button w-full"
        >
          メンバーを追加
        </button>

        <button
          onClick={onSplitTeams}
          disabled={!hasMembers}
          className="apple-button w-full"
          style={{ background: '#ff3b30', boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)' }}
        >
          チーム分け実行
        </button>
      </div>
    </div>
  );
}

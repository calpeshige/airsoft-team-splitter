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
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">メンバー入力</h2>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="メンバー名を入力&#10;（1行に1人）&#10;&#10;例:&#10;田中太郎&#10;鈴木一郎&#10;佐藤花子"
        className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:outline-none transition-colors"
      />

      <div className="mt-4 space-y-3">
        <button
          onClick={handleAddMembers}
          disabled={!inputText.trim()}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          メンバーを追加
        </button>

        <button
          onClick={onSplitTeams}
          disabled={!hasMembers}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all"
        >
          チーム分け実行
        </button>
      </div>
    </div>
  );
}

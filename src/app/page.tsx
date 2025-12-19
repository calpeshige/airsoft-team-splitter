'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Member, Car } from '@/types';
import MemberInput from '@/components/MemberInput';
import TeamSection from '@/components/TeamSection';
import CarManagement from '@/components/CarManagement';
import DownloadView from '@/components/DownloadView';
import { toPng } from 'html-to-image';

const STORAGE_KEY = 'airsoft-team-splitter-data';

interface SavedData {
  allMembers: Member[];
  redTeam: Member[];
  greenTeam: Member[];
  cars: Car[];
  assignedToCarIds: string[];
}

export default function Home() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [redTeam, setRedTeam] = useState<Member[]>([]);
  const [greenTeam, setGreenTeam] = useState<Member[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [assignedToCarIds, setAssignedToCarIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const downloadViewRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: SavedData = JSON.parse(saved);
        setAllMembers(data.allMembers || []);
        setRedTeam(data.redTeam || []);
        setGreenTeam(data.greenTeam || []);
        setCars(data.cars || []);
        setAssignedToCarIds(new Set(data.assignedToCarIds || []));
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const data: SavedData = {
        allMembers,
        redTeam,
        greenTeam,
        cars,
        assignedToCarIds: Array.from(assignedToCarIds),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }, [isLoaded, allMembers, redTeam, greenTeam, cars, assignedToCarIds]);

  const handleAddMembers = useCallback((newMembers: Member[]) => {
    setAllMembers(prev => [...prev, ...newMembers]);
  }, []);

  const handleSplitTeams = useCallback(() => {
    const shuffled = [...allMembers].sort(() => Math.random() - 0.5);
    const midpoint = Math.ceil(shuffled.length / 2);
    setRedTeam(shuffled.slice(0, midpoint));
    setGreenTeam(shuffled.slice(midpoint));
  }, [allMembers]);

  const handleMoveToTeam = useCallback((memberId: string, targetTeam: 'red' | 'green') => {
    const memberFromRed = redTeam.find(m => m.id === memberId);
    const memberFromGreen = greenTeam.find(m => m.id === memberId);
    const member = memberFromRed || memberFromGreen;

    if (!member) return;

    if (targetTeam === 'red' && memberFromGreen) {
      setGreenTeam(prev => prev.filter(m => m.id !== memberId));
      setRedTeam(prev => [...prev, member]);
    } else if (targetTeam === 'green' && memberFromRed) {
      setRedTeam(prev => prev.filter(m => m.id !== memberId));
      setGreenTeam(prev => [...prev, member]);
    }
  }, [redTeam, greenTeam]);

  const handleNameChange = useCallback((memberId: string, newName: string) => {
    setAllMembers(prev => prev.map(m => m.id === memberId ? { ...m, name: newName } : m));
    setRedTeam(prev => prev.map(m => m.id === memberId ? { ...m, name: newName } : m));
    setGreenTeam(prev => prev.map(m => m.id === memberId ? { ...m, name: newName } : m));
    setCars(prev => prev.map(car => ({
      ...car,
      driver: car.driver?.id === memberId ? { ...car.driver, name: newName } : car.driver,
      passengers: car.passengers.map(p => p?.id === memberId ? { ...p, name: newName } : p),
    })));
  }, []);

  const handleUpdateCars = useCallback((newCars: Car[]) => {
    setCars(newCars);
    const newAssignedIds = new Set<string>();
    newCars.forEach(car => {
      if (car.driver) newAssignedIds.add(car.driver.id);
      car.passengers.forEach(p => {
        if (p) newAssignedIds.add(p.id);
      });
    });
    setAssignedToCarIds(newAssignedIds);
  }, []);

  const handleRemoveMemberFromCar = useCallback((memberId: string) => {
    setAssignedToCarIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(memberId);
      return newSet;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('すべてのデータをリセットしますか？')) {
      setAllMembers([]);
      setRedTeam([]);
      setGreenTeam([]);
      setCars([]);
      setAssignedToCarIds(new Set());
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleDownloadAll = async () => {
    if (!downloadViewRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(downloadViewRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `サバゲー編成_${new Date().toLocaleDateString('ja-JP')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('画像のダウンロードに失敗しました:', error);
    }
    setIsDownloading(false);
  };

  const availableForCars = allMembers.filter(m => !assignedToCarIds.has(m.id));
  const hasMembers = redTeam.length > 0 || greenTeam.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight mb-2">
            サバゲーチーム分け
          </h1>
          <p className="text-[#8e8e93] text-lg">
            メンバーを入力してチーム分け・配車を管理
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Section (Left - 3 columns) */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Teams */}
              <TeamSection
                redTeam={redTeam}
                greenTeam={greenTeam}
                onMoveToTeam={handleMoveToTeam}
                onNameChange={handleNameChange}
              />

              {/* Car Management */}
              {allMembers.length > 0 && (
                <CarManagement
                  availableMembers={availableForCars}
                  cars={cars}
                  onUpdateCars={handleUpdateCars}
                  onRemoveMemberFromCar={handleRemoveMemberFromCar}
                />
              )}
            </div>

            {/* Hidden download view for image export */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <div ref={downloadViewRef}>
                <DownloadView
                  redTeam={redTeam}
                  greenTeam={greenTeam}
                  cars={cars}
                />
              </div>
            </div>

            {/* Download Button - outside the download area */}
            {hasMembers && (
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="apple-button w-full mt-6 flex items-center justify-center gap-3"
                style={{ background: '#8e44ad' }}
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
                    チーム編成＋配車をダウンロード
                  </>
                )}
              </button>
            )}
          </div>

          {/* Member Input (Right - 1 column) */}
          <div className="lg:col-span-1">
            <MemberInput
              onAddMembers={handleAddMembers}
              onSplitTeams={handleSplitTeams}
              hasMembers={allMembers.length > 0}
            />

            {/* Member Count Info */}
            {allMembers.length > 0 && (
              <div className="mt-4 apple-card p-5">
                <h3 className="font-semibold text-[#1d1d1f] mb-3">メンバー情報</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e93]">総人数</span>
                    <span className="font-semibold text-[#1d1d1f]">{allMembers.length}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e93]">赤チーム</span>
                    <span className="badge badge-red">{redTeam.length}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e93]">緑チーム</span>
                    <span className="badge badge-green">{greenTeam.length}人</span>
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 pt-4 border-t border-[#e5e5ea]">
                  <p className="text-xs text-[#8e8e93]">
                    💡 ✏️アイコンをクリックで名前を編集
                  </p>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="mt-4 w-full text-sm text-[#ff3b30] hover:text-[#ff3b30]/70 py-2 transition-colors"
                >
                  🗑️ すべてリセット
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

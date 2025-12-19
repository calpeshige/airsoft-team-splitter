'use client';

import { useState, useCallback } from 'react';
import { Member, Car } from '@/types';
import MemberInput from '@/components/MemberInput';
import TeamSection from '@/components/TeamSection';
import CarManagement from '@/components/CarManagement';

export default function Home() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [redTeam, setRedTeam] = useState<Member[]>([]);
  const [greenTeam, setGreenTeam] = useState<Member[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [assignedToCarIds, setAssignedToCarIds] = useState<Set<string>>(new Set());

  const handleAddMembers = useCallback((newMembers: Member[]) => {
    setAllMembers(prev => [...prev, ...newMembers]);
  }, []);

  const handleSplitTeams = useCallback(() => {
    // Shuffle all members
    const shuffled = [...allMembers].sort(() => Math.random() - 0.5);

    // Split into two teams
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

  const handleUpdateCars = useCallback((newCars: Car[]) => {
    setCars(newCars);

    // Update assigned member IDs
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

  // Members available for car assignment (not yet in a car)
  const availableForCars = allMembers.filter(m => !assignedToCarIds.has(m.id));

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            サバゲーチーム分け
          </h1>
          <p className="text-gray-600">
            メンバーを入力してチーム分け・配車を管理
          </p>
        </header>

        {/* Main Content - Team Section Left, Input Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Section (Left - 3 columns) */}
          <div className="lg:col-span-3">
            <TeamSection
              redTeam={redTeam}
              greenTeam={greenTeam}
              onMoveToTeam={handleMoveToTeam}
            />
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
              <div className="mt-4 bg-white rounded-lg p-4 shadow">
                <h3 className="font-semibold text-gray-700 mb-2">メンバー情報</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>総人数: {allMembers.length}人</p>
                  <p className="text-red-600">赤チーム: {redTeam.length}人</p>
                  <p className="text-green-600">緑チーム: {greenTeam.length}人</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Car Management Section */}
        {allMembers.length > 0 && (
          <CarManagement
            availableMembers={availableForCars}
            cars={cars}
            onUpdateCars={handleUpdateCars}
            onRemoveMemberFromCar={handleRemoveMemberFromCar}
          />
        )}
      </div>
    </div>
  );
}

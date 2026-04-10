'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, useDraggable } from '@dnd-kit/core';
import { Member, Car } from '@/types';
import { useState } from 'react';

interface CarManagementProps {
  availableMembers: Member[];
  cars: Car[];
  onUpdateCars: (cars: Car[]) => void;
  onRemoveMemberFromCar: (memberId: string) => void;
  onDeleteMember?: (memberId: string) => void;
  downloadRef?: React.RefObject<HTMLDivElement | null>;
}

function DroppableSlot({
  id,
  member,
  label,
  isDriver,
}: {
  id: string;
  member: Member | null;
  label: string;
  isDriver?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[130px] p-3 rounded-xl transition-all ${
        isOver
          ? 'bg-[#007aff]/10 border-2 border-[#007aff]'
          : member
          ? isDriver
            ? 'bg-[#ff9500]/10 border-2 border-[#ff9500]/30'
            : 'bg-[#f2f2f7] border-2 border-transparent'
          : 'border-2 border-dashed border-[#8e8e93]/30 bg-[#f2f2f7]/50'
      }`}
    >
      <div className="text-xs text-[#8e8e93] mb-1 font-medium">{label}</div>
      {member ? (
        <div className={`text-sm font-semibold ${isDriver ? 'text-[#ff9500]' : 'text-[#1d1d1f]'}`}>
          {isDriver && '🚗 '}{member.name}
        </div>
      ) : (
        <div className="text-sm text-[#8e8e93]/60">ドロップ</div>
      )}
    </div>
  );
}

function DraggableCarMember({ member, onDeleteMember }: { member: Member; onDeleteMember?: (memberId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `car-${member.id}`,
    data: { member, fromCar: true },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 cursor-grab shadow-sm hover:shadow-md transition-all font-medium text-sm flex items-center gap-2 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <span>{member.name}</span>
      {onDeleteMember && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteMember(member.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[#8e8e93] hover:text-[#ff3b30] transition-colors flex-shrink-0"
          title="メンバーを削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default function CarManagement({
  availableMembers,
  cars,
  onUpdateCars,
  onRemoveMemberFromCar,
  onDeleteMember,
  downloadRef,
}: CarManagementProps) {
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const handleAddCar = () => {
    const newCar: Car = {
      id: `car-${Date.now()}`,
      driver: null,
      passengers: [null],
    };
    onUpdateCars([newCar, ...cars]);
  };

  const handleRemoveCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (car) {
      if (car.driver) onRemoveMemberFromCar(car.driver.id);
      car.passengers.forEach(p => {
        if (p) onRemoveMemberFromCar(p.id);
      });
    }
    onUpdateCars(cars.filter(c => c.id !== carId));
  };

  const handleRemoveDriverFromCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (car?.driver) {
      onRemoveMemberFromCar(car.driver.id);
    }
    onUpdateCars(
      cars.map(car => {
        if (car.id === carId) {
          return { ...car, driver: null };
        }
        return car;
      })
    );
  };

  const handleAddPassengerSlot = (carId: string) => {
    onUpdateCars(
      cars.map(car => {
        if (car.id === carId) {
          return { ...car, passengers: [...car.passengers, null] };
        }
        return car;
      })
    );
  };

  const handleRemovePassengerSlot = (carId: string, index: number) => {
    const car = cars.find(c => c.id === carId);
    if (car) {
      const passenger = car.passengers[index];
      if (passenger) {
        onRemoveMemberFromCar(passenger.id);
      }
    }
    onUpdateCars(
      cars.map(car => {
        if (car.id === carId) {
          const newPassengers = car.passengers.filter((_, i) => i !== index);
          return { ...car, passengers: newPassengers.length > 0 ? newPassengers : [null] };
        }
        return car;
      })
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const member = event.active.data.current?.member as Member;
    setActiveMember(member);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMember(null);
    const { active, over } = event;

    if (!over) return;

    const member = active.data.current?.member as Member;
    const fromCar = active.data.current?.fromCar as boolean;
    const targetId = over.id as string;

    // Parse target: driver-{carId} or passenger-{carId}-{index}
    const parts = targetId.split('-');

    if (parts[0] === 'driver') {
      const carId = parts.slice(1).join('-');

      // First, remove from old position if from car
      let updatedCars = [...cars];
      if (fromCar) {
        updatedCars = updatedCars.map(car => {
          let newCar = { ...car };
          if (car.driver?.id === member.id) {
            newCar = { ...newCar, driver: null };
          }
          newCar = {
            ...newCar,
            passengers: car.passengers.map(p => (p?.id === member.id ? null : p)),
          };
          return newCar;
        });
      }

      // Then place in new position
      updatedCars = updatedCars.map(car => {
        if (car.id === carId) {
          const oldDriver = car.driver;
          if (oldDriver && oldDriver.id !== member.id) {
            onRemoveMemberFromCar(oldDriver.id);
          }
          return { ...car, driver: member };
        }
        return car;
      });

      onUpdateCars(updatedCars);

    } else if (parts[0] === 'passenger') {
      const carId = parts.slice(1, -1).join('-');
      const passengerIndex = parseInt(parts[parts.length - 1]);

      // First, remove from old position if from car
      let updatedCars = [...cars];
      if (fromCar) {
        updatedCars = updatedCars.map(car => {
          let newCar = { ...car };
          if (car.driver?.id === member.id) {
            newCar = { ...newCar, driver: null };
          }
          newCar = {
            ...newCar,
            passengers: car.passengers.map(p => (p?.id === member.id ? null : p)),
          };
          return newCar;
        });
      }

      // Then place in new position
      updatedCars = updatedCars.map(car => {
        if (car.id === carId) {
          const newPassengers = [...car.passengers];
          const oldPassenger = newPassengers[passengerIndex];
          if (oldPassenger && oldPassenger.id !== member.id) {
            onRemoveMemberFromCar(oldPassenger.id);
          }
          newPassengers[passengerIndex] = member;
          return { ...car, passengers: newPassengers };
        }
        return car;
      });

      onUpdateCars(updatedCars);

    } else if (targetId === 'available-members') {
      // Return member to available list
      if (fromCar) {
        onRemoveMemberFromCar(member.id);
        onUpdateCars(
          cars.map(car => {
            let newCar = { ...car };
            if (car.driver?.id === member.id) {
              newCar = { ...newCar, driver: null };
            }
            newCar = {
              ...newCar,
              passengers: car.passengers.map(p => (p?.id === member.id ? null : p)),
            };
            return newCar;
          })
        );
      }
    }
  };

  const { setNodeRef: setAvailableRef, isOver: isOverAvailable } = useDroppable({
    id: 'available-members',
  });

  return (
    <div ref={downloadRef} className="apple-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="section-header text-xl">配車管理</h2>
          <p className="section-subheader text-sm mt-1">メンバーをドラッグして配置</p>
        </div>
        <button
          onClick={handleAddCar}
          className="apple-button text-sm py-2.5 px-5"
        >
          + 車を追加
        </button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Available Members */}
        <div
          ref={setAvailableRef}
          className={`mb-6 p-5 rounded-2xl transition-all ${
            isOverAvailable ? 'bg-[#34c759]/10 border-2 border-[#34c759]' : 'bg-[#f2f2f7] border-2 border-transparent'
          }`}
        >
          <h3 className="text-sm font-semibold text-[#8e8e93] mb-4">未配置メンバー</h3>
          <div className="flex flex-wrap gap-3 min-h-[48px]">
            {availableMembers.length === 0 ? (
              <p className="text-[#8e8e93]/60 text-sm">全員配置済み</p>
            ) : (
              availableMembers.map(member => (
                <DraggableCarMember key={member.id} member={member} onDeleteMember={onDeleteMember} />
              ))
            )}
          </div>
        </div>

        {/* Cars */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {cars.map((car, carIndex) => (
            <div key={car.id} className="car-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#1d1d1f] text-lg">🚙 車 {carIndex + 1}</h3>
                <button
                  onClick={() => handleRemoveCar(car.id)}
                  className="text-[#ff3b30] hover:text-[#ff3b30]/70 text-sm font-medium transition-colors"
                >
                  削除
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-start">
                {/* Driver */}
                <div className="relative">
                  <DroppableSlot
                    id={`driver-${car.id}`}
                    member={car.driver}
                    label="運転手"
                    isDriver
                  />
                  {car.driver && (
                    <button
                      onClick={() => handleRemoveDriverFromCar(car.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full text-xs font-bold hover:bg-[#ff3b30]/80 transition-colors shadow-md"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Passengers */}
                {car.passengers.map((passenger, index) => (
                  <div key={index} className="relative">
                    <DroppableSlot
                      id={`passenger-${car.id}-${index}`}
                      member={passenger}
                      label={`同乗者 ${index + 1}`}
                    />
                    <button
                      onClick={() => handleRemovePassengerSlot(car.id, index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff3b30] text-white rounded-full text-xs font-bold hover:bg-[#ff3b30]/80 transition-colors shadow-md"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add Passenger Button */}
                <button
                  onClick={() => handleAddPassengerSlot(car.id)}
                  className="min-w-[130px] p-3 rounded-xl border-2 border-dashed border-[#007aff]/30 bg-[#007aff]/5 hover:bg-[#007aff]/10 transition-all flex items-center justify-center"
                >
                  <span className="text-[#007aff] font-semibold text-sm">+ 同乗者</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeMember ? (
            <div className="bg-[#007aff]/10 border-2 border-[#007aff] rounded-xl px-4 py-2.5 shadow-lg font-medium text-sm">
              {activeMember.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#8e8e93] text-base">
            「車を追加」ボタンで車を追加してください
          </p>
        </div>
      )}
    </div>
  );
}

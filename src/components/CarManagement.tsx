'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { Member, Car } from '@/types';
import { useState } from 'react';

interface CarManagementProps {
  availableMembers: Member[];
  cars: Car[];
  onUpdateCars: (cars: Car[]) => void;
  onRemoveMemberFromCar: (memberId: string) => void;
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
      className={`min-w-[120px] p-2 rounded-lg border-2 transition-all ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : member
          ? isDriver
            ? 'border-yellow-400 bg-yellow-50'
            : 'border-gray-300 bg-gray-50'
          : 'border-dashed border-gray-300'
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {member ? (
        <div className={`text-sm font-medium ${isDriver ? 'text-yellow-700' : 'text-gray-700'}`}>
          {isDriver && '🚗 '}{member.name}
        </div>
      ) : (
        <div className="text-sm text-gray-400">ドロップ</div>
      )}
    </div>
  );
}

function DraggableCarMember({ member }: { member: Member }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = require('@dnd-kit/core').useDraggable({
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
      className={`bg-white border rounded-lg px-3 py-2 cursor-grab shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {member.name}
    </div>
  );
}

export default function CarManagement({
  availableMembers,
  cars,
  onUpdateCars,
  onRemoveMemberFromCar,
}: CarManagementProps) {
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const handleAddCar = () => {
    const newCar: Car = {
      id: `car-${Date.now()}`,
      driver: null,
      passengers: [null],
    };
    onUpdateCars([...cars, newCar]);
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
    onUpdateCars(
      cars.map(car => {
        if (car.id === carId) {
          const passenger = car.passengers[index];
          if (passenger) {
            onRemoveMemberFromCar(passenger.id);
          }
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
      onUpdateCars(
        cars.map(car => {
          if (car.id === carId) {
            const oldDriver = car.driver;
            if (oldDriver) onRemoveMemberFromCar(oldDriver.id);
            return { ...car, driver: member };
          }
          return car;
        })
      );
      if (fromCar) {
        // Remove from old position
        onUpdateCars(
          cars.map(car => {
            if (car.driver?.id === member.id && car.id !== carId) {
              return { ...car, driver: null };
            }
            return {
              ...car,
              passengers: car.passengers.map(p => (p?.id === member.id ? null : p)),
            };
          })
        );
      }
    } else if (parts[0] === 'passenger') {
      const carId = parts.slice(1, -1).join('-');
      const passengerIndex = parseInt(parts[parts.length - 1]);
      onUpdateCars(
        cars.map(car => {
          if (car.id === carId) {
            const newPassengers = [...car.passengers];
            const oldPassenger = newPassengers[passengerIndex];
            if (oldPassenger) onRemoveMemberFromCar(oldPassenger.id);
            newPassengers[passengerIndex] = member;
            return { ...car, passengers: newPassengers };
          }
          return car;
        })
      );
      if (fromCar) {
        onUpdateCars(
          cars.map(car => {
            if (car.driver?.id === member.id) {
              return { ...car, driver: null };
            }
            return {
              ...car,
              passengers: car.passengers.map((p, i) => {
                if (p?.id === member.id && !(car.id === carId && i === passengerIndex)) {
                  return null;
                }
                return p;
              }),
            };
          })
        );
      }
    } else if (targetId === 'available-members') {
      // Return member to available list
      if (fromCar) {
        onRemoveMemberFromCar(member.id);
        onUpdateCars(
          cars.map(car => {
            if (car.driver?.id === member.id) {
              return { ...car, driver: null };
            }
            return {
              ...car,
              passengers: car.passengers.map(p => (p?.id === member.id ? null : p)),
            };
          })
        );
      }
    }
  };

  const { setNodeRef: setAvailableRef, isOver: isOverAvailable } = useDroppable({
    id: 'available-members',
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">配車管理</h2>
        <button
          onClick={handleAddCar}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + 車を追加
        </button>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Available Members */}
        <div
          ref={setAvailableRef}
          className={`mb-6 p-4 rounded-lg border-2 transition-all ${
            isOverAvailable ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <h3 className="text-sm font-semibold text-gray-600 mb-3">未配置メンバー</h3>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {availableMembers.length === 0 ? (
              <p className="text-gray-400 text-sm">全員配置済み</p>
            ) : (
              availableMembers.map(member => (
                <DraggableCarMember key={member.id} member={member} />
              ))
            )}
          </div>
        </div>

        {/* Cars */}
        <div className="space-y-4">
          {cars.map((car, carIndex) => (
            <div key={car.id} className="car-card border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">車 {carIndex + 1}</h3>
                <button
                  onClick={() => handleRemoveCar(car.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-start">
                {/* Driver */}
                <DroppableSlot
                  id={`driver-${car.id}`}
                  member={car.driver}
                  label="運転手"
                  isDriver
                />

                {/* Passengers */}
                {car.passengers.map((passenger, index) => (
                  <div key={index} className="relative">
                    <DroppableSlot
                      id={`passenger-${car.id}-${index}`}
                      member={passenger}
                      label={`同乗者 ${index + 1}`}
                    />
                    {car.passengers.length > 1 && (
                      <button
                        onClick={() => handleRemovePassengerSlot(car.id, index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Passenger Button */}
                <button
                  onClick={() => handleAddPassengerSlot(car.id)}
                  className="min-w-[120px] p-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center"
                >
                  <span className="text-blue-500 font-medium">+ 同乗者</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeMember ? (
            <div className="bg-blue-100 border-2 border-blue-500 rounded-lg px-3 py-2 shadow-lg">
              {activeMember.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {cars.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          「車を追加」ボタンで車を追加してください
        </p>
      )}
    </div>
  );
}

'use client';

import { Member, Car } from '@/types';

interface DownloadViewProps {
  redTeam: Member[];
  greenTeam: Member[];
  cars: Car[];
}

export default function DownloadView({ redTeam, greenTeam, cars }: DownloadViewProps) {
  // 配車データを整形：運転手ごとに同乗者をまとめる
  const carData = cars.filter(car => car.driver).map(car => ({
    driver: car.driver!.name,
    passengers: car.passengers.filter(p => p !== null).map(p => p!.name),
  }));

  // 同乗者の最大数を計算
  const maxPassengers = Math.max(1, ...carData.map(c => c.passengers.length));

  return (
    <div className="bg-white p-8 min-w-[600px]">
      {/* タイトル */}
      <h1 className="text-2xl font-bold text-center mb-6 text-[#1d1d1f]">
        サバゲー編成表
      </h1>

      {/* チーム編成 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-center bg-[#e5e5ea] py-2 border border-[#c7c7cc]">
          チーム編成
        </h2>
        <div className="grid grid-cols-2 border-l border-r border-b border-[#c7c7cc]">
          {/* 赤チーム */}
          <div className="border-r border-[#c7c7cc]">
            <div className="bg-[#ff3b30] text-white font-bold text-center py-2">
              赤チーム ({redTeam.length}人)
            </div>
            <div className="divide-y divide-[#e5e5ea]">
              {redTeam.map((member, idx) => (
                <div key={member.id} className="px-4 py-2 text-center">
                  {member.name}
                </div>
              ))}
              {redTeam.length === 0 && (
                <div className="px-4 py-2 text-center text-[#8e8e93]">-</div>
              )}
            </div>
          </div>

          {/* 緑チーム */}
          <div>
            <div className="bg-[#34c759] text-white font-bold text-center py-2">
              緑チーム ({greenTeam.length}人)
            </div>
            <div className="divide-y divide-[#e5e5ea]">
              {greenTeam.map((member, idx) => (
                <div key={member.id} className="px-4 py-2 text-center">
                  {member.name}
                </div>
              ))}
              {greenTeam.length === 0 && (
                <div className="px-4 py-2 text-center text-[#8e8e93]">-</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 配車 */}
      {carData.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-center bg-[#e5e5ea] py-2 border border-[#c7c7cc]">
            配車
          </h2>
          <table className="w-full border-collapse border border-[#c7c7cc]">
            <thead>
              <tr className="bg-[#f2f2f7]">
                <th className="border border-[#c7c7cc] px-4 py-2 text-center font-bold w-1/3">
                  運転手
                </th>
                <th className="border border-[#c7c7cc] px-4 py-2 text-center font-bold" colSpan={maxPassengers}>
                  同乗者
                </th>
              </tr>
            </thead>
            <tbody>
              {carData.map((car, idx) => (
                <tr key={idx}>
                  <td className="border border-[#c7c7cc] px-4 py-3 text-center font-medium">
                    {car.driver}
                  </td>
                  {car.passengers.length > 0 ? (
                    car.passengers.map((passenger, pIdx) => (
                      <td
                        key={pIdx}
                        className="border border-[#c7c7cc] px-4 py-3 text-center"
                        colSpan={pIdx === car.passengers.length - 1 ? maxPassengers - pIdx : 1}
                      >
                        {passenger}
                      </td>
                    ))
                  ) : (
                    <td className="border border-[#c7c7cc] px-4 py-3 text-center text-[#8e8e93]" colSpan={maxPassengers}>
                      -
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* フッター */}
      <div className="mt-6 text-center text-xs text-[#8e8e93]">
        {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

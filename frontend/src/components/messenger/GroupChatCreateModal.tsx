import { useMemo, useState } from "react";

import type {
  ChatDepartment,
  ChatEmployee,
  ChatEmployeeList,
} from "../../types/chat";

import {
  departmentText,
  presenceDotClass,
  presenceText,
  roleText,
} from "./messengerUtils";

interface GroupChatCreateModalProps {
  employeeList: ChatEmployeeList | null;
  myEmployeeNo: string;
  onClose: () => void;
  onCreate: (roomName: string, memberEmployeeNos: string[]) => void;
}

export default function GroupChatCreateModal({
  employeeList,
  myEmployeeNo,
  onClose,
  onCreate,
}: GroupChatCreateModalProps) {
  const [roomName, setRoomName] = useState("");
  const [selectedEmployeeNos, setSelectedEmployeeNos] = useState<string[]>([]);
  const [openedDepartments, setOpenedDepartments] = useState<string[]>([]);

  const selectedCount = selectedEmployeeNos.length;

  const selectedEmployees = useMemo(() => {
    if (!employeeList) {
      return [];
    }

    return employeeList.departments
      .flatMap((department) => department.members)
      .filter((employee) =>
        selectedEmployeeNos.includes(employee.employeeNo)
      );
  }, [employeeList, selectedEmployeeNos]);

  const toggleDepartment = (department: string) => {
    setOpenedDepartments((prev) => {
      if (prev.includes(department)) {
        return prev.filter((item) => item !== department);
      }

      return [...prev, department];
    });
  };

  const toggleEmployee = (employee: ChatEmployee) => {
    if (employee.employeeNo === myEmployeeNo) {
      return;
    }

    setSelectedEmployeeNos((prev) => {
      if (prev.includes(employee.employeeNo)) {
        return prev.filter(
          (employeeNo) => employeeNo !== employee.employeeNo
        );
      }

      return [...prev, employee.employeeNo];
    });
  };

  const handleCreate = () => {
    if (!roomName.trim()) {
      alert("그룹 채팅방 이름을 입력해주세요.");
      return;
    }

    if (selectedEmployeeNos.length === 0) {
      alert("초대할 사원을 선택해주세요.");
      return;
    }

    onCreate(roomName.trim(), selectedEmployeeNos);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center">
      <div className="w-[560px] h-[640px] bg-white rounded-[30px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="shrink-0 h-16 px-6 bg-[#0F172A] flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white">그룹채팅 생성</p>

            
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        <div className="shrink-0 p-5 border-b border-slate-100 bg-white">
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            채팅방 이름
          </label>

          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="예: 개발팀 프로젝트방"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500">
                선택된 사원
              </p>

              <span className="text-xs text-blue-500 font-bold">
                {selectedCount}명
              </span>
            </div>

            {selectedEmployees.length === 0 ? (
              <p className="text-xs text-slate-400">
                아직 선택된 사원이 없습니다.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedEmployees.map((employee) => (
                  <span
                    key={employee.employeeNo}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600"
                  >
                    {employee.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white">
          {!employeeList && (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              사원목록 불러오는 중...
            </div>
          )}

          {employeeList?.departments.map((department: ChatDepartment) => {
            const opened = openedDepartments.includes(department.department);

            const members = department.members.filter(
              (employee) => employee.employeeNo !== myEmployeeNo
            );

            return (
              <div key={department.department} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleDepartment(department.department)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {opened ? "▼" : "▶"} {department.departmentName}
                  </span>

                  <span className="text-xs text-slate-400">
                    {members.length}
                  </span>
                </button>

                {opened && (
                  <div className="mt-1 space-y-1">
                    {members.map((employee) => {
                      const selected = selectedEmployeeNos.includes(
                        employee.employeeNo
                      );

                      return (
                        <button
                          key={employee.employeeNo}
                          type="button"
                          onClick={() => toggleEmployee(employee)}
                          className={`w-full px-3 py-2.5 rounded-2xl text-left transition border ${
                            selected
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">
                                {employee.name}
                              </p>

                              <p className="text-xs text-slate-400 mt-0.5 truncate">
                                {employee.employeeNo} ·{" "}
                                {departmentText(employee.department)} ·{" "}
                                {roleText(employee.highestRole)}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${presenceDotClass(
                                  employee.presenceStatus
                                )}`}
                              />

                              <span className="text-[11px] text-slate-400">
                                {presenceText(employee.presenceStatus)}
                              </span>

                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                                  selected
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-slate-300 text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 p-4 border-t border-slate-100 bg-white flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-500 transition"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
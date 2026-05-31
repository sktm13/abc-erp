import type {
  ChatDepartment,
  ChatEmployee,
  ChatEmployeeList,
  PresenceStatus,
} from "../../types/chat";

import {
  departmentText,
  presenceDotClass,
  presenceText,
  roleText,
} from "./messengerUtils";

interface MessengerEmployeeTabProps {
  employeeList: ChatEmployeeList | null;
  openedDepartments: string[];
  selectedEmployee: ChatEmployee | null;
  onToggleDepartment: (department: string) => void;
  onSelectEmployee: (employee: ChatEmployee) => void;
  onPresenceChange: (presenceStatus: PresenceStatus) => void;
  onCreateDirectRoom: () => void;
}

export default function MessengerEmployeeTab({
  employeeList,
  openedDepartments,
  selectedEmployee,
  onToggleDepartment,
  onSelectEmployee,
  onPresenceChange,
  onCreateDirectRoom,
}: MessengerEmployeeTabProps) {
  if (!employeeList) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-white">
        사원목록 불러오는 중...
      </div>
    );
  }

  const renderEmployee = (employee: ChatEmployee) => {
    const selected =
      selectedEmployee?.employeeNo === employee.employeeNo;

    return (
      <button
        key={employee.employeeNo}
        type="button"
        onClick={() => onSelectEmployee(employee)}
        className={`w-full px-3 py-2.5 rounded-2xl text-left transition ${
          selected ? "bg-blue-50" : "hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">
              {employee.name}
            </p>

            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {employee.employeeNo} · {roleText(employee.highestRole)}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${presenceDotClass(
                employee.presenceStatus
              )}`}
            />

            <span className="text-[11px] text-slate-400">
              {presenceText(employee.presenceStatus)}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-white">
      <div className="shrink-0 border-b border-slate-100 p-4 bg-white">
        <p className="text-xs text-slate-400 mb-2">내 정보</p>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 truncate">
                  {employeeList.me.name}
                </p>

                <span
                  className={`w-2.5 h-2.5 rounded-full ${presenceDotClass(
                    employeeList.me.presenceStatus
                  )}`}
                />
              </div>

              <p className="text-xs text-slate-400 mt-1 truncate">
                {employeeList.me.employeeNo} ·{" "}
                {departmentText(employeeList.me.department)}
              </p>
            </div>

            <div className="shrink-0 flex gap-1.5">
              {(["ONLINE", "AWAY", "OFFLINE"] as PresenceStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onPresenceChange(status)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition ${
                      employeeList.me.presenceStatus === status
                        ? "bg-white text-blue-600 shadow-sm"
                        : "bg-slate-100 text-slate-400 hover:bg-white"
                    }`}
                  >
                    {presenceText(status)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-white">
        {employeeList.departments.map((department: ChatDepartment) => {
          const opened = openedDepartments.includes(
            department.department
          );

          return (
            <div key={department.department} className="mb-2">
              <button
                type="button"
                onClick={() => onToggleDepartment(department.department)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                <span className="text-sm font-bold text-slate-700">
                  {opened ? "▼" : "▶"} {department.departmentName}
                </span>

                <span className="text-xs text-slate-400">
                  {department.members.length}
                </span>
              </button>

              {opened && (
                <div className="mt-1 space-y-1">
                  {department.members
                    .filter(
                      (employee) =>
                        employee.employeeNo !==
                        employeeList.me.employeeNo
                    )
                    .map(renderEmployee)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedEmployee && (
        <div className="shrink-0 border-t border-slate-100 p-4 bg-white">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 mb-3">
            <p className="font-bold text-slate-800">
              {selectedEmployee.name}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {selectedEmployee.employeeNo} ·{" "}
              {departmentText(selectedEmployee.department)}
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateDirectRoom}
            className="w-full py-2.5 rounded-2xl bg-[#3B82F6] text-white text-sm font-bold hover:bg-blue-500 transition"
          >
            1:1 채팅하기
          </button>
        </div>
      )}
    </div>
  );
}
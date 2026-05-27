import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMember, modifyMember } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import type { MemberResponse } from "../../types/member";

type MemberRole = "EMPLOYEE" | "MANAGER" | "ADMIN";
type MemberStatus = "ACTIVE" | "LEAVE" | "RESIGNED";

export default function MemberReadPage() {
    const { employeeNo } = useParams();

    const navigate = useNavigate();

    const { loginState } = useCustomLogin();

    const isAdmin = loginState.roleNames?.includes("ADMIN");

    const [member, setMember] = useState<MemberResponse | null>(null);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [status, setStatus] = useState<MemberStatus>("ACTIVE");
    const [roleList, setRoleList] = useState<MemberRole[]>([]);

    const fetchMember = async () => {
        if (!employeeNo) {
            return;
        }

        try {
            const result = await getMember(employeeNo);

            setMember(result);
            setEmail(result.email);
            setName(result.name);
            setDepartment(result.department);
            setStatus(result.status);
            setRoleList(result.roleNames as MemberRole[]);
        } catch (e) {
            console.error(e);
            alert("사원 정보를 불러오지 못했습니다.");
            navigate("/member/list");
        }
    };

    useEffect(() => {
        fetchMember();
    }, [employeeNo]);

    const toggleRole = (role: MemberRole) => {
        // EMPLOYEE는 기본 권한이라 제거 불가
        if (role === "EMPLOYEE") {
            return;
        }

        if (roleList.includes(role)) {
            setRoleList(roleList.filter((r) => r !== role));
        } else {
            setRoleList([...roleList, role]);
        }
    };

    const handleModify = async () => {
        if (!employeeNo) {
            return;
        }

        if (!email || !name || !department || !status) {
            alert("필수 항목을 입력해주세요.");
            return;
        }

        const finalRoleList: MemberRole[] = roleList.includes("EMPLOYEE")
            ? roleList
            : ["EMPLOYEE", ...roleList];

        try {
            await modifyMember(employeeNo, {
                email,
                name,
                department,
                status,
                roleList: finalRoleList,
            });

            alert("사원 정보가 수정되었습니다.");
            navigate("/member/list");
        } catch (e: unknown) {
            console.error(e);

            if (axios.isAxiosError(e)) {
                const message = e.response?.data?.message;

                if (message) {
                    alert(message);
                    return;
                }
            }

            alert("사원 정보 수정에 실패했습니다.");
        }
    };

    if (!member) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">사원 상세</h1>
                    <p className="text-slate-400 mt-2">사원 정보 조회 및 수정</p>
                </div>

                <button
                    onClick={() => navigate("/member/list")}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                    목록으로
                </button>
            </div>

            <div className="bg-white rounded-[28px] border border-slate-200 p-8 shadow-sm max-w-3xl">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            사번
                        </label>

                        <input
                            type="text"
                            value={member.employeeNo}
                            disabled
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            이름
                        </label>

                        <input
                            type="text"
                            value={name}
                            disabled={!isAdmin}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            이메일
                        </label>

                        <input
                            type="email"
                            value={email}
                            disabled={!isAdmin}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            부서
                        </label>

                        <select
                            value={department}
                            disabled={!isAdmin}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                        >
                            <option value="DEV">개발팀</option>
                            <option value="HR">인사팀</option>
                            <option value="PUR">구매팀</option>
                            <option value="FIN">재무팀</option>
                            <option value="OPS">운영팀</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            재직 상태
                        </label>

                        <select
                            value={status}
                            disabled={!isAdmin}
                            onChange={(e) => setStatus(e.target.value as MemberStatus)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                        >
                            <option value="ACTIVE">재직</option>
                            <option value="LEAVE">휴직</option>
                            <option value="RESIGNED">퇴사</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-3">
                            권한
                        </label>

                        <div className="flex gap-3">
                            {(["EMPLOYEE", "MANAGER", "ADMIN"] as MemberRole[]).map(
                                (role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        disabled={!isAdmin || role === "EMPLOYEE"}
                                        onClick={() => toggleRole(role)}
                                        className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition ${roleList.includes(role)
                                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                                : "bg-white text-slate-500 border-slate-200"
                                            } disabled:opacity-70`}
                                    >
                                        {role}
                                    </button>
                                )
                            )}
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            EMPLOYEE 권한은 기본 권한으로 유지됩니다.
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => navigate("/member/list")}
                                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            >
                                취소
                            </button>

                            <button
                                onClick={handleModify}
                                className="px-5 py-3 rounded-2xl bg-[#3B82F6] text-white font-semibold hover:bg-blue-500 transition"
                            >
                                수정
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
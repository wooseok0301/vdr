"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x894A6A1eAed04bDfFd0723FbAfc178Ebc1460d66";

const ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			}
		],
		"name": "AccessPermissionGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "documentId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "documentHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "DocumentReadLogged",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "durationDays",
				"type": "uint256"
			}
		],
		"name": "grantAccessPermission",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "joinVDRWorkspace",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "leaveVDRWorkspace",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "docId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "docHash",
				"type": "string"
			}
		],
		"name": "logDocumentRead",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "currentActiveUsers",
				"type": "uint256"
			}
		],
		"name": "VDRWorkspaceJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "currentActiveUsers",
				"type": "uint256"
			}
		],
		"name": "VDRWorkspaceLeft",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "auditLogs",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "documentId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "documentHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentActiveUsers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllAuditLogs",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "documentId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "documentHash",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct VDRManager.DocumentAuditLog[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyPermissionInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isInsideVDR",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserPermissionInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isInsideVDR",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isValid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalAccessLogsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userPermissions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "expiryDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isInsideVDR",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const THEME = {
  bgIvory: "#FAF8F5",
  paleYellow: "#FDF6E2",
  deepBrown: "#3E2723",
  legalGold: "#C5A059",
  textSoft: "#5D534A",
  borderTan: "#E5DEC9",
  pureWhite: "#FFFFFF"
};

const SAMPLE_VDRS = [
  { id: "VDR-A", title: "[M&A] A사-B사 제약바이오 기업 인수합병 실사룸", categories: ["01_법무 계약 원본 및 NDA", "02_재무 실사 자산 보고서"] },
  { id: "VDR-B", title: "[특허 소송] 24년도 디스플레이 핵심 기술 유출 재판 증거 열람실", categories: ["03_특허 핵심 소스코드 아키텍처"] }
];

const SAMPLE_DOCUMENTS = [
  { id: "DOC-001", vdrId: "VDR-A", name: "주주간_계약서_및_비밀유지확약서(NDA)_최종본.pdf", hash: "0x7e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a", category: "01_법무 계약 원본 및 NDA" },
  { id: "DOC-002", vdrId: "VDR-A", name: "정관_및_이사회_의사록_모음집.pdf", hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b", category: "01_법무 계약 원본 및 NDA" },
  { id: "DOC-003", vdrId: "VDR-A", name: "2025_재무제표_실사용_정밀감사본.pdf", hash: "0x8f3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c", category: "02_재무 실사 자산 보고서" },
  { id: "DOC-004", vdrId: "VDR-A", name: "우발부채_및_채무보증_현황_명세서.xlsx", hash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e", category: "02_재무 실사 자산 보고서" },
  { id: "DOC-005", vdrId: "VDR-B", name: "핵심_소스코드_클라우드_아키텍처_명세서.docx", hash: "0x3a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t", category: "03_특허 핵심 소스코드 아키텍처" },
  { id: "DOC-006", vdrId: "VDR-B", name: "차세대_디스플레이_발광소자_특허_출원서_사본.pdf", hash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f", category: "03_특허 핵심 소스코드 아키텍처" }
];

// 입장/퇴장/문서열람 통합 감사 로그 타입
type SessionLogEntry = {
  type: "JOIN" | "LEAVE" | "DOC_READ";
  user: string;
  label: string;
  timestamp: number;
  txHash?: string;
};

export default function VDRSystemPage() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState<"lobby" | "workspace" | "admin">("lobby");

  const [activeVdr, setActiveVdr] = useState<typeof SAMPLE_VDRS[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [expiryDate, setExpiryDate] = useState(0);
  const [isInsideVDR, setIsInsideVDR] = useState(false);
  const [isValidPermission, setIsValidPermission] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [totalAccessLogs, setTotalAccessLogs] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // 입장/퇴장/문서열람 통합 세션 로그 (프론트 누적)
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>([]);
  // 현재 접속 중인 지갑 주소 목록 (이벤트 기반 추적)
  const [activeWallets, setActiveWallets] = useState<string[]>([]);

  const [targetUser, setTargetUser] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof SAMPLE_DOCUMENTS[0] | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addSessionLog = (entry: SessionLogEntry) => {
    setSessionLogs(prev => [entry, ...prev]);
  };

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      showToast("MetaMask 지갑을 설치해 주세요.", "err");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setAccount(addr);
      setContract(c);

      // 이벤트 리스너 — 접속자 지갑 주소 실시간 추적
      c.on("VDRWorkspaceJoined", (userAddr: string) => {
        setActiveWallets(prev => prev.includes(userAddr) ? prev : [...prev, userAddr]);
      });
      c.on("VDRWorkspaceLeft", (userAddr: string) => {
        setActiveWallets(prev => prev.filter(w => w !== userAddr));
      });

      try {
        const ownerAddr: string = await c.owner();
        setIsOwner(ownerAddr.toLowerCase() === addr.toLowerCase());
      } catch {
        setIsOwner(false);
      }
      showToast("법무 보안 지갑 인증 연동 성공");
    } catch (e) {
      showToast("지갑 연동 실패", "err");
    }
  };

  const refreshState = useCallback(async () => {
    if (!contract) return;
    try {
      const [exp, ins, val] = await contract.getMyPermissionInfo();
      setExpiryDate(Number(exp));
      setIsInsideVDR(ins);
      setIsValidPermission(val);
    } catch (e) {
      console.error("권한 정보 조회 실패:", e);
    }

    try {
      const activeCount = await contract.currentActiveUsers();
      setActiveUsersCount(Number(activeCount));
    } catch (e) {
      console.warn("currentActiveUsers 조회 실패:", e);
    }

    try {
      const totalCount = await contract.totalAccessLogsCount();
      setTotalAccessLogs(Number(totalCount));
    } catch (e) {
      console.warn("totalAccessLogsCount 조회 실패:", e);
    }

    try {
      const logs = await contract.getAllAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.warn("getAllAuditLogs 조회 실패:", e);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) refreshState();
    return () => {
      // cleanup event listeners
      if (contract) {
        contract.removeAllListeners("VDRWorkspaceJoined");
        contract.removeAllListeners("VDRWorkspaceLeft");
      }
    };
  }, [contract, refreshState]);

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    if (!ethers.isAddress(targetUser)) {
      showToast("올바른 이더리움 지갑 주소 형식이 아닙니다.", "err");
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.grantAccessPermission(targetUser, Number(durationDays));
      showToast("권한 부여 트랜잭션이 전송되었습니다. 블록 확정을 대기합니다.");
      await tx.wait();
      showToast("대상 대리인에게 VDR 열람 승인 면허 권한 각인이 완료되었습니다.");
      setTargetUser("");
      refreshState();
    } catch (e) {
      showToast("컨트랙트 권한 서명 거부 또는 소유자 권한 미달", "err");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 블록체인 서명 필수 — 실패 시 입장 불가 (데모 프리패스 제거)
  const handleJoinVDR = async (vdr: typeof SAMPLE_VDRS[0]) => {
    if (!contract) {
      showToast("지갑 연동 상태를 확인해 주세요.", "err");
      return;
    }
    if (!isValidPermission) {
      showToast("진입 권한이 없습니다. 관리자의 승인이 필요합니다.", "err");
      return;
    }
    setLoading(true);
    showToast("MetaMask 서명 요청 중... 지갑에서 승인해 주세요.");
    try {
      const tx = await contract.joinVDRWorkspace();
      showToast("블록 확정 대기 중...");
      const receipt = await tx.wait();
      setActiveVdr(vdr);
      setSelectedCategory("ALL");
      setTab("workspace");
      // 입장 로그 기록
      addSessionLog({
        type: "JOIN",
        user: account,
        label: `[입장] ${vdr.title}`,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: receipt?.hash,
      });
      showToast(`${vdr.title} — 블록체인 서명 입장 완료`);
      refreshState();
    } catch (e: any) {
      // 우회 없이 실패 처리
      if (e?.code === 4001 || e?.code === "ACTION_REJECTED") {
        showToast("MetaMask 서명이 거부되었습니다. 입장이 취소됩니다.", "err");
      } else {
        showToast("컨트랙트 실행 오류 — 입장이 거부되었습니다.", "err");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveVDR = async () => {
    if (!contract || !activeVdr) return;
    setLoading(true);
    showToast("퇴장 서명 요청 중...");
    try {
      const tx = await contract.leaveVDRWorkspace();
      const receipt = await tx.wait();
      // 퇴장 로그 기록
      addSessionLog({
        type: "LEAVE",
        user: account,
        label: `[퇴장] ${activeVdr.title}`,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: receipt?.hash,
      });
      showToast("보안 세션이 블록체인에 기록되며 정상 해제되었습니다.");
    } catch (e: any) {
      if (e?.code === 4001 || e?.code === "ACTION_REJECTED") {
        showToast("MetaMask 서명 거부 — 퇴장 처리가 취소되었습니다.", "err");
        setLoading(false);
        return;
      }
      // tx 실패여도 퇴장 처리 (이미 체인에서 kicked된 경우)
      addSessionLog({
        type: "LEAVE",
        user: account,
        label: `[퇴장] ${activeVdr?.title ?? ""}`,
        timestamp: Math.floor(Date.now() / 1000),
      });
    } finally {
      setActiveVdr(null);
      setTab("lobby");
      refreshState();
      setLoading(false);
    }
  };

  const handleOpenDocument = async (doc: typeof SAMPLE_DOCUMENTS[0]) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.logDocumentRead(doc.id, doc.hash);
      setSelectedDoc(doc);
      const receipt = await tx.wait();
      // 문서 열람 로그 기록
      addSessionLog({
        type: "DOC_READ",
        user: account,
        label: `[열람] ${doc.name}`,
        timestamp: Math.floor(Date.now() / 1000),
        txHash: receipt?.hash,
      });
      refreshState();
    } catch (e) {
      setSelectedDoc(doc);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = SAMPLE_DOCUMENTS.filter(doc => {
    if (!activeVdr) return false;
    if (doc.vdrId !== activeVdr.id) return false;
    if (selectedCategory !== "ALL" && doc.category !== selectedCategory) return false;
    return true;
  });

  const sessionLogTypeStyle = (type: SessionLogEntry["type"]) => {
    if (type === "JOIN") return { bg: "#1B5E20", text: "#E8F5E9", label: "입장" };
    if (type === "LEAVE") return { bg: "#B71C1C", text: "#FFEBEE", label: "퇴장" };
    return { bg: THEME.deepBrown, text: THEME.paleYellow, label: "열람" };
  };

  return (
    // ✅ 푸터 최하단 고정 — flex column + min-height 100vh
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: THEME.bgIvory, color: THEME.deepBrown, fontFamily: "sans-serif" }}>

      {/* 토스트 — 헤더 아래 */}
      {toast && (
        <div style={{
          position: "fixed", top: 100, right: 24, zIndex: 9999,
          background: THEME.deepBrown, border: `1px solid ${THEME.legalGold}`,
          color: THEME.paleYellow, padding: "14px 22px", borderRadius: 4, fontWeight: 600,
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)", maxWidth: 400, lineHeight: 1.5
        }}>
          {toast.msg}
        </div>
      )}

      {/* 문서 뷰어 모달 */}
      {selectedDoc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(62, 39, 35, 0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: THEME.paleYellow, border: `3px solid ${THEME.deepBrown}`, padding: "32px", maxWidth: "700px", width: "95%", boxShadow: "0 12px 36px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${THEME.deepBrown}`, paddingBottom: "12px", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: THEME.deepBrown, fontSize: "18px", fontWeight: "bold" }}>⚖️ 최고기밀 기밀 증거 영구 법정 공람 뷰어</h3>
              <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: THEME.deepBrown }}>✕</button>
            </div>
            <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "40px 20px", textAlign: "center", borderRadius: 2, marginBottom: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: THEME.deepBrown, marginBottom: "10px" }}>문서명: {selectedDoc.name}</div>
              <div style={{ fontSize: "11px", color: THEME.textSoft, fontFamily: "monospace", wordBreak: "break-all" }}>디지털 원본 무결성 분산 장부 Hash: {selectedDoc.hash}</div>
              <div style={{ marginTop: "30px", fontSize: "14px", fontWeight: "bold", color: "#A62626" }}>[ 보안 규정에 의거 외부 유출 및 복사가 엄격히 금지된 문서입니다 ]</div>
            </div>
            <div style={{ background: THEME.pureWhite, padding: "12px", fontSize: "12px", borderLeft: `4px solid ${THEME.legalGold}`, color: THEME.deepBrown, lineHeight: 1.5 }}>
              본 문서 파일의 실시간 열람 이력은 무결성 서명을 경유하여 블록체인 네트워크 분산 원장에 사후 위변조가 불가능한 소송 증거물로 영구 봉인되었습니다.
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header style={{ background: THEME.deepBrown, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, borderBottom: `3px solid ${THEME.legalGold}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "28px", color: THEME.legalGold }}>⚖️</span>
          <div>
            <h1 style={{ color: THEME.bgIvory, fontSize: "18px", margin: 0, fontWeight: 700, letterSpacing: "0.5px" }}>대법원·로펌 공조형 법률 자산 무결성 VDR 관제소</h1>
            <span style={{ color: THEME.legalGold, fontSize: "11px", display: "block", marginTop: "2px" }}>Highest Security Virtual Data Room & Certified Legal Ledger</span>
          </div>
        </div>
        {account && (
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <button onClick={() => setTab("lobby")} style={{ background: "none", border: "none", color: tab === "lobby" ? THEME.legalGold : THEME.bgIvory, fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>사건 로비</button>
            <button onClick={() => { if (!activeVdr) { showToast("입장 승인된 워크스페이스가 없습니다.", "err"); return; } setTab("workspace"); }} style={{ background: "none", border: "none", color: tab === "workspace" ? THEME.legalGold : THEME.bgIvory, fontSize: "14px", fontWeight: "bold", cursor: "pointer", opacity: activeVdr ? 1 : 0.4 }}>실사 열람실</button>
            {isOwner && (
              <button onClick={() => setTab("admin")} style={{ background: "none", border: "none", color: tab === "admin" ? THEME.legalGold : THEME.bgIvory, fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>감사 대시보드</button>
            )}
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "6px 14px", border: `1px solid ${THEME.legalGold}`, color: THEME.legalGold, fontSize: "13px", fontFamily: "monospace" }}>
              {account.slice(0, 6)}…{account.slice(-4)}
            </div>
          </div>
        )}
      </header>

      {/* 메인 콘텐츠 — flex-grow로 푸터를 밀어냄 */}
      <div style={{ flex: 1 }}>
        {!account ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 40px", background: `linear-gradient(180deg, ${THEME.paleYellow} 0%, ${THEME.bgIvory} 100%)`, minHeight: "calc(100vh - 80px)" }}>
            <div style={{ fontSize: "80px", marginBottom: "24px", color: THEME.deepBrown }}>🏛️</div>
            <h2 style={{ color: THEME.deepBrown, fontSize: "32px", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.5px" }}>기업 기밀 자산 및 사법 소송 증거물 통제 관제탑</h2>
            <p style={{ color: THEME.textSoft, fontSize: "15px", maxWidth: "750px", lineHeight: 1.8, margin: "0 0 40px" }}>
              본 체계는 비밀유지확약(NDA) 대상 M&A 기업 결합 심사 자료 및 특허 소송 유출 핵심 증거물의 무단 위변조 및 부인을 방지하기 위해 이더리움 메인넷 스마트 컨트랙트 원장을 활용합니다.<br />
              감사인 자격 검증을 위한 공인 서명 지갑(MetaMask)을 연동해 주십시오.
            </p>
            <button onClick={connectWallet} style={{ background: THEME.deepBrown, color: THEME.paleYellow, border: `1px solid ${THEME.legalGold}`, padding: "16px 44px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", letterSpacing: "1px", boxShadow: "0 4px 15px rgba(62,39,35,0.15)" }}>
              사법 감사 위변조 검증 지갑 연동 시작
            </button>
          </div>
        ) : (
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>

            {/* TAB 1: 로비 */}
            {tab === "lobby" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                <div style={{ background: THEME.paleYellow, padding: "24px", border: `1px solid ${THEME.legalGold}` }}>
                  <h2 style={{ fontSize: "16px", margin: "0 0 16px", color: THEME.deepBrown, borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "10px", fontWeight: "bold" }}>🔒 소송 대리인 자격 검증 프로필</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                      <div style={{ fontSize: "12px", color: THEME.textSoft }}>사법 심사 승인 여부</div>
                      <div style={{ fontSize: "15px", fontWeight: "bold", marginTop: "4px" }}>{isValidPermission ? "✅ 인가 확인됨" : "⚠️ 승인 대기 / 권한 없음"}</div>
                    </div>
                    <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                      <div style={{ fontSize: "12px", color: THEME.textSoft }}>열람 시한 만료기일</div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>{expiryDate > 0 ? new Date(expiryDate * 1000).toLocaleDateString() : "영구 면허 구역"}</div>
                    </div>
                    <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                      <div style={{ fontSize: "12px", color: THEME.textSoft }}>현재 소속 클린룸 현황</div>
                      <div style={{ fontSize: "15px", fontWeight: "bold", marginTop: "4px" }}>{activeVdr ? "🟢 입장 중" : "⚪ 로비 대기 상태"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: THEME.pureWhite, padding: "30px", border: `1px solid ${THEME.borderTan}` }}>
                  <h2 style={{ fontSize: "18px", margin: "0 0 24px", color: THEME.deepBrown, textAlign: "center", fontWeight: "bold" }}>공람 지정 가상 데이터 룸 사건 배정 목록</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {SAMPLE_VDRS.map((vdr) => (
                      <div key={vdr.id} style={{ border: `1px solid ${THEME.borderTan}`, padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: THEME.bgIvory }}>
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: "16px", color: THEME.deepBrown }}>{vdr.title}</div>
                          <div style={{ fontSize: "13px", color: THEME.textSoft, marginTop: "6px" }}>기밀 규격: 법무법인 공동 입회 최고 보안 구역</div>
                        </div>
                        <button
                          onClick={() => handleJoinVDR(vdr)}
                          disabled={loading || !isValidPermission}
                          style={{
                            background: isValidPermission ? THEME.deepBrown : "#A0A0A0",
                            color: THEME.paleYellow,
                            border: "none",
                            padding: "12px 28px",
                            fontWeight: "bold",
                            cursor: isValidPermission ? "pointer" : "not-allowed",
                            opacity: isValidPermission ? 1 : 0.6,
                            whiteSpace: "nowrap"
                          }}
                        >
                          {loading ? "서명 대기 중..." : isValidPermission ? "보안 룸 진입하기" : "진입 권한 없음"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 워크스페이스 */}
            {tab === "workspace" && activeVdr && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ background: THEME.deepBrown, color: THEME.bgIvory, padding: "20px 24px", borderLeft: `6px solid ${THEME.legalGold}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "16px", margin: 0, fontWeight: "bold" }}>{activeVdr.title}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: THEME.legalGold }}>지정 카테고리 브라우징 원본 대조 시스템 — 모든 열람 이력이 블록체인에 기록됩니다</p>
                  </div>
                  <button onClick={handleLeaveVDR} disabled={loading} style={{ background: "none", border: `1px solid ${THEME.legalGold}`, color: THEME.legalGold, padding: "8px 18px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}>
                    {loading ? "서명 대기 중..." : "세션 안전 종료 후 퇴실"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "start" }}>
                  <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: THEME.deepBrown, marginBottom: "12px", borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "8px" }}>📁 편철 분류 체계</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <button onClick={() => setSelectedCategory("ALL")} style={{ textAlign: "left", padding: "10px 12px", border: "none", background: selectedCategory === "ALL" ? THEME.paleYellow : "none", color: THEME.deepBrown, fontSize: "13px", cursor: "pointer", fontWeight: selectedCategory === "ALL" ? "bold" : "normal" }}>📁 전체 증거 문서 보기</button>
                      {activeVdr.categories.map((cat, idx) => (
                        <button key={idx} onClick={() => setSelectedCategory(cat)} style={{ textAlign: "left", padding: "10px 12px", border: "none", background: selectedCategory === cat ? THEME.paleYellow : "none", color: THEME.deepBrown, fontSize: "13px", cursor: "pointer", fontWeight: selectedCategory === cat ? "bold" : "normal" }}>📄 {cat}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "24px" }}>
                    <h3 style={{ fontSize: "15px", margin: "0 0 20px", fontWeight: "bold", color: THEME.deepBrown }}>분산원장 서명 대상 기밀 파일 원본 명세 ({filteredDocuments.length}건)</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {filteredDocuments.map((doc) => (
                        <div key={doc.id} style={{ border: `1px solid ${THEME.borderTan}`, padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: THEME.bgIvory }}>
                          <div style={{ flex: 1, marginRight: "16px" }}>
                            <div style={{ fontWeight: "bold", fontSize: "14px", color: THEME.deepBrown }}>{doc.name}</div>
                            <div style={{ fontSize: "11px", color: THEME.textSoft, fontFamily: "monospace", marginTop: "4px", wordBreak: "break-all" }}>무결성 원본 Hash: {doc.hash}</div>
                          </div>
                          <button onClick={() => handleOpenDocument(doc)} disabled={loading} style={{ background: THEME.deepBrown, color: THEME.paleYellow, border: "none", padding: "10px 20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                            보안 뷰어로 열람
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 감사 대시보드 */}
            {tab === "admin" && isOwner && (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {/* 통계 헤더 */}
                <div style={{ background: THEME.deepBrown, color: THEME.bgIvory, padding: "30px", border: `1px solid ${THEME.legalGold}` }}>
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "16px", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "20px", margin: 0, color: THEME.legalGold, fontWeight: "bold" }}>🏛️ 실시간 블록체인 사법 위변조 통제 총괄탑</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: THEME.bgIvory, opacity: 0.7 }}>공조 로펌 및 감사 법인 지갑 로그 영구 영장 집행 현황</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ background: "rgba(255,255,255,0.04)", padding: "20px", border: "1px solid rgba(197,160,89,0.3)" }}>
                      <div style={{ fontSize: "12px", color: THEME.legalGold }}>실시간 클린룸 내부 동시 접속 대리인수</div>
                      <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px", fontFamily: "monospace" }}>{activeUsersCount} <span style={{ fontSize: "14px", fontWeight: "normal" }}>명</span></div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", padding: "20px", border: "1px solid rgba(197,160,89,0.3)" }}>
                      <div style={{ fontSize: "12px", color: THEME.legalGold }}>블록체인 봉인 완료 누적 보안 입장 건수</div>
                      <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px", fontFamily: "monospace" }}>{totalAccessLogs} <span style={{ fontSize: "14px", fontWeight: "normal" }}>건</span></div>
                    </div>
                  </div>

                  {/* ✅ 실시간 접속 지갑 주소 목록 */}
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "16px 20px", border: "1px solid rgba(197,160,89,0.3)" }}>
                    <div style={{ fontSize: "12px", color: THEME.legalGold, marginBottom: "10px", fontWeight: "bold" }}>🟢 현재 클린룸 접속 중인 지갑 주소</div>
                    {activeWallets.length === 0 ? (
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>현재 접속 중인 대리인이 없습니다.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {activeWallets.map((wallet, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CAF50", display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontFamily: "monospace", fontSize: "13px", color: THEME.bgIvory, wordBreak: "break-all" }}>{wallet}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 하단 2열 — 권한 발급 + 감사 로그 */}
                <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start" }}>
                  {/* 권한 발급 폼 */}
                  <div style={{ background: THEME.paleYellow, border: `1px solid ${THEME.legalGold}`, padding: "24px" }}>
                    <h3 style={{ fontSize: "15px", margin: "0 0 16px", fontWeight: "bold", borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "10px" }}>📜 소송 대리인 VDR 공람 승인 면허 발급</h3>
                    <form onSubmit={handleGrantPermission} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", display: "block", marginBottom: "6px", fontWeight: "bold" }}>대상 소송 대리인 지갑 주소 (Address)</label>
                        <input type="text" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="0x..." style={{ width: "100%", padding: "10px", border: `1px solid ${THEME.borderTan}`, fontSize: "13px", fontFamily: "monospace", boxSizing: "border-box" }} required />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", display: "block", marginBottom: "6px", fontWeight: "bold" }}>허가 공람 일수 (Duration Days)</label>
                        <select value={durationDays} onChange={(e) => setDurationDays(e.target.value)} style={{ width: "100%", padding: "10px", border: `1px solid ${THEME.borderTan}`, fontSize: "13px", boxSizing: "border-box" }}>
                          <option value="1">1일 (단기 실사 검증)</option>
                          <option value="7">7일 (일반 기업 결합 심사)</option>
                          <option value="30">30일 (심층 재판 증거 분석)</option>
                        </select>
                      </div>
                      <button type="submit" disabled={loading} style={{ background: THEME.deepBrown, color: THEME.paleYellow, border: "none", padding: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                        {loading ? "트랜잭션 가속 중..." : "분산 장부 권한 각인 서명"}
                      </button>
                    </form>
                  </div>

                  {/* ✅ 통합 감사 로그 (입장/퇴장/열람 모두 포함) */}
              {/* ✅ 통합 감사 로그 (열람만) */}
              <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "24px" }}>
                <h3 style={{ fontSize: "15px", margin: "0 0 6px", fontWeight: "bold" }}>⛓️ 통합 세션 감사 추적 기록 (열람)</h3>
                <p style={{ fontSize: "11px", color: THEME.textSoft, margin: "0 0 16px" }}>현 세션에서 발생한 모든 블록체인 트랜잭션 이벤트가 실시간 누적됩니다.</p>

                {/* 블록체인 확정 문서 열람 로그 (컨트랙트) — 오름차순 */}
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "bold", color: THEME.deepBrown, marginBottom: "8px", borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "4px" }}>📄 블록체인 확정 문서 열람 로그</div>
                  {auditLogs.length === 0 ? (
                    <div style={{ padding: "20px 0", textAlign: "center", color: THEME.textSoft, fontSize: "13px" }}>이번 세션에서 열람 기록이 없습니다.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                      {[...auditLogs].reverse().map((log, index) => (
                        <div key={index} style={{ border: `1px solid ${THEME.borderTan}`, borderLeft: `4px solid ${THEME.legalGold}`, padding: "12px 14px", background: THEME.bgIvory }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <span style={{ background: THEME.deepBrown, color: THEME.paleYellow, fontSize: "11px", fontWeight: "bold", padding: "2px 8px" }}>{log.documentId}</span>
                            <span style={{ fontSize: "11px", color: THEME.textSoft }}>{new Date(Number(log.timestamp) * 1000).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: THEME.deepBrown, fontFamily: "monospace", wordBreak: "break-all", marginBottom: "3px" }}>
                            <span style={{ color: THEME.textSoft, fontFamily: "sans-serif", fontSize: "11px" }}>지갑: </span>{log.user}
                          </div>
                          <div style={{ fontSize: "11px", color: THEME.textSoft, fontFamily: "monospace", wordBreak: "break-all" }}>
                            Hash: {log.documentHash ? log.documentHash.slice(0, 42) : ""}…
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* ✅ 푸터 — flex 구조 덕분에 항상 최하단 */}
      <footer style={{ textAlign: "center", padding: "40px 0", borderTop: `1px solid ${THEME.borderTan}`, color: THEME.textSoft, fontSize: "12px", background: THEME.paleYellow, flexShrink: 0 }}>
        <p style={{ margin: 0 }}>© Cryptographic Legal Technology Audit Trail & VDR Sovereign Control Center.</p>
      </footer>
    </div>
  );
}
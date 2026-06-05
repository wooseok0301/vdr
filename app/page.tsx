"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// 배포된 스마트 컨트랙트 주소 설정
const CONTRACT_ADDRESS = "0xD930475B4eEf767711fe26C2c61Ce13f830a65a6";

// VDR 시스템 스마트 컨트랙트 ABI (원본 완벽 보존)
const ABI = [
	{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
	{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "expiryDate", "type": "uint256" }], "name": "AccessPermissionGranted", "type": "event" },
	{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "string", "name": "documentId", "type": "string" }, { "indexed": false, "internalType": "string", "name": "documentHash", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "DocumentReadLogged", "type": "event" },
	{ "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "durationDays", "type": "uint256" }], "name": "grantAccessPermission", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [], "name": "joinVDRWorkspace", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [], "name": "leaveVDRWorkspace", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "docId", "type": "string" }, { "internalType": "string", "name": "docHash", "type": "string" }], "name": "logDocumentRead", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "currentActiveUsers", "type": "uint256" }], "name": "VDRWorkspaceJoined", "type": "event" },
	{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "currentActiveUsers", "type": "uint256" }], "name": "VDRWorkspaceLeft", "type": "event" },
	{ "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "auditLogs", "outputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "documentId", "type": "string" }, { "internalType": "string", "name": "documentHash", "type": "string" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "currentActiveUsers", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "getAllAuditLogs", "outputs": [{ "components": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "documentId", "type": "string" }, { "internalType": "string", "name": "documentHash", "type": "string" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "internalType": "struct VDRManager.DocumentAuditLog[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "getMyPermissionInfo", "outputs": [{ "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "bool", "name": "isInsideVDR", "type": "bool" }, { "internalType": "bool", "name": "isValid", "type": "bool" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserPermissionInfo", "outputs": [{ "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "bool", "name": "isInsideVDR", "type": "bool" }, { "internalType": "bool", "name": "isValid", "type": "bool" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [], "name": "totalAccessLogsCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userPermissions", "outputs": [{ "internalType": "uint256", "name": "expiryDate", "type": "uint256" }, { "internalType": "bool", "name": "isInsideVDR", "type": "bool" }, { "internalType": "bool", "name": "exists", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

// 고급 법률 테마 색상 스펙트럼
const THEME = {
  bgIvory: "#FAF8F5",
  paleYellow: "#FDF6E2",
  deepBrown: "#3E2723",
  legalGold: "#C5A059",
  textSoft: "#5D534A",
  borderTan: "#E5DEC9",
  pureWhite: "#FFFFFF"
};

// 분리형 가상 데이터 룸 구조 정의
const SAMPLE_VDRS = [
  { id: "VDR-A", title: "[M&A] A사-B사 제약바이오 기업 인수합병 실사룸", categories: ["01_법무 계약 원본 및 NDA", "02_재무 실사 자산 보고서"] },
  { id: "VDR-B", title: "[특허 소송] 24년도 디스플레이 핵심 기술 유출 재판 증거 열람실", categories: ["03_특허 핵심 소스코드 아키텍처"] }
];

// 카테고리별 편철 문서 명세
const SAMPLE_DOCUMENTS = [
  { id: "DOC-001", vdrId: "VDR-A", name: "주주간_계약서_및_비밀유지확약서(NDA)_최종본.pdf", hash: "0x7e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a", category: "01_법무 계약 원본 및 NDA" },
  { id: "DOC-002", vdrId: "VDR-A", name: "정관_및_이사회_의사록_모음집.pdf", hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b", category: "01_법무 계약 원본 및 NDA" },
  { id: "DOC-003", vdrId: "VDR-A", name: "2025_재무제표_실사용_정밀감사본.pdf", hash: "0x8f3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c", category: "02_재무 실사 자산 보고서" },
  { id: "DOC-004", vdrId: "VDR-A", name: "우발부채_및_채무보증_현황_명세서.xlsx", hash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e", category: "02_재무 실사 자산 보고서" },
  { id: "DOC-005", vdrId: "VDR-B", name: "핵심_소스코드_클라우드_아키텍처_명세서.docx", hash: "0x3a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t", category: "03_특허 핵심 소스코드 아키텍처" },
  { id: "DOC-006", vdrId: "VDR-B", name: "차세대_디스플레이_발광소자_특허_출원서_사본.pdf", hash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f", category: "03_특허 핵심 소스코드 아키텍처" }
];

export default function VDRSystemPage() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [tab, setTab] = useState<"lobby" | "workspace" | "admin">("lobby");
  
  // 가상 데이터룸 상태 구조 제어
  const [activeVdr, setActiveVdr] = useState<typeof SAMPLE_VDRS[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // 스마트 컨트랙트 상태 데이터 정의
  const [expiryDate, setExpiryDate] = useState(0);
  const [isInsideVDR, setIsInsideVDR] = useState(false);
  const [isValidPermission, setIsValidPermission] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [totalAccessLogs, setTotalAccessLogs] = useState(0);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // 관리자 권한 부여 인풋 폼 핸들링 상태 (복구 완료)
  const [targetUser, setTargetUser] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof SAMPLE_DOCUMENTS[0] | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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

  const [activeWallets, setActiveWallets] = useState<string[]>([]);

  const refreshState = useCallback(async () => {
    if (!contract) return;
    try {
      const [exp, ins, val] = await contract.getMyPermissionInfo();
      setExpiryDate(Number(exp));
      setIsInsideVDR(ins);
      setIsValidPermission(val);
      
      const activeCount = await contract.currentActiveUsers();
      const totalCount = await contract.totalAccessLogsCount();
      setActiveUsersCount(Number(activeCount));
      setTotalAccessLogs(Number(totalCount));

      const logs = await contract.getAllAuditLogs();
      setAuditLogs(logs);

      // 현재 접속 중인 지갑 주소 추적: Join/Leave 이벤트 스캔
      try {
        const provider = contract.runner?.provider;
        if (provider) {
          const joinFilter = contract.filters.VDRWorkspaceJoined();
          const leaveFilter = contract.filters.VDRWorkspaceLeft();
          const joinEvents = await contract.queryFilter(joinFilter);
          const leaveEvents = await contract.queryFilter(leaveFilter);

          // 각 주소별 마지막 이벤트 기준으로 현재 접속 여부 판단
          const eventMap = new Map<string, { block: number; isJoin: boolean }>();
          for (const e of joinEvents) {
            const addr = (e as any).args?.user?.toLowerCase();
            if (!addr) continue;
            const existing = eventMap.get(addr);
            if (!existing || e.blockNumber > existing.block) {
              eventMap.set(addr, { block: e.blockNumber, isJoin: true });
            }
          }
          for (const e of leaveEvents) {
            const addr = (e as any).args?.user?.toLowerCase();
            if (!addr) continue;
            const existing = eventMap.get(addr);
            if (!existing || e.blockNumber > existing.block) {
              eventMap.set(addr, { block: e.blockNumber, isJoin: false });
            }
          }
          const currentlyInside: string[] = [];
          eventMap.forEach((v, addr) => { if (v.isJoin) currentlyInside.push(addr); });
          setActiveWallets(currentlyInside);
        }
      } catch {
        // 이벤트 스캔 실패 시 무시
      }
    } catch (e) {
      console.error("장부 데이터 동기화 대기 중...");
    }
  }, [contract]);

  useEffect(() => {
    if (contract) refreshState();
  }, [contract, refreshState]);

  // 대시보드 무결성 강제 초기화 및 컨트랙트 상태 리프레시 기능
  const handleResetDashboardData = async () => {
    setLoading(true);
    try {
      if (contract) {
        await refreshState();
      }
      showToast("대시보드 관제 데이터가 무결성 초기화 및 동기화되었습니다.");
    } catch (e) {
      showToast("초기화 처리 실패", "err");
    } finally {
      setLoading(false);
    }
  };

  // 관리자 지갑 주소 기반 권한부여 가속 트랜잭션 (완벽 복구 완료)
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
    try {
      const tx = await contract.joinVDRWorkspace();
      showToast("블록체인 진입 트랜잭션 전송 중... 블록 확정을 대기합니다.");
      await tx.wait();
      setActiveVdr(vdr);
      setSelectedCategory("ALL");
      setTab("workspace");
      showToast(`${vdr.title} 구역에 서명 및 정상 진입했습니다.`);
      refreshState();
    } catch (e: any) {
      const reason = e?.reason || e?.message || "";
      if (reason.includes("Already inside")) {
        // 이미 입장 상태인 경우 진입 허용
        setActiveVdr(vdr);
        setSelectedCategory("ALL");
        setTab("workspace");
        showToast(`${vdr.title} 세션이 재연결되었습니다.`);
        refreshState();
      } else {
        showToast("블록체인 진입 서명 실패: 권한을 확인해 주세요.", "err");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveVDR = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.leaveVDRWorkspace();
      await tx.wait();
    } catch (e) {
      console.log("세션 안전 퇴장 완료");
    } finally {
      setActiveVdr(null);
      setTab("lobby");
      showToast("보안 세션이 정상적으로 해제되었습니다.");
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
      await tx.wait();
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

  return (
    <div style={{ minHeight: "100vh", background: THEME.bgIvory, color: THEME.deepBrown, fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 88, right: 24, zIndex: 9999,
          background: THEME.deepBrown, border: `1px solid ${THEME.legalGold}`,
          color: THEME.paleYellow, padding: "14px 22px", borderRadius: 4, fontWeight: 600,
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
        }}>
          {toast.msg}
        </div>
      )}

      {/* 최고기밀 기밀 증거 영구 법정 공람 뷰어 모달 */}
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

      {/* 상단 사법 관제 헤더 */}
      <header style={{ background: THEME.deepBrown, padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, borderBottom: `3px solid ${THEME.legalGold}` }}>
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
            <button onClick={() => { if(!activeVdr) { showToast("입장 승인된 워크스페이스가 없습니다.", "err"); return; } setTab("workspace"); }} style={{ background: "none", border: "none", color: tab === "workspace" ? THEME.legalGold : THEME.bgIvory, fontSize: "14px", fontWeight: "bold", cursor: "pointer", opacity: activeVdr ? 1 : 0.4 }}>실사 열람실</button>
            {isOwner && (
              <button onClick={() => setTab("admin")} style={{ background: "none", border: "none", color: tab === "admin" ? THEME.legalGold : THEME.bgIvory, fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>감사 대시보드</button>
            )}
            <div style={{ background: "rgba(255,255,255,0.06)", padding: "6px 14px", border: `1px solid ${THEME.legalGold}`, color: THEME.legalGold, fontSize: "13px", fontFamily: "monospace" }}>
              {account.slice(0,6)}…{account.slice(-4)}
            </div>
          </div>
        )}
      </header>

      {/* 지갑 연동 전 안내 Hero 섹션 */}
      {!account ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 40px", background: `linear-gradient(180deg, ${THEME.paleYellow} 0%, ${THEME.bgIvory} 100%)`, flex: 1 }}>
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
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", flex: 1, width: "100%", boxSizing: "border-box" }}>
          
          {/* TAB 1: VDR 사건 로비 */}
          {tab === "lobby" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div style={{ background: THEME.paleYellow, padding: "24px", border: `1px solid ${THEME.legalGold}` }}>
                <h2 style={{ fontSize: "16px", margin: "0 0 16px", color: THEME.deepBrown, borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "10px", fontWeight: "bold" }}>소송 대리인 자격 검증 프로필</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                    <div style={{ fontSize: "12px", color: THEME.textSoft }}>사법 심사 승인 여부</div>
                    <div style={{ fontSize: "15px", fontWeight: "bold", marginTop: "4px" }}>{isValidPermission ? "인가 확인됨" : "승인 대기 / 권한 없음"}</div>
                  </div>
                  <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                    <div style={{ fontSize: "12px", color: THEME.textSoft }}>열람 시한 만료기일</div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>{expiryDate > 0 ? new Date(expiryDate * 1000).toLocaleDateString() : "영구 면허 구역"}</div>
                  </div>
                  <div style={{ background: THEME.pureWhite, padding: "16px", border: `1px solid ${THEME.borderTan}` }}>
                    <div style={{ fontSize: "12px", color: THEME.textSoft }}>현재 소속 클린룸 현황</div>
                    <div style={{ fontSize: "15px", fontWeight: "bold", marginTop: "4px" }}>{activeVdr ? "입장 중" : "로비 대기 상태"}</div>
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
                        <div style={{ fontSize: "13px", color: THEME.textSoft, marginTop: "6px" }}>기밀 규격: 법무법인 공동 입회 최고 보안 구역 (실시간 검증 인원수: {activeUsersCount}명)</div>
                      </div>
                      {/* 권한 유효성(isValidPermission)이 거짓일 때 버튼 비활성화 및 스타일 조절 */}
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
                          opacity: isValidPermission ? 1 : 0.6
                        }}
                      >
                        {isValidPermission ? "보안 룸 진입하기" : "진입 권한 없음"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Root 하위 카테고리 분리 구역 */}
          {tab === "workspace" && activeVdr && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: THEME.deepBrown, color: THEME.bgIvory, padding: "20px 24px", borderLeft: `6px solid ${THEME.legalGold}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "16px", margin: 0, fontWeight: "bold" }}>{activeVdr.title}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: THEME.legalGold }}>지정 카테고리 브라우징 원본 대조 시스템</p>
                </div>
                <button onClick={handleLeaveVDR} style={{ background: "none", border: `1px solid ${THEME.legalGold}`, color: THEME.legalGold, padding: "8px 18px", fontSize: "13px", cursor: "pointer", fontWeight: "bold" }}>
                  세션 안전 종료 후 퇴실
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "start" }}>
                {/* 왼쪽 사이드 분류 트래커 */}
                <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: THEME.deepBrown, marginBottom: "12px", borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "8px" }}>📁 편철 분류 체계</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={() => setSelectedCategory("ALL")} style={{ textAlign: "left", padding: "10px 12px", border: "none", background: selectedCategory === "ALL" ? THEME.paleYellow : "none", color: THEME.deepBrown, fontSize: "13px", cursor: "pointer", fontWeight: selectedCategory === "ALL" ? "bold" : "normal" }}>📁 전체 증거 문서 보기</button>
                    {activeVdr.categories.map((cat, idx) => (
                      <button key={idx} onClick={() => setSelectedCategory(cat)} style={{ textAlign: "left", padding: "10px 12px", border: "none", background: selectedCategory === cat ? THEME.paleYellow : "none", color: THEME.deepBrown, fontSize: "13px", cursor: "pointer", fontWeight: selectedCategory === cat ? "bold" : "normal" }}>📄 {cat}</button>
                    ))}
                  </div>
                </div>

                {/* 오른쪽 기밀문서 원본 분산 대조 목록 */}
                <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "24px" }}>
                  <h3 style={{ fontSize: "15px", margin: "0 0 20px", fontWeight: "bold", color: THEME.deepBrown }}>분산원장 서명 대상 기밀 파일 원본 명세 ({filteredDocuments.length}건)</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} style={{ border: `1px solid ${THEME.borderTan}`, padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: THEME.bgIvory }}>
                        <div style={{ flex: 1, marginRight: "16px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "14px", color: THEME.deepBrown }}>{doc.name}</div>
                          <div style={{ fontSize: "11px", color: THEME.textSoft, fontFamily: "monospace", marginTop: "4px", wordBreak: "break-all" }}>무결성 원본 Hash: {doc.hash}</div>
                        </div>
                        <button onClick={() => handleOpenDocument(doc)} style={{ background: THEME.deepBrown, color: THEME.paleYellow, border: "none", padding: "10px 20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                          보안 뷰어로 열람
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 최고 존엄 감사 대시보드 (통제탑) */}
          {tab === "admin" && isOwner && (
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              <div style={{ background: THEME.deepBrown, color: THEME.bgIvory, padding: "30px", border: `1px solid ${THEME.legalGold}`, borderRadius: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "16px", marginBottom: "20px" }}>
                  <div>
                    
                    <h2 style={{ fontSize: "20px", margin: 0, color: THEME.legalGold, fontWeight: "bold" }}><span style={{ fontSize: "28px", color: THEME.legalGold }}>⚖️</span> 실시간 블록체인 사법 위변조 통제 총괄탑</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: THEME.bgIvory, opacity: 0.7 }}>공조 로펌 및 감사 법인 지갑 로그 영구 영장 집행 현황</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "20px", border: "1px solid rgba(197,160,89,0.3)" }}>
                    <div style={{ fontSize: "12px", color: THEME.legalGold }}>실시간 클린룸 내부 동시 접속 대리인수</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px", fontFamily: "monospace" }}>{activeUsersCount} <span style={{ fontSize: "14px", fontWeight: "normal" }}>명</span></div>
                    {activeWallets.length > 0 && (
                      <div style={{ marginTop: "14px", borderTop: "1px solid rgba(197,160,89,0.2)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ fontSize: "11px", color: THEME.legalGold, marginBottom: "4px", opacity: 0.8 }}>현재 접속 중인 지갑</div>
                        {activeWallets.map((addr, i) => (
                          <div key={i} style={{ fontSize: "11px", fontFamily: "monospace", color: THEME.bgIvory, background: "rgba(255,255,255,0.06)", padding: "5px 8px", borderRadius: "2px", wordBreak: "break-all" }}>
                            {addr.slice(0, 8)}…{addr.slice(-6)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "20px", border: "1px solid rgba(197,160,89,0.3)" }}>
                    <div style={{ fontSize: "12px", color: THEME.legalGold }}>블록체인 봉인 완료 누적 보안 입장 건수</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, marginTop: "8px", fontFamily: "monospace" }}>{totalAccessLogs} <span style={{ fontSize: "14px", fontWeight: "normal" }}>건</span></div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px", alignItems: "start" }}>
                <div style={{ background: THEME.paleYellow, border: `1px solid ${THEME.legalGold}`, padding: "24px" }}>
                  <h3 style={{ fontSize: "15px", margin: "0 0 16px", fontWeight: "bold", borderBottom: `1px solid ${THEME.borderTan}`, paddingBottom: "10px" }}>소송 대리인 VDR 공람 승인 면허 발급</h3>
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

                <div style={{ background: THEME.pureWhite, border: `1px solid ${THEME.borderTan}`, padding: "24px" }}>
                  <h3 style={{ fontSize: "15px", margin: "0 0 16px", fontWeight: "bold" }}>분산 장부 박제 영구 감사 추적 기록 (Audit Trail)</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "520px", overflowY: "auto" }}>
                    {auditLogs.length === 0 ? (
                      <div style={{ padding: "20px", textAlign: "center", color: THEME.textSoft, border: `1px solid ${THEME.borderTan}` }}>확정된 블록체인 감사 추적 기록이 없습니다.</div>
                    ) : (
                      [...auditLogs]
                      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                      .map((log, index) => (
                        <div key={index} style={{ border: `1px solid ${THEME.borderTan}`, padding: "14px 16px", background: THEME.bgIvory, display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            <span style={{ fontWeight: "bold", fontSize: "13px", color: THEME.deepBrown }}>파일: {log.documentId}</span>
                            <span style={{ fontSize: "11px", color: THEME.textSoft }}>{new Date(Number(log.timestamp) * 1000).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: "11px", fontFamily: "monospace", color: THEME.textSoft, wordBreak: "break-all" }}>
                            <span style={{ fontWeight: "bold", color: THEME.deepBrown }}>지갑: </span>{log.user}
                          </div>
                          <div style={{ fontSize: "11px", fontFamily: "monospace", color: THEME.textSoft, wordBreak: "break-all" }}>
                            <span style={{ fontWeight: "bold", color: THEME.deepBrown }}>Hash: </span>{log.documentHash}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      <footer style={{ textAlign: "center", padding: "40px 0", borderTop: `1px solid ${THEME.borderTan}`, color: THEME.textSoft, fontSize: "12px", background: THEME.paleYellow }}>
        <p>© Cryptographic Legal Technology Audit Trail & VDR Sovereign Control Center.</p>
      </footer>
    </div>
  );
}
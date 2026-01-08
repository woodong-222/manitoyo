import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../../components/FormField";
import {
  getMyTarget,
  getParticipantByName,
  rematchToNewRoom,
  revealRoom,
  setParticipantPassword,
  subscribeParticipants,
  subscribeRoom,
} from "../../utils/firestore";
import type { Participant, Room } from "../../utils/types";
import "./AuthPage.css";
import kakaoLogo from "../../assets/kakaotalk.png";

function AuthPage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [personalPassword, setPersonalPassword] = useState("");
  const [targetName, setTargetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lockRoomId, setLockRoomId] = useState(false);
  const [lockName, setLockName] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isPasswordErrorModalOpen, setIsPasswordErrorModalOpen] =
    useState(false);
  const [isRevealConfirmOpen, setIsRevealConfirmOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRematchConfirmOpen, setIsRematchConfirmOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [sharePassword, setSharePassword] = useState("");
  const [isRevealResultModalOpen, setIsRevealResultModalOpen] =
    useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(
    "비밀번호가 일치하지 않습니다."
  );
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    const nameParam = searchParams.get("name");
    if (roomIdParam) {
      setRoomId(roomIdParam);
      setLockRoomId(true);
    }
    if (nameParam) {
      setName(nameParam);
      setLockName(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadParticipant = async () => {
      if (!roomId || !name) return;
      try {
        const participant = await getParticipantByName(roomId, name);
        if (!participant) {
          return;
        }
        setParticipantId(participant.id);
        setHasPassword(Boolean(participant.personalPassword));
        setTargetName("");
      } catch (error) {
        console.error(error);
      }
    };
    loadParticipant();
  }, [roomId, name]);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribeRoom = subscribeRoom(roomId, setRoom);
    const unsubscribeParticipants = subscribeParticipants(
      roomId,
      setParticipants
    );
    return () => {
      unsubscribeRoom();
      unsubscribeParticipants();
    };
  }, [roomId]);

  const allJoined =
    participants.length > 0 && participants.every((item) => item.isJoined);
  const isHost = room?.hostName && name === room.hostName;

  useEffect(() => {
    if (room?.isRevealed && isHost) {
      setIsRevealResultModalOpen(true);
    }
  }, [room?.isRevealed, isHost]);

  const handleSubmit = async () => {
    setTargetName("");
    if (!roomId || !name || !personalPassword) {
      return;
    }
    try {
      setLoading(true);
      if (hasPassword) {
        const result = await getMyTarget({
          roomId,
          name,
          personalPassword,
        });
        if (!result) {
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
          setIsPasswordErrorModalOpen(true);
          return;
        }
        setTargetName(result.targetName);
        setIsTargetModalOpen(true);
      } else {
        if (!participantId) {
          return;
        }
        if (personalPassword !== confirmPassword) {
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
          setIsPasswordErrorModalOpen(true);
          return;
        }
        await setParticipantPassword({
          roomId,
          participantId,
          personalPassword,
        });
        const result = await getMyTarget({
          roomId,
          name,
          personalPassword,
        });
        if (!result) {
          setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
          setIsPasswordErrorModalOpen(true);
          return;
        }
        setHasPassword(true);
        setTargetName(result.targetName);
        setIsTargetModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__wrap">
        <div className="auth-page__circle" />
        <div className="auth-page__content">
          <div className="auth-page__panel">
            <div className="auth-page__heading">
              <h2 className="auth-page__title">마니또 확인하기</h2>
            </div>
            <p className="auth-page__subtitle">
              본인만 알고 있는 비밀번호로 마니또를 확인하세요.
            </p>
            <div className="auth-page__form">
              {lockRoomId ? null : (
                <FormField
                  label="방 ID"
                  value={roomId}
                  onChange={setRoomId}
                  placeholder="방 ID"
                />
              )}
              <FormField
                label="이름"
                value={name}
                onChange={setName}
                placeholder="본인 이름"
                disabled={lockName}
              />
              <FormField
                label={hasPassword ? "개인 비밀번호" : "초기 비밀번호"}
                value={personalPassword}
                onChange={setPersonalPassword}
                placeholder="개인 비밀번호를 설정해주세요."
                type="text"
              />
              {!hasPassword ? (
                <FormField
                  label="비밀번호 확인"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="다시 입력"
                  type="text"
                />
              ) : null}
              <div className="auth-page__actions">
                <button
                  onClick={() => navigate(-1)}
                  aria-label="뒤로가기"
                  className="auth-page__back"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="auth-page__back-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                {room && !room.isRevealed && allJoined && isHost ? (
                  <button
                    onClick={async () => {
                      if (!personalPassword) {
                        setPasswordErrorMessage(
                          "개인 비밀번호를 입력해 주세요."
                        );
                        setIsPasswordErrorModalOpen(true);
                        return;
                      }
                      const result = await getMyTarget({
                        roomId,
                        name,
                        personalPassword,
                      });
                      if (!result) {
                        setPasswordErrorMessage(
                          "개인 비밀번호가 일치하지 않습니다."
                        );
                        setIsPasswordErrorModalOpen(true);
                        return;
                      }
                      setIsRevealConfirmOpen(true);
                    }}
                    className="auth-page__reveal"
                  >
                    결과 공개
                  </button>
                ) : null}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="auth-page__submit"
                >
                  {loading
                    ? "확인 중..."
                    : hasPassword
                    ? "마니또 확인"
                    : "비밀번호 설정"}
                </button>
              </div>
              {room && isHost ? (
                <div className="auth-page__host-actions">
                  <button
                    onClick={() => {
                      if (!room) return;
                      const link = `${
                        window.location.origin
                      }/entry?roomId=${encodeURIComponent(
                        room.id
                      )}&title=${encodeURIComponent(room.title)}`;
                      setShareTitle(room.title);
                      setShareLink(link);
                      setSharePassword(room.masterPassword ?? "");
                      setCopied(false);
                      setMessageCopied(false);
                      setIsShareModalOpen(true);
                    }}
                    className="auth-page__share"
                  >
                    공유하기
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {isTargetModalOpen ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--solid">
            <div className="auth-page__modal-header">
              <div>
                <h3 className="auth-page__modal-title">내 마니또</h3>
                <p className="auth-page__modal-subtitle">
                  지금부터 마니또를 챙겨주세요.
                </p>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="auth-page__modal-close-text"
              >
                닫기
              </button>
            </div>
            <div className="auth-page__target-box">{targetName}</div>
          </div>
        </div>
      ) : null}
      {isRevealConfirmOpen ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--blur">
            <h3 className="auth-page__modal-title">전체 공개</h3>
            <p className="auth-page__modal-subtitle">
              모든 사용자에게 결과가 공개됩니다.
            </p>
            <div className="auth-page__modal-row">
              <button
                onClick={() => setIsRevealConfirmOpen(false)}
                className="auth-page__modal-button auth-page__modal-button--ghost"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await revealRoom(roomId);
                  } finally {
                    setLoading(false);
                    setIsRevealConfirmOpen(false);
                  }
                }}
                className="auth-page__modal-button auth-page__modal-button--solid"
              >
                전체 공개
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isRevealResultModalOpen && room?.isRevealed && isHost ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--blur">
            <div className="auth-page__modal-header">
              <div>
                <h3 className="auth-page__modal-title">전체 공개</h3>
                <p className="auth-page__modal-subtitle">
                  모든 참여자가 결과를 확인할 수 있어요.
                </p>
              </div>
              <button
                onClick={() => setIsRevealResultModalOpen(false)}
                aria-label="닫기"
                className="auth-page__modal-close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="auth-page__modal-close-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="auth-page__result-list">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="auth-page__result-item"
                >
                  {participant.name} → {participant.targetName}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setIsRevealResultModalOpen(false);
                setIsRematchConfirmOpen(true);
              }}
              className="auth-page__modal-cta"
            >
              다시 진행하기
            </button>
          </div>
        </div>
      ) : null}
      {isShareModalOpen ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--blur">
            <div className="auth-page__modal-header">
              <div>
                <h3 className="auth-page__modal-title">다시 공유하기</h3>
                <p className="auth-page__modal-subtitle">
                  방 링크를 다시 공유하세요.
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                aria-label="닫기"
                className="auth-page__modal-close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="auth-page__modal-close-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="auth-page__share-row">
              모임 이름:{" "}
              <span className="auth-page__share-strong">{shareTitle}</span>
            </div>
            <div className="auth-page__share-link-box">
              <div className="auth-page__share-link">{shareLink}</div>
              <button
                onClick={async () => {
                  if (!navigator.clipboard) return;
                  await navigator.clipboard.writeText(shareLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="auth-page__copy"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="auth-page__copy-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15V5a2 2 0 012-2h10" />
                </svg>
                {copied ? "복사됨" : "링크 복사"}
              </button>
            </div>
            <div className="auth-page__message">
              <p className="auth-page__message-title">공유 메시지</p>
              <p className="auth-page__message-text">
                {`[${shareTitle}] 마니또 방이 개설되었어요!\n참여 링크: ${shareLink}\n모임 이름: ${shareTitle}\n방 비밀번호: ${sharePassword}`}
              </p>
              <div className="auth-page__message-actions">
                <button
                  onClick={async () => {
                    if (!navigator.clipboard) return;
                    await navigator.clipboard.writeText(
                      `[${shareTitle}] 마니또 방이 개설되었어요!\n참여 링크: ${shareLink}\n모임 이름: ${shareTitle}\n방 비밀번호: ${sharePassword}`
                    );
                    setMessageCopied(true);
                    setTimeout(() => setMessageCopied(false), 2000);
                  }}
                  className="auth-page__message-copy"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="auth-page__copy-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" />
                  </svg>
                  {messageCopied ? "메시지 복사됨" : "메시지 복사"}
                </button>
                <button
                  onClick={() => {
                    const templateId = Number(
                      import.meta.env.VITE_KAKAO_TEMPLATE_ID
                    );
                    if (!window.Kakao || !templateId) {
                      return;
                    }
                    const url = new URL(shareLink);
                    const urlPath = `${url.pathname}${url.search}`;
                    window.Kakao.Share.sendCustom({
                      templateId,
                      templateArgs: {
                        password: sharePassword,
                        name: shareTitle,
                        url: urlPath,
                      },
                    });
                  }}
                  className="auth-page__kakao"
                >
                  <span className="auth-page__kakao-icon">
                    <img
                      src={kakaoLogo}
                      alt="KakaoTalk"
                      className="auth-page__kakao-image"
                    />
                  </span>
                  카카오톡 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {isRematchConfirmOpen ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--blur auth-page__modal-card--small">
            <h3 className="auth-page__modal-title">다시 매칭</h3>
            <p className="auth-page__modal-subtitle">
              마니또를 다시 매칭하고 공개를 초기화합니다.
            </p>
            <div className="auth-page__modal-row">
              <button
                onClick={() => setIsRematchConfirmOpen(false)}
                className="auth-page__modal-button auth-page__modal-button--ghost"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const result = await rematchToNewRoom(roomId);
                    if (!result) return;
                    const link = `${
                      window.location.origin
                    }/entry?roomId=${encodeURIComponent(
                      result.roomId
                    )}&title=${encodeURIComponent(result.title)}`;
                    setShareTitle(result.title);
                    setShareLink(link);
                    setSharePassword(room?.masterPassword ?? "");
                    setCopied(false);
                    setMessageCopied(false);
                    setIsShareModalOpen(true);
                  } finally {
                    setLoading(false);
                    setIsRematchConfirmOpen(false);
                  }
                }}
                className="auth-page__modal-button auth-page__modal-button--solid"
              >
                다시 매칭
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isPasswordErrorModalOpen ? (
        <div className="auth-page__modal">
          <div className="auth-page__modal-card auth-page__modal-card--solid auth-page__modal-card--small">
            <h3 className="auth-page__modal-title">비밀번호 오류</h3>
            <p className="auth-page__modal-subtitle">{passwordErrorMessage}</p>
            <button
              onClick={() => {
                setIsPasswordErrorModalOpen(false);
                setPasswordErrorMessage("비밀번호가 일치하지 않습니다.");
              }}
              className="auth-page__modal-cta"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AuthPage;
